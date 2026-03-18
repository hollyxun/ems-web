<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  fetchCreateShiftPattern,
  fetchGeneratePatternDetails,
  fetchGetAllShifts,
  fetchGetAllTeams,
  fetchUpdateShiftPattern
} from '@/service/api/scheduling';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'ShiftPatternOperateDrawer' });

interface Props {
  visible: boolean;
  operateType: UI.TableOperateType;
  rowData?: Api.Scheduling.ShiftPattern | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<UI.TableOperateType, string> = {
    add: '新增排班模式',
    edit: '编辑排班模式'
  };
  return titles[props.operateType];
});

const patternTypeOptions = [
  { label: '五班四运转', value: 1, teamsCount: 5, cycleDays: 10 },
  { label: '四班三运转', value: 2, teamsCount: 4, cycleDays: 8 },
  { label: '三班两运转', value: 3, teamsCount: 3, cycleDays: 6 },
  { label: '两班制', value: 4, teamsCount: 2, cycleDays: 4 },
  { label: '长白班', value: 5, teamsCount: 1, cycleDays: 7 },
  { label: '自定义', value: 6, teamsCount: 0, cycleDays: 0 }
];

const allTeams = ref<Api.Scheduling.Team[]>([]);
const allShifts = ref<Api.Scheduling.Shift[]>([]);
const activeTab = ref('basic');
const patternDetails = ref<Api.Scheduling.ShiftPatternDetail[]>([]);
const selectedTeamIds = ref<number[]>([]);

const model = ref<Partial<Api.Scheduling.ShiftPatternResponse>>(createDefaultModel());

function createDefaultModel(): Partial<Api.Scheduling.ShiftPatternResponse> {
  return {
    name: '',
    code: '',
    patternType: 1,
    cycleDays: 10,
    workDaysPerCycle: 2,
    restDaysPerCycle: 2,
    teamsCount: 5,
    status: 1,
    description: '',
    details: []
  };
}

const rules: Record<string, App.Global.FormRule> = {
  name: defaultRequiredRule,
  code: defaultRequiredRule,
  patternType: defaultRequiredRule,
  cycleDays: defaultRequiredRule,
  workDaysPerCycle: defaultRequiredRule,
  restDaysPerCycle: defaultRequiredRule,
  status: defaultRequiredRule
};

async function loadTeams() {
  const { data } = await fetchGetAllTeams();
  if (data) {
    allTeams.value = data;
  }
}

async function loadShifts() {
  const { data } = await fetchGetAllShifts();
  if (data) {
    allShifts.value = data.filter(s => s.status === 1);
  }
}

function handlePatternTypeChange(value: number) {
  const config = patternTypeOptions.find(item => item.value === value);
  if (config && config.value !== 6) {
    model.value.cycleDays = config.cycleDays;
    model.value.teamsCount = config.teamsCount;
    model.value.workDaysPerCycle = Math.floor(config.cycleDays / 2);
    model.value.restDaysPerCycle = config.cycleDays - model.value.workDaysPerCycle;
  }
  patternDetails.value = [];
}

async function generatePatternDetails() {
  if (selectedTeamIds.value.length === 0) {
    ElMessage.warning('请至少选择一个班组');
    return;
  }
  if (!model.value.patternType || !model.value.cycleDays) {
    ElMessage.warning('请先完善模式基本信息');
    return;
  }

  const params: Api.Scheduling.GeneratePatternDetailsParams = {
    patternType: model.value.patternType,
    cycleDays: model.value.cycleDays || 0,
    workDaysPerCycle: model.value.workDaysPerCycle || 0,
    restDaysPerCycle: model.value.restDaysPerCycle || 0,
    teamIds: selectedTeamIds.value
  };

  const { data } = await fetchGeneratePatternDetails(params);
  if (data) {
    patternDetails.value = data;
    ElMessage.success('生成排班明细成功');
  }
}

function getTeamName(teamId: number) {
  return allTeams.value.find(t => t.id === teamId)?.name || '-';
}

function getTeamColor(teamId: number) {
  return allTeams.value.find(t => t.id === teamId)?.color || '#999';
}

function updateDetailShift(detail: Api.Scheduling.ShiftPatternDetail, shiftId: number) {
  detail.shiftId = shiftId;
  const shift = allShifts.value.find(s => s.id === shiftId);
  if (shift) {
    detail.shiftName = shift.name;
    detail.shiftColor = shift.color;
  }
}

function handleInitModel() {
  model.value = createDefaultModel();
  patternDetails.value = [];
  selectedTeamIds.value = [];
  activeTab.value = 'basic';

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
  }
}

async function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  if (patternDetails.value.length === 0) {
    ElMessage.warning('请先生成排班明细');
    activeTab.value = 'details';
    return;
  }

  const submitData = { ...model.value, details: patternDetails.value };
  const api = props.operateType === 'add' ? fetchCreateShiftPattern : fetchUpdateShiftPattern;
  const { error } = await api(submitData as Api.Scheduling.ShiftPatternResponse);
  if (!error) {
    ElMessage.success($t(props.operateType === 'add' ? 'common.addSuccess' : 'common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    loadTeams();
    loadShifts();
  }
});

onMounted(() => {
  loadTeams();
  loadShifts();
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" size="700px">
    <ElTabs v-model="activeTab" type="border-card">
      <!-- 基本信息 -->
      <ElTabPane label="基本信息" name="basic">
        <ElForm ref="formRef" :model="model" :rules="rules" label-position="right" :label-width="100">
          <ElRow :gutter="16">
            <ElCol :span="12">
              <ElFormItem label="模式名称" prop="name">
                <ElInput v-model="model.name" placeholder="请输入模式名称" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="模式编码" prop="code">
                <ElInput v-model="model.code" placeholder="请输入模式编码" :disabled="operateType === 'edit'" />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="16">
            <ElCol :span="12">
              <ElFormItem label="模式类型" prop="patternType">
                <ElSelect
                  v-model="model.patternType"
                  placeholder="请选择模式类型"
                  style="width: 100%"
                  @change="handlePatternTypeChange"
                >
                  <ElOption
                    v-for="item in patternTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="周期天数" prop="cycleDays">
                <ElInputNumber v-model="model.cycleDays" :min="1" :max="31" style="width: 100%" />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElRow :gutter="16">
            <ElCol :span="12">
              <ElFormItem label="工作天数" prop="workDaysPerCycle">
                <ElInputNumber v-model="model.workDaysPerCycle" :min="0" :max="model.cycleDays" style="width: 100%" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="休息天数" prop="restDaysPerCycle">
                <ElInputNumber v-model="model.restDaysPerCycle" :min="0" :max="model.cycleDays" style="width: 100%" />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <ElFormItem label="状态" prop="status">
            <ElRadioGroup v-model="model.status">
              <ElRadio :label="1">启用</ElRadio>
              <ElRadio :label="2">禁用</ElRadio>
            </ElRadioGroup>
          </ElFormItem>

          <ElFormItem label="描述">
            <ElInput v-model="model.description" type="textarea" :rows="3" placeholder="请输入描述" />
          </ElFormItem>
        </ElForm>
      </ElTabPane>

      <!-- 排班明细 -->
      <ElTabPane label="排班明细" name="details">
        <div class="mb-4">
          <ElForm label-position="right" :label-width="80">
            <ElFormItem label="选择班组">
              <ElSelect
                v-model="selectedTeamIds"
                multiple
                placeholder="请选择参与排班的班组"
                style="width: 70%"
                :disabled="model.patternType !== 6"
              >
                <ElOption
                  v-for="team in allTeams.filter(t => t.status === 1)"
                  :key="team.id"
                  :label="team.name"
                  :value="team.id"
                  class="flex items-center"
                >
                  <div class="flex items-center gap-2">
                    <div class="h-4 w-4 rounded" :style="{ backgroundColor: team.color }" />
                    <span>{{ team.name }}</span>
                  </div>
                </ElOption>
              </ElSelect>
              <ElButton type="primary" class="ml-2" @click="generatePatternDetails">生成排班明细</ElButton>
            </ElFormItem>
          </ElForm>
        </div>

        <ElAlert
          v-if="patternDetails.length === 0"
          title="请先生成排班明细"
          type="info"
          :closable="false"
          class="mb-4"
        />

        <ElTable v-else :data="patternDetails" border height="400px">
          <ElTableColumn type="index" label="序号" width="60" align="center" />
          <ElTableColumn label="班组" width="120" align="center">
            <template #default="{ row }">
              <div class="flex items-center justify-center gap-2">
                <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: getTeamColor(row.teamId) }" />
                <span>{{ getTeamName(row.teamId) }}</span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="周期第几天" width="100" align="center">
            <template #default="{ row }">第{{ row.dayIndex + 1 }}天</template>
          </ElTableColumn>

          <ElTableColumn label="班次" min-width="150" align="center">
            <template #default="{ row }">
              <ElSelect
                v-model="row.shiftId"
                placeholder="请选择班次"
                style="width: 100%"
                @change="(val: number) => updateDetailShift(row, val)"
              >
                <ElOption v-for="shift in allShifts" :key="shift.id" :label="shift.name" :value="shift.id">
                  <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded" :style="{ backgroundColor: shift.color }" />
                    <span>{{ shift.name }}</span>
                  </div>
                </ElOption>
              </ElSelect>
            </template>
          </ElTableColumn>

          <ElTableColumn label="是否工作日" width="100" align="center">
            <template #default="{ row }">
              <ElTag :type="row.isWorkDay ? 'success' : 'info'" size="small">
                {{ row.isWorkDay ? '是' : '否' }}
              </ElTag>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElTabPane>
    </ElTabs>

    <template #footer>
      <ElSpace>
        <ElButton @click="closeDrawer">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
