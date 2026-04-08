<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  ElAlert,
  ElButton,
  ElDivider,
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElTag
} from 'element-plus';
import { fetchGetRuleConfigList, fetchValidateConfig } from '@/service/api/scheduling/rule-engine';

interface Props {
  visible: boolean;
  patternId?: number;
  initialConfig?: {
    ruleBindingId?: number;
    ruleConfig?: string;
    baseTemplateId?: number;
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'save', config: RotationRuleConfig): void;
}>();

interface RotationRuleConfig {
  ruleBindingId: number;
  ruleConfig: string;
  baseTemplateId?: number;
  rotationType: 'fixed' | 'rotating' | 'mixed';
}

const loading = ref(false);
const validating = ref(false);
const availableRules = ref<Api.Scheduling.RuleConfig[]>([]);
const validationResult = ref<Api.Scheduling.ValidateConfigResponse | null>(null);

const formData = ref<RotationRuleConfig>({
  ruleBindingId: 0,
  ruleConfig: '{}',
  baseTemplateId: undefined,
  rotationType: 'rotating'
});

// 预设轮班规则配置
const presetConfigs: Record<string, string> = {
  five_team_four_rotation: JSON.stringify(
    {
      patternType: 1,
      cycleDays: 8,
      workDaysPerCycle: 6,
      restDaysPerCycle: 2,
      teamsCount: 5,
      rotationInterval: 1,
      description: '五班四运转标准配置'
    },
    null,
    2
  ),
  six_team_five_rotation: JSON.stringify(
    {
      patternType: 2,
      cycleDays: 7,
      workDaysPerCycle: 6,
      restDaysPerCycle: 1,
      teamsCount: 6,
      rotationInterval: 1,
      description: '六班五运转标准配置'
    },
    null,
    2
  ),
  four_team_three_rotation: JSON.stringify(
    {
      patternType: 3,
      cycleDays: 6,
      workDaysPerCycle: 4,
      restDaysPerCycle: 2,
      teamsCount: 4,
      rotationInterval: 2,
      description: '四班三运转标准配置'
    },
    null,
    2
  )
};

async function loadAvailableRules() {
  loading.value = true;
  try {
    const { data } = await fetchGetRuleConfigList({ ruleType: 3, status: 1, page: 1, pageSize: 50 });
    availableRules.value = data?.list || [];
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.visible,
  visible => {
    if (visible) {
      loadAvailableRules();
      if (props.initialConfig) {
        formData.value = {
          ruleBindingId: props.initialConfig.ruleBindingId || 0,
          ruleConfig: props.initialConfig.ruleConfig || '{}',
          baseTemplateId: props.initialConfig.baseTemplateId,
          rotationType: 'rotating'
        };
      }
    }
  }
);

function handleRuleChange(ruleId: number) {
  formData.value.ruleBindingId = ruleId;
  const rule = availableRules.value.find(r => r.id === ruleId);
  if (rule?.defaultConfig) {
    formData.value.ruleConfig = rule.defaultConfig;
  } else {
    formData.value.ruleConfig = presetConfigs.five_team_four_rotation;
  }
  validationResult.value = null;
}

function applyPreset(preset: string) {
  formData.value.ruleConfig = presetConfigs[preset];
  validationResult.value = null;
}

async function handleValidate() {
  validating.value = true;
  try {
    const { data } = await fetchValidateConfig({
      ruleType: 3,
      configValue: formData.value.ruleConfig
    });
    validationResult.value = data || null;
    if (data?.valid) {
      ElMessage.success('配置校验通过');
    } else {
      ElMessage.warning('配置校验未通过，请检查错误');
    }
  } finally {
    validating.value = false;
  }
}

function handleClose() {
  emit('update:visible', false);
}

function handleSave() {
  if (!formData.value.ruleBindingId) {
    ElMessage.warning('请选择轮班规则');
    return;
  }

  try {
    JSON.parse(formData.value.ruleConfig);
  } catch {
    ElMessage.error('规则配置格式错误，请检查JSON格式');
    return;
  }

  emit('save', formData.value);
  handleClose();
}

const isValid = computed(() => validationResult.value?.valid === true && !validationResult.value?.errors?.length);
</script>

<template>
  <ElDrawer :model-value="visible" title="轮班规则配置" size="600px" @close="handleClose">
    <ElForm :model="formData" label-position="top">
      <ElFormItem label="轮班类型">
        <ElRadioGroup v-model="formData.rotationType">
          <ElRadio value="fixed">固定班次</ElRadio>
          <ElRadio value="rotating">轮换班次</ElRadio>
          <ElRadio value="mixed">混合模式</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="选择轮班规则" required>
        <ElSelect
          v-model="formData.ruleBindingId"
          placeholder="请选择轮班算法规则"
          class="w-full"
          @change="handleRuleChange"
        >
          <ElOption v-for="rule in availableRules" :key="rule.id" :label="rule.ruleName" :value="rule.id">
            <div class="flex items-center justify-between">
              <span>{{ rule.ruleName }}</span>
              <ElTag type="info" size="small">{{ rule.ruleCode }}</ElTag>
            </div>
          </ElOption>
        </ElSelect>
      </ElFormItem>

      <ElDivider content-position="left">快速预设</ElDivider>

      <ElFormItem label="常用排班模式">
        <div class="flex flex-wrap gap-2">
          <ElButton size="small" @click="applyPreset('five_team_four_rotation')">五班四运转</ElButton>
          <ElButton size="small" @click="applyPreset('six_team_five_rotation')">六班五运转</ElButton>
          <ElButton size="small" @click="applyPreset('four_team_three_rotation')">四班三运转</ElButton>
        </div>
      </ElFormItem>

      <ElDivider content-position="left">详细配置</ElDivider>

      <ElFormItem label="规则配置" required>
        <ElInput
          v-model="formData.ruleConfig"
          type="textarea"
          :rows="12"
          placeholder="请输入JSON格式的规则配置"
          class="font-mono"
        />
      </ElFormItem>

      <div class="mb-4 flex justify-end">
        <ElButton :loading="validating" @click="handleValidate">校验配置</ElButton>
      </div>

      <ElAlert v-if="validationResult" :type="isValid ? 'success' : 'error'" :closable="false" class="mb-4">
        <template #title>
          <div class="text-sm">
            <p class="font-bold">{{ isValid ? '校验通过' : '校验失败' }}</p>
            <ul v-if="validationResult.errors?.length" class="mt-2 list-disc pl-4">
              <li v-for="(err, idx) in validationResult.errors" :key="idx" class="text-red-500">
                {{ err.field }}: {{ err.message }}
              </li>
            </ul>
          </div>
        </template>
      </ElAlert>

      <ElAlert type="info" :closable="false" class="mt-4">
        <template #title>
          <div class="text-sm">
            <p class="mb-2 font-bold">配置参数说明：</p>
            <ul class="list-disc pl-4">
              <li>
                <strong>patternType</strong>
                : 模式类型（1=五班四运转, 2=六班五运转, 等）
              </li>
              <li>
                <strong>cycleDays</strong>
                : 一个完整周期的天数
              </li>
              <li>
                <strong>workDaysPerCycle</strong>
                : 每周期工作天数
              </li>
              <li>
                <strong>restDaysPerCycle</strong>
                : 每周期休息天数
              </li>
              <li>
                <strong>teamsCount</strong>
                : 班组数量
              </li>
              <li>
                <strong>rotationInterval</strong>
                : 轮换间隔（天）
              </li>
            </ul>
          </div>
        </template>
      </ElAlert>
    </ElForm>

    <template #footer>
      <div class="flex justify-end gap-2">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSave">保存配置</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>
