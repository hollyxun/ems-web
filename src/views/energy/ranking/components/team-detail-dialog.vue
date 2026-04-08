<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'TeamDetailDialog' });

interface Props {
  visible: boolean;
  data: Api.Energy.Ranking.TeamRankingItem | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
});

function handleClose() {
  emit('update:visible', false);
}
</script>

<template>
  <ElDialog v-model="dialogVisible" title="班组详情" width="600px" @close="handleClose">
    <template v-if="data">
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="班组名称">{{ data.teamName }}</ElDescriptionsItem>
        <ElDescriptionsItem label="班组编码">{{ data.teamCode }}</ElDescriptionsItem>
        <ElDescriptionsItem label="所属工厂">{{ data.factoryName }}</ElDescriptionsItem>
        <ElDescriptionsItem label="所属车间">{{ data.workshopName }}</ElDescriptionsItem>
        <ElDescriptionsItem label="能源介质">{{ data.energyMedium }}</ElDescriptionsItem>
        <ElDescriptionsItem label="当前排名">
          <ElTag :type="data.rank <= 3 ? 'success' : data.rank > 10 ? 'danger' : 'info'">第 {{ data.rank }} 名</ElTag>
        </ElDescriptionsItem>
      </ElDescriptions>

      <ElDivider content-position="left">能耗数据</ElDivider>

      <ElRow :gutter="20">
        <ElCol :span="6">
          <ElStatistic title="总能耗" :value="data.totalEnergy" suffix="kWh" />
        </ElCol>
        <ElCol :span="6">
          <ElStatistic title="产量" :value="data.productionOutput" />
        </ElCol>
        <ElCol :span="6">
          <ElStatistic title="单耗" :value="data.specificConsumption" :precision="4" />
        </ElCol>
        <ElCol :span="6">
          <ElStatistic title="成本" :value="data.cost" prefix="¥" :precision="2" />
        </ElCol>
      </ElRow>

      <ElDivider content-position="left">统计周期</ElDivider>

      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="开始时间">{{ data.periodStart }}</ElDescriptionsItem>
        <ElDescriptionsItem label="结束时间">{{ data.periodEnd }}</ElDescriptionsItem>
        <ElDescriptionsItem label="数据点数">{{ data.dataPoints }}</ElDescriptionsItem>
        <ElDescriptionsItem label="排名变化">
          <span :class="data.rankChange > 0 ? 'text-green-500' : data.rankChange < 0 ? 'text-red-500' : ''">
            {{ data.rankChange > 0 ? '+' : '' }}{{ data.rankChange || '-' }}
          </span>
        </ElDescriptionsItem>
      </ElDescriptions>
    </template>
  </ElDialog>
</template>
