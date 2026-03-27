<script setup lang="ts">
import { computed } from 'vue';
import { ElProgress, ElTag, ElAlert } from 'element-plus';

defineOptions({ name: 'BalanceIndicator' });

interface Props {
  balanceRate: number;
  isBalanced: boolean;
  lossPercent: number;
}

const props = defineProps<Props>();

// Status type based on balance rate
const statusType = computed(() => {
  if (props.balanceRate >= 95) return 'success';
  if (props.balanceRate >= 85) return 'warning';
  return 'danger';
});

// Progress bar color
const progressColor = computed(() => {
  if (props.balanceRate >= 95) return '#67C23A';
  if (props.balanceRate >= 85) return '#E6A23C';
  return '#F56C6C';
});
</script>

<template>
  <div class="balance-indicator">
    <div class="balance-header">
      <span class="label">能量平衡率</span>
      <ElTag :type="statusType" size="small">
        {{ balanceRate.toFixed(1) }}%
      </ElTag>
    </div>

    <ElProgress
      :percentage="balanceRate"
      :color="progressColor"
      :stroke-width="12"
      :show-text="false"
    />

    <ElAlert
      v-if="!isBalanced"
      type="error"
      title="能量不平衡告警"
      :description="`损耗率 ${lossPercent.toFixed(1)}%，请检查计量点数据`"
      show-icon
      closable
      class="mt-12px"
    />
  </div>
</template>

<style scoped>
.balance-indicator {
  padding: 16px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  margin-bottom: 16px;
}

.balance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.mt-12px {
  margin-top: 12px;
}
</style>