<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElButton, ElCard, ElCollapse, ElCollapseItem, ElDescriptions, ElDescriptionsItem, ElTag } from 'element-plus';
import { fetchPreviewSchedule, fetchValidateConfig } from '@/service/api/scheduling/rule-engine';

interface Props {
  ruleType: number;
  configValue: string;
  factoryId?: number;
  previewDays?: number;
}

const props = withDefaults(defineProps<Props>(), {
  factoryId: 1,
  previewDays: 30
});

const validating = ref(false);
const previewing = ref(false);
const validationResult = ref<Api.Scheduling.ValidateConfigResponse | null>(null);
const previewResult = ref<Api.Scheduling.SchedulePreview | null>(null);
const activeCollapse = ref(['validation']);

const isValid = computed(() => validationResult.value?.valid === true && !validationResult.value?.errors?.length);

async function handleValidate() {
  if (!props.configValue) return;

  validating.value = true;
  try {
    const { data } = await fetchValidateConfig({
      ruleType: props.ruleType,
      configValue: props.configValue
    });
    validationResult.value = data || null;
  } finally {
    validating.value = false;
  }
}

async function handlePreview() {
  if (!props.factoryId || !props.configValue) return;

  previewing.value = true;
  try {
    const { data } = await fetchPreviewSchedule({
      ruleType: props.ruleType,
      configValue: props.configValue,
      factoryId: props.factoryId,
      previewDays: props.previewDays
    });
    previewResult.value = data || null;
    if (activeCollapse.value.includes('validation')) {
      activeCollapse.value.push('preview');
    }
  } finally {
    previewing.value = false;
  }
}

watch(
  () => props.configValue,
  () => {
    validationResult.value = null;
    previewResult.value = null;
  }
);

const ruleTypeLabel = computed(() => {
  const labels: Record<number, string> = { 1: '排班模式', 2: '日历映射', 3: '轮班算法' };
  return labels[props.ruleType] || '未知';
});
</script>

<template>
  <ElCard class="rule-preview-panel">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-lg font-bold">规则预览</span>
        <div class="flex gap-2">
          <ElButton type="primary" size="small" :loading="validating" @click="handleValidate">校验配置</ElButton>
          <ElButton
            type="success"
            size="small"
            :loading="previewing"
            :disabled="!props.factoryId"
            @click="handlePreview"
          >
            预览结果
          </ElButton>
        </div>
      </div>
    </template>

    <ElCollapse v-model="activeCollapse">
      <ElCollapseItem title="校验结果" name="validation">
        <div v-if="validationResult" class="space-y-4">
          <div class="flex items-center gap-2">
            <ElTag :type="isValid ? 'success' : 'danger'" size="large">
              {{ isValid ? '配置有效' : '配置无效' }}
            </ElTag>
          </div>

          <ElDescriptions v-if="isValid" :column="2" border>
            <ElDescriptionsItem label="规则类型">{{ ruleTypeLabel }}</ElDescriptionsItem>
            <ElDescriptionsItem label="校验时间">{{ validationResult.checkedAt || '-' }}</ElDescriptionsItem>
          </ElDescriptions>

          <div v-if="validationResult.errors?.length" class="mt-4">
            <div class="mb-2 text-red-500 font-bold">错误列表：</div>
            <ul class="list-disc pl-5">
              <li v-for="(err, idx) in validationResult.errors" :key="idx" class="text-red-500">
                {{ err.field }}: {{ err.message }}
              </li>
            </ul>
          </div>

          <div v-if="validationResult.warnings?.length" class="mt-4">
            <div class="mb-2 text-orange-500 font-bold">警告列表：</div>
            <ul class="list-disc pl-5">
              <li v-for="(warn, idx) in validationResult.warnings" :key="idx" class="text-orange-500">
                {{ warn.field }}: {{ warn.message }}
              </li>
            </ul>
          </div>
        </div>

        <div v-else class="py-4 text-center text-gray-400">点击"校验配置"按钮验证规则配置</div>
      </ElCollapseItem>

      <ElCollapseItem title="排班预览" name="preview">
        <div v-if="previewResult" class="space-y-4">
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="工厂ID">{{ previewResult.factoryId }}</ElDescriptionsItem>
            <ElDescriptionsItem label="预览天数">{{ previewResult.previewDays }}</ElDescriptionsItem>
            <ElDescriptionsItem label="生成班次数">{{ previewResult.generatedShifts?.length || 0 }}</ElDescriptionsItem>
            <ElDescriptionsItem label="生成日期数">{{ previewResult.generatedDates?.length || 0 }}</ElDescriptionsItem>
          </ElDescriptions>

          <div v-if="previewResult.generatedShifts?.length" class="mt-4">
            <div class="mb-2 font-bold">生成的班次安排：</div>
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border px-2 py-1">日期</th>
                    <th class="border px-2 py-1">班组</th>
                    <th class="border px-2 py-1">班次</th>
                    <th class="border px-2 py-1">班别</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(shift, idx) in previewResult.generatedShifts.slice(0, 10)" :key="idx">
                    <td class="border px-2 py-1">{{ shift.date }}</td>
                    <td class="border px-2 py-1">{{ shift.teamName }}</td>
                    <td class="border px-2 py-1">{{ shift.shiftName }}</td>
                    <td class="border px-2 py-1">{{ shift.shiftType }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="previewResult.generatedShifts.length > 10" class="mt-2 text-gray-400">
              仅显示前10条，共 {{ previewResult.generatedShifts.length }} 条
            </div>
          </div>

          <div v-if="previewResult.naturalMonthMapping?.length" class="mt-4">
            <div class="mb-2 font-bold">自然月映射：</div>
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border px-2 py-1">排班周期日期</th>
                    <th class="border px-2 py-1">自然月</th>
                    <th class="border px-2 py-1">边界类型</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(mapping, idx) in previewResult.naturalMonthMapping" :key="idx">
                    <td class="border px-2 py-1">{{ mapping.cycleDate }}</td>
                    <td class="border px-2 py-1">{{ mapping.naturalMonth }}</td>
                    <td class="border px-2 py-1">
                      <ElTag :type="mapping.boundaryType === 'same_year' ? 'success' : 'warning'" size="small">
                        {{ mapping.boundaryType }}
                      </ElTag>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else class="py-4 text-center text-gray-400">选择工厂后点击"预览结果"查看排班预览</div>
      </ElCollapseItem>
    </ElCollapse>
  </ElCard>
</template>

<style scoped>
.rule-preview-panel {
  margin-top: 16px;
}
</style>
