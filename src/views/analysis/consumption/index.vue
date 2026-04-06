<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { FormInstance } from 'element-plus';
import dayjs from 'dayjs';
import {
  type ConsumptionAnalysisVO,
  type ProductEnergyAnalysisVO,
  type RankingEnergyData,
  fetchGetByArea,
  fetchGetComprehensiveEnergy,
  fetchGetEnergyRanking,
  fetchGetProdEnergy,
  fetchGetYOY
} from '@/service/api/consumption-analysis';

defineOptions({ name: 'ConsumptionAnalysis' });

// 查询表单
const queryForm = ref({
  nodeId: '1',
  timeType: 'MONTH' as 'DAY' | 'MONTH' | 'YEAR',
  dataTime: dayjs().format('YYYY-MM-DD'),
  energyType: 'E001',
  analysisType: 'YOY' as 'YOY' | 'QOQ'
});

// 加载状态
const loading = ref(false);

// 能耗分析数据
const analysisData = ref<ConsumptionAnalysisVO | null>(null);

// 同比环比数据
const yoyData = ref<ConsumptionAnalysisVO | null>(null);

// 能耗排名数据
const rankingData = ref<RankingEnergyData[]>([]);

// 产品单耗数据
const prodEnergyData = ref<ProductEnergyAnalysisVO | null>(null);

// 当前激活的标签页
const activeTab = ref('area');

// 时间类型选项
const timeTypeOptions = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

// 分析类型选项
const analysisTypeOptions = [
  { label: '同比', value: 'YOY' },
  { label: '环比', value: 'QOQ' }
];

// 能源类型选项
const energyTypeOptions = [
  { label: '电力', value: 'E001' },
  { label: '天然气', value: 'E002' },
  { label: '蒸汽', value: 'E003' },
  { label: '水', value: 'E004' }
];

// 计算同比环比统计卡片数据
const tongbiCard = computed(() => yoyData.value?.tongbi);
const huanbiCard = computed(() => yoyData.value?.huanbi);

// 查询数据
async function handleQuery() {
  loading.value = true;
  try {
    const params = {
      nodeId: queryForm.value.nodeId,
      timeType: queryForm.value.timeType,
      dataTime: queryForm.value.dataTime,
      energyType: queryForm.value.energyType,
      analysisType: queryForm.value.analysisType
    };

    // 根据当前标签页查询对应数据
    if (activeTab.value === 'area') {
      const result = await fetchGetByArea(params);
      analysisData.value = result;
    } else if (activeTab.value === 'comprehensive') {
      const result = await fetchGetComprehensiveEnergy({
        nodeId: params.nodeId,
        timeType: params.timeType,
        dataTime: params.dataTime
      });
      analysisData.value = result;
    } else if (activeTab.value === 'ranking') {
      const result = await fetchGetEnergyRanking({
        nodeId: params.nodeId,
        timeType: params.timeType,
        dataTime: params.dataTime
      });
      rankingData.value = result;
    } else if (activeTab.value === 'prodEnergy') {
      const result = await fetchGetProdEnergy({
        nodeId: params.nodeId,
        timeType: params.timeType,
        dataTime: params.dataTime,
        energyType: params.energyType
      });
      prodEnergyData.value = result;
    }

    // 同时获取同比环比数据
    const yoyResult = await fetchGetYOY({
      nodeId: params.nodeId,
      timeType: params.timeType,
      dataTime: params.dataTime,
      energyType: params.energyType
    });
    yoyData.value = yoyResult;
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    loading.value = false;
  }
}

// 标签页切换时重新查询
function handleTabChange() {
  handleQuery();
}

// 重置表单
function handleReset() {
  queryForm.value = {
    nodeId: '1',
    timeType: 'MONTH',
    dataTime: dayjs().format('YYYY-MM-DD'),
    energyType: 'E001',
    analysisType: 'YOY'
  };
  handleQuery();
}

// 格式化比率显示
function formatRatio(ratio: number): string {
  if (ratio === 0) return '-';
  const sign = ratio > 0 ? '+' : '';
  return `${sign}${ratio.toFixed(2)}%`;
}

// 获取比率颜色
function getRatioColor(ratio: number): string {
  if (ratio > 0) return 'text-red-500';
  if (ratio < 0) return 'text-green-500';
  return 'text-gray-500';
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="consumption-analysis-page p-4">
    <!-- 查询区域 -->
    <ElCard class="mb-4">
      <ElForm :model="queryForm" inline>
        <ElFormItem label="节点">
          <ElSelect v-model="queryForm.nodeId" placeholder="请选择节点" style="width: 150px">
            <ElOption label="全厂" value="1" />
            <ElOption label="一车间" value="2" />
            <ElOption label="二车间" value="3" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="时间类型">
          <ElSelect v-model="queryForm.timeType" placeholder="请选择" style="width: 100px">
            <ElOption v-for="item in timeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="查询时间">
          <ElDatePicker
            v-model="queryForm.dataTime"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 180px"
          />
        </ElFormItem>

        <ElFormItem label="能源类型">
          <ElSelect v-model="queryForm.energyType" placeholder="请选择" style="width: 120px">
            <ElOption v-for="item in energyTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="分析类型">
          <ElSelect v-model="queryForm.analysisType" placeholder="请选择" style="width: 100px">
            <ElOption v-for="item in analysisTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleQuery">查询</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 同比环比统计卡片 -->
    <ElRow :gutter="16" class="mb-4">
      <ElCol :span="12">
        <ElCard shadow="hover">
          <div class="stat-card">
            <div class="stat-title">同比分析</div>
            <div class="stat-content">
              <div class="stat-item">
                <span class="label">本期时间：</span>
                <span class="value">{{ tongbiCard?.currentTime || '-' }}</span>
              </div>
              <div class="stat-item">
                <span class="label">本期能耗：</span>
                <span class="value">{{ tongbiCard?.currentValue?.toFixed(2) || '-' }} tce</span>
              </div>
              <div class="stat-item">
                <span class="label">同期时间：</span>
                <span class="value">{{ tongbiCard?.compareTime || '-' }}</span>
              </div>
              <div class="stat-item">
                <span class="label">同期能耗：</span>
                <span class="value">{{ tongbiCard?.compareValue?.toFixed(2) || '-' }} tce</span>
              </div>
              <div class="stat-item">
                <span class="label">同比变化：</span>
                <span class="value" :class="getRatioColor(tongbiCard?.ratio || 0)">
                  {{ formatRatio(tongbiCard?.ratio || 0) }}
                </span>
              </div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard shadow="hover">
          <div class="stat-card">
            <div class="stat-title">环比分析</div>
            <div class="stat-content">
              <div class="stat-item">
                <span class="label">本期时间：</span>
                <span class="value">{{ huanbiCard?.currentTime || '-' }}</span>
              </div>
              <div class="stat-item">
                <span class="label">本期能耗：</span>
                <span class="value">{{ huanbiCard?.currentValue?.toFixed(2) || '-' }} tce</span>
              </div>
              <div class="stat-item">
                <span class="label">上期时间：</span>
                <span class="value">{{ huanbiCard?.compareTime || '-' }}</span>
              </div>
              <div class="stat-item">
                <span class="label">上期能耗：</span>
                <span class="value">{{ huanbiCard?.compareValue?.toFixed(2) || '-' }} tce</span>
              </div>
              <div class="stat-item">
                <span class="label">环比变化：</span>
                <span class="value" :class="getRatioColor(huanbiCard?.ratio || 0)">
                  {{ formatRatio(huanbiCard?.ratio || 0) }}
                </span>
              </div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 数据展示区域 -->
    <ElCard>
      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 科室能耗分析 -->
        <ElTabPane label="科室能耗分析" name="area">
          <ElTable v-loading="loading" :data="analysisData?.dataList || []" stripe>
            <ElTableColumn prop="currentTime" label="本期时间" min-width="150" />
            <ElTableColumn prop="currentValue" label="本期能耗(tce)" min-width="120">
              <template #default="{ row }">
                {{ row.currentValue?.toFixed(2) }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="compareTime" label="同期时间" min-width="150" />
            <ElTableColumn prop="compareValue" label="同期能耗(tce)" min-width="120">
              <template #default="{ row }">
                {{ row.compareValue?.toFixed(2) }}
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="ratio"
              :label="queryForm.analysisType === 'YOY' ? '同比(%)' : '环比(%)'"
              min-width="100"
            >
              <template #default="{ row }">
                <span :class="getRatioColor(row.ratio)">
                  {{ formatRatio(row.ratio) }}
                </span>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <!-- 综合能耗分析 -->
        <ElTabPane label="综合能耗分析" name="comprehensive">
          <div class="mb-4">
            <h4 class="mb-2">能源占比</h4>
            <ElRow :gutter="16">
              <ElCol v-for="item in analysisData?.energyProportion || []" :key="item.energyNo" :span="6">
                <ElCard shadow="hover" class="text-center">
                  <div class="text-lg font-bold">{{ item.energyName }}</div>
                  <div class="text-2xl text-blue-500">{{ item.percentage?.toFixed(1) }}%</div>
                  <div class="text-gray-500">{{ item.count?.toFixed(2) }} tce</div>
                </ElCard>
              </ElCol>
            </ElRow>
          </div>
          <ElTable v-loading="loading" :data="analysisData?.dataList || []" stripe>
            <ElTableColumn prop="currentTime" label="时间" min-width="150" />
            <ElTableColumn prop="currentValue" label="综合能耗(tce)" min-width="140">
              <template #default="{ row }">
                {{ row.currentValue?.toFixed(2) }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="compareValue" label="同期能耗(tce)" min-width="140">
              <template #default="{ row }">
                {{ row.compareValue?.toFixed(2) }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="ratio" label="同比(%)" min-width="100">
              <template #default="{ row }">
                <span :class="getRatioColor(row.ratio)">
                  {{ formatRatio(row.ratio) }}
                </span>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <!-- 能耗排名 -->
        <ElTabPane label="能耗排名" name="ranking">
          <ElTable v-loading="loading" :data="rankingData" stripe>
            <ElTableColumn type="index" label="排名" width="80" />
            <ElTableColumn prop="nodeName" label="节点名称" min-width="150" />
            <ElTableColumn prop="energyConsumption" label="能耗量(tce)" min-width="140">
              <template #default="{ row }">
                {{ row.energyConsumption?.toFixed(2) }}
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <!-- 产品单耗分析 -->
        <ElTabPane label="产品单耗" name="prodEnergy">
          <div class="mb-4">
            <ElRow :gutter="16">
              <ElCol :span="8">
                <ElCard shadow="hover" class="text-center">
                  <div class="text-gray-500">总能耗</div>
                  <div class="text-2xl text-blue-500">{{ prodEnergyData?.totalEnergy?.toFixed(2) || 0 }} tce</div>
                </ElCard>
              </ElCol>
              <ElCol :span="8">
                <ElCard shadow="hover" class="text-center">
                  <div class="text-gray-500">总产量</div>
                  <div class="text-2xl text-green-500">{{ prodEnergyData?.totalProduct?.toFixed(2) || 0 }} t</div>
                </ElCard>
              </ElCol>
              <ElCol :span="8">
                <ElCard shadow="hover" class="text-center">
                  <div class="text-gray-500">平均单耗</div>
                  <div class="text-2xl text-orange-500">{{ prodEnergyData?.averageEnergy?.toFixed(2) || 0 }} tce/t</div>
                </ElCard>
              </ElCol>
            </ElRow>
          </div>
          <ElTable v-loading="loading" :data="prodEnergyData?.chart || []" stripe>
            <ElTableColumn prop="dateTime" label="时间" min-width="150" />
            <ElTableColumn prop="energyCount" label="能耗量(tce)" min-width="120">
              <template #default="{ row }">
                {{ row.energyCount?.toFixed(2) }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="productCount" label="产量(t)" min-width="120">
              <template #default="{ row }">
                {{ row.productCount?.toFixed(2) }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="average" label="单耗(tce/t)" min-width="120">
              <template #default="{ row }">
                {{ row.average?.toFixed(2) }}
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<style scoped>
.consumption-analysis-page {
  height: 100%;
}

.stat-card {
  padding: 8px;
}

.stat-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item .label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.stat-item .value {
  font-weight: 500;
  font-size: 14px;
}

.text-red-500 {
  color: #ef4444;
}

.text-green-500 {
  color: #22c55e;
}

.text-gray-500 {
  color: #6b7280;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-orange-500 {
  color: #f97316;
}
</style>
