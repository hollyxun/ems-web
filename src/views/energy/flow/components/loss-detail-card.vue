<script setup lang="ts">
import { ElCard, ElTable, ElTableColumn, ElTag } from 'element-plus';

defineOptions({ name: 'LossDetailCard' });

interface LossNode {
  id: string;
  name: string;
  depth: number;
  value: number;
  nodeType: string;
  orgId: number;
  metadata?: string;
}

interface Props {
  lossTotal: number;
  lossPercent: number;
  lossNodes: LossNode[];
}

defineProps<Props>();

// Format number with thousand separators
function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}
</script>

<template>
  <ElCard v-if="lossNodes.length > 0" class="loss-detail-card" shadow="hover">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-medium">损耗明细</span>
        <ElTag type="danger">{{ lossPercent.toFixed(1) }}%</ElTag>
      </div>
    </template>

    <div class="loss-summary mb-16px">
      <div class="text-24px text-red-500 font-bold">
        {{ formatNumber(lossTotal) }}
        <span class="text-14px text-gray-500 font-normal">kWh</span>
      </div>
      <div class="mt-4px text-12px text-gray-500">占总输入 {{ lossPercent.toFixed(2) }}%</div>
    </div>

    <ElTable :data="lossNodes" size="small" max-height="200">
      <ElTableColumn prop="name" label="损耗点" min-width="120" />
      <ElTableColumn prop="value" label="损耗量" width="120">
        <template #default="{ row }">{{ formatNumber(row.value) }} kWh</template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<style scoped>
.loss-detail-card {
  width: 300px;
  flex-shrink: 0;
}

.loss-summary {
  padding: 12px;
  background-color: #fef0f0;
  border-radius: 4px;
}

.mb-16px {
  margin-bottom: 16px;
}

.mt-4px {
  margin-top: 4px;
}

.text-24px {
  font-size: 24px;
}

.text-14px {
  font-size: 14px;
}

.text-12px {
  font-size: 12px;
}

.font-medium {
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}

.text-red-500 {
  color: #f56c6c;
}

.text-gray-500 {
  color: #909399;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}
</style>
