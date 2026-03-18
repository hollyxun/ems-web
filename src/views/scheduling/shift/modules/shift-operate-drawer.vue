<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { fetchCreateShift, fetchUpdateShift } from '@/service/api/scheduling';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'ShiftOperateDrawer' });

interface Props {
  visible: boolean;
  operateType: UI.TableOperateType;
  rowData?: Api.Scheduling.Shift | null;
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
    add: '新增班次',
    edit: '编辑班次'
  };
  return titles[props.operateType];
});

const shiftTypeOptions = [
  { label: '早班', value: 1 },
  { label: '中班', value: 2 },
  { label: '晚班', value: 3 },
  { label: '夜班', value: 4 },
  { label: '休息', value: 5 }
];

const model = ref<Partial<Api.Scheduling.Shift> & { startTime?: any; endTime?: any }>(createDefaultModel());

function createDefaultModel(): Partial<Api.Scheduling.Shift> {
  return {
    name: '',
    code: '',
    shiftType: 1,
    startTime: null,
    endTime: null,
    isNextDay: false,
    color: '#1890ff',
    sort: 0,
    status: 1,
    description: ''
  };
}

const rules: Record<string, App.Global.FormRule> = {
  name: defaultRequiredRule,
  code: defaultRequiredRule,
  shiftType: defaultRequiredRule,
  startTime: defaultRequiredRule,
  endTime: defaultRequiredRule,
  status: defaultRequiredRule
};

function handleInitModel() {
  model.value = createDefaultModel();
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
    // 处理时间
    if (props.rowData.startTime) {
      const timeStr = props.rowData.startTime.substring(11, 19);
      model.value.startTime = dayjs(`2024-01-01 ${timeStr}`).toDate();
    }
    if (props.rowData.endTime) {
      const timeStr = props.rowData.endTime.substring(11, 19);
      model.value.endTime = dayjs(`2024-01-01 ${timeStr}`).toDate();
    }
  }
}

async function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  // 转换时间格式
  const submitData = { ...model.value };
  if (model.value.startTime) {
    submitData.startTime = `${dayjs(model.value.startTime).format('YYYY-MM-DDTHH:mm:ss')}Z`;
  }
  if (model.value.endTime) {
    submitData.endTime = `${dayjs(model.value.endTime).format('YYYY-MM-DDTHH:mm:ss')}Z`;
  }

  const api = props.operateType === 'add' ? fetchCreateShift : fetchUpdateShift;
  const { error } = await api(submitData as Api.Scheduling.Shift);
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
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" size="500px">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="right" :label-width="100">
      <ElFormItem label="班次名称" prop="name">
        <ElInput v-model="model.name" placeholder="请输入班次名称" />
      </ElFormItem>
      <ElFormItem label="班次编码" prop="code">
        <ElInput v-model="model.code" placeholder="请输入班次编码" :disabled="operateType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="班次类型" prop="shiftType">
        <ElSelect v-model="model.shiftType" placeholder="请选择班次类型" style="width: 100%">
          <ElOption v-for="item in shiftTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="开始时间" prop="startTime">
        <ElTimePicker
          v-model="model.startTime"
          placeholder="请选择开始时间"
          format="HH:mm"
          value-format="HH:mm:ss"
          style="width: 100%"
        />
      </ElFormItem>
      <ElFormItem label="结束时间" prop="endTime">
        <ElTimePicker
          v-model="model.endTime"
          placeholder="请选择结束时间"
          format="HH:mm"
          value-format="HH:mm:ss"
          style="width: 100%"
        />
        <ElCheckbox v-model="model.isNextDay" class="mt-2">跨日</ElCheckbox>
      </ElFormItem>
      <ElFormItem label="颜色标识">
        <ElColorPicker v-model="model.color" />
      </ElFormItem>
      <ElFormItem label="排序">
        <ElInputNumber v-model="model.sort" :min="0" placeholder="请输入排序" />
      </ElFormItem>
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
    <template #footer>
      <ElSpace>
        <ElButton @click="closeDrawer">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
