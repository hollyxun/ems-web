<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  ElAlert,
  ElButton,
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
  ElTag
} from 'element-plus';
import { fetchGetRuleConfigList } from '@/service/api/scheduling/rule-engine';

interface CalendarMappingConfig {
  mappingRuleId?: number;
  mappingConfig?: string;
  naturalMonthStart?: number;
}

interface Props {
  visible: boolean;
  calendarId?: number;
  initialConfig?: CalendarMappingConfig;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'save', config: CalendarMappingConfig): void;
}>();

interface FormData {
  mappingRuleId: number;
  mappingConfig: string;
  naturalMonthStart: number;
  calendarType: 'rule_based' | 'manual';
}

const loading = ref(false);
const availableRules = ref<Api.Scheduling.RuleConfig[]>([]);

const formData = ref<FormData>({
  mappingRuleId: 0,
  mappingConfig: '{}',
  naturalMonthStart: 25,
  calendarType: 'rule_based'
});

// 预设日历映射配置
const presetConfigs: Record<string, string> = {
  natural_month: JSON.stringify(
    {
      startDay: formData.value.naturalMonthStart,
      totalDays: 31,
      boundaryMode: 'same_year',
      description: '自然月映射标准模板'
    },
    null,
    2
  ),
  custom_cycle: JSON.stringify(
    {
      startDay: formData.value.naturalMonthStart,
      totalDays: 30,
      boundaryMode: 'cross_year',
      description: '自定义周期映射'
    },
    null,
    2
  )
};

async function loadAvailableRules() {
  loading.value = true;
  try {
    const { data } = await fetchGetRuleConfigList({ ruleType: 2, status: 1, page: 1, pageSize: 50 });
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
          mappingRuleId: props.initialConfig.mappingRuleId || 0,
          mappingConfig: props.initialConfig.mappingConfig || '{}',
          naturalMonthStart: props.initialConfig.naturalMonthStart || 25,
          calendarType: 'rule_based'
        };
      }
    }
  }
);

function handleRuleChange(ruleId: number) {
  formData.value.mappingRuleId = ruleId;
  const rule = availableRules.value.find(r => r.id === ruleId);
  if (rule?.defaultConfig) {
    try {
      const config = JSON.parse(rule.defaultConfig);
      config.startDay = formData.value.naturalMonthStart;
      formData.value.mappingConfig = JSON.stringify(config, null, 2);
    } catch {
      formData.value.mappingConfig = presetConfigs.natural_month;
    }
  } else {
    formData.value.mappingConfig = presetConfigs.natural_month;
  }
}

function applyPreset(preset: string) {
  const config = JSON.parse(presetConfigs[preset]);
  config.startDay = formData.value.naturalMonthStart;
  formData.value.mappingConfig = JSON.stringify(config, null, 2);
}

function handleClose() {
  emit('update:visible', false);
}

function handleSave() {
  if (!formData.value.mappingRuleId) {
    ElMessage.warning('请选择日历映射规则');
    return;
  }

  try {
    JSON.parse(formData.value.mappingConfig);
  } catch {
    ElMessage.error('映射配置格式错误，请检查JSON格式');
    return;
  }

  emit('save', formData.value);
  handleClose();
}
</script>

<template>
  <ElDrawer :model-value="visible" title="日历映射规则配置" size="600px" @close="handleClose">
    <ElForm :model="formData" label-position="top">
      <ElFormItem label="日历生成方式">
        <ElSelect v-model="formData.calendarType" class="w-full">
          <ElOption label="基于规则映射" value="rule_based" />
          <ElOption label="手动配置" value="manual" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem v-if="formData.calendarType === 'rule_based'" label="选择映射规则" required>
        <ElSelect
          v-model="formData.mappingRuleId"
          placeholder="请选择日历映射规则"
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

      <ElFormItem label="起始日期（日）">
        <ElInputNumber v-model="formData.naturalMonthStart" :min="1" :max="31" placeholder="工厂月起始日" />
        <span class="ml-2 text-gray-500">（例如：25 表示每月25日起算）</span>
      </ElFormItem>

      <ElFormItem v-if="formData.calendarType === 'rule_based'" label="快速预设">
        <div class="flex gap-2">
          <ElButton size="small" @click="applyPreset('natural_month')">自然月映射</ElButton>
          <ElButton size="small" @click="applyPreset('custom_cycle')">自定义周期</ElButton>
        </div>
      </ElFormItem>

      <ElFormItem v-if="formData.calendarType === 'rule_based'" label="映射配置" required>
        <ElInput
          v-model="formData.mappingConfig"
          type="textarea"
          :rows="10"
          placeholder="请输入JSON格式的映射配置"
          class="font-mono"
        />
      </ElFormItem>

      <ElAlert v-if="formData.calendarType === 'rule_based'" type="info" :closable="false" class="mt-4">
        <template #title>
          <div class="text-sm">
            <p class="mb-2 font-bold">配置说明：</p>
            <ul class="list-disc pl-4">
              <li>
                <strong>startDay</strong>
                : 工厂月起始日期（如 25 表示每月25日开始）
              </li>
              <li>
                <strong>totalDays</strong>
                : 一个周期的总天数
              </li>
              <li>
                <strong>boundaryMode</strong>
                : 边界处理方式（same_year 同年 / cross_year 跨年）
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
