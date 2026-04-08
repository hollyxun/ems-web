<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { Icon } from '@iconify/vue';
import { fetchItemizedEnergyAnalysis } from '@/service/api/itemized-energy-analysis';
import { useEcharts } from '@/hooks/common/echarts';

defineOptions({ name: 'ItemizedEnergyAnalysis' });

// 时间类型选项
const timeTypeOptions = [
  { label: '日', value: 'DAY' },
  { label: '月', value: 'MONTH' },
  { label: '年', value: 'YEAR' }
];

// 能源类型选项（模拟数据）
const energyTypeOptions = ref([
  { label: '电', value: 'electric', unit: 'kWh' },
  { label: '水', value: 'water', unit: 'm3' },
  { label: '气', value: 'gas', unit: 'm3' },
  { label: '热', value: 'heat', unit: 'MJ' }
]);

// 查询参数
const queryParams = ref({
  nodeId: '',
  nodeName: '',
  timeType: 'DAY' as 'DAY' | 'MONTH' | 'YEAR',
  dataTime: dayjs().format('YYYY-MM-DD'),
  energyType: 'electric',
  energyName: '电',
  unit: 'kWh'
});

// 状态
const loading = ref(false);
const analysisData = ref<Api.ItemizedEnergyAnalysis.Response | null>(null);

// 组织树（模拟数据）
const orgTree = ref([
  {
    id: '1',
    label: '集团总部',
    children: [
      {
        id: '2',
        label: '工厂A',
        children: [
          { id: '3', label: '车间1' },
          { id: '4', label: '车间2' }
        ]
      },
      {
        id: '5',
        label: '工厂B',
        children: [
          { id: '6', label: '车间1' },
          { id: '7', label: '车间2' }
        ]
      }
    ]
  }
]);

const selectedNode = ref<string>('');

// 表格数据
const tableData = computed(() => analysisData.value?.dataList || []);

// 图表配置
const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross' }
  },
  legend: {
    data: ['能耗值'],
    right: '5%',
    top: '3%'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [] as string[]
  },
  yAxis: {
    type: 'value',
    name: 'kWh'
  },
  series: [
    {
      name: '能耗值',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#3b82f6' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
          ]
        }
      },
      data: [] as number[]
    }
  ]
}));

// 动态表格列
const tableColumns = computed(() => {
  const cols: { label: string; prop: string }[] = [
    { label: '节点', prop: 'nodeName' },
    { label: '合计', prop: 'total' }
  ];

  if (queryParams.value.timeType === 'DAY') {
    for (let i = 0; i < 24; i++) {
      cols.push({ label: `${i}时`, prop: `value${i}` });
    }
  } else if (queryParams.value.timeType === 'MONTH') {
    const days = dayjs(queryParams.value.dataTime).daysInMonth();
    for (let i = 0; i < days; i++) {
      cols.push({ label: `${i + 1}日`, prop: `value${i}` });
    }
  } else {
    for (let i = 0; i < 12; i++) {
      cols.push({ label: `${i + 1}月`, prop: `value${i}` });
    }
  }

  return cols;
});

// 加载数据
async function loadData() {
  if (!queryParams.value.nodeId) {
    return;
  }

  loading.value = true;
  try {
    const response = await fetchItemizedEnergyAnalysis({
      nodeId: queryParams.value.nodeId,
      timeType: queryParams.value.timeType,
      dataTime: queryParams.value.dataTime,
      energyType: queryParams.value.energyType
    });

    if (response.data) {
      analysisData.value = response.data;
      updateChartData(response.data);
    }
  } catch (error) {
    console.error('加载分项能耗分析数据失败:', error);
  } finally {
    loading.value = false;
  }
}

// 更新图表数据
function updateChartData(data: Api.ItemizedEnergyAnalysis.Response) {
  const xData: string[] = [];
  const yData: number[] = [];

  if (queryParams.value.timeType === 'DAY') {
    for (let i = 0; i < 24; i += 1) {
      xData.push(`${i}时`);
      yData.push((data.dataList[0]?.[`value${i}` as keyof Api.ItemizedEnergyAnalysis.Item] as number) || 0);
    }
  } else if (queryParams.value.timeType === 'MONTH') {
    const days = dayjs(queryParams.value.dataTime).daysInMonth();
    for (let i = 0; i < days; i += 1) {
      xData.push(`${i + 1}日`);
      yData.push((data.dataList[0]?.[`value${i}` as keyof Api.ItemizedEnergyAnalysis.Item] as number) || 0);
    }
  } else {
    for (let i = 0; i < 12; i += 1) {
      xData.push(`${i + 1}月`);
      yData.push((data.dataList[0]?.[`value${i}` as keyof Api.ItemizedEnergyAnalysis.Item] as number) || 0);
    }
  }

  updateOptions(opts => {
    opts.xAxis!.data = xData;
    opts.yAxis!.name = queryParams.value.unit;
    opts.series![0].data = yData;
    return opts;
  });
}

// 处理节点选择
function handleNodeClick(data: { id: string; label: string }) {
  queryParams.value.nodeId = data.id;
  queryParams.value.nodeName = data.label;
  loadData();
}

// 处理时间类型变更
function handleTimeTypeChange() {
  // 根据时间类型调整日期选择器格式
  if (queryParams.value.timeType === 'YEAR') {
    queryParams.value.dataTime = dayjs().format('YYYY-01-01');
  } else if (queryParams.value.timeType === 'MONTH') {
    queryParams.value.dataTime = dayjs().format('YYYY-MM-01');
  } else {
    queryParams.value.dataTime = dayjs().format('YYYY-MM-DD');
  }
  loadData();
}

// 处理能源类型变更
function handleEnergyTypeChange(value: string) {
  const selected = energyTypeOptions.value.find(e => e.value === value);
  if (selected) {
    queryParams.value.energyName = selected.label;
    queryParams.value.unit = selected.unit;
  }
  loadData();
}

// 初始化
onMounted(() => {
  // 默认选择第一个节点
  if (orgTree.value[0]?.children?.[0]?.children?.[0]) {
    const firstLeaf = orgTree.value[0].children[0].children[0];
    queryParams.value.nodeId = firstLeaf.id;
    queryParams.value.nodeName = firstLeaf.label;
    loadData();
  }
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lg:flex-row">
    <!-- 左侧组织树 -->
    <ElCard class="w-280px flex-shrink-0 card-wrapper lg:w-280px">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">组织结构</span>
        </div>
      </template>
      <ElTree
        :data="orgTree"
        :props="{ label: 'label', children: 'children' }"
        node-key="id"
        highlight-current
        default-expand-all
        @node-click="handleNodeClick"
      />
    </ElCard>

    <!-- 右侧分析区域 -->
    <div class="flex-col-stretch flex-1 gap-16px overflow-hidden">
      <!-- 查询表单 -->
      <ElCard class="card-wrapper">
        <ElForm :model="queryParams" label-width="80px" class="flex flex-wrap gap-16px">
          <ElFormItem label="期间" class="w-200px">
            <ElSelect v-model="queryParams.timeType" placeholder="选择期间" @change="handleTimeTypeChange">
              <ElOption v-for="opt in timeTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="时间" class="w-200px">
            <ElDatePicker
              v-model="queryParams.dataTime"
              :type="queryParams.timeType === 'YEAR' ? 'year' : queryParams.timeType === 'MONTH' ? 'month' : 'date'"
              :format="
                queryParams.timeType === 'YEAR' ? 'YYYY' : queryParams.timeType === 'MONTH' ? 'YYYY-MM' : 'YYYY-MM-DD'
              "
              value-format="YYYY-MM-DD"
              placeholder="选择时间"
              @change="loadData"
            />
          </ElFormItem>
          <ElFormItem label="能源类型" class="w-200px">
            <ElSelect v-model="queryParams.energyType" placeholder="选择能源类型" @change="handleEnergyTypeChange">
              <ElOption v-for="opt in energyTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem class="ml-auto">
            <ElButton type="primary" :loading="loading" @click="loadData">
              <Icon icon="mdi:refresh" class="mr-4px" />
              查询
            </ElButton>
          </ElFormItem>
        </ElForm>
      </ElCard>

      <!-- 统计概览 -->
      <ElCard class="card-wrapper">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ queryParams.nodeName }} - 分项能耗分析</span>
          </div>
        </template>
        <div v-if="analysisData" class="grid grid-cols-4 gap-16px">
          <div class="border rounded-8px p-16px text-center">
            <div class="text-sm text-gray-500">总用量/{{ queryParams.unit }}</div>
            <div class="mt-8px text-2xl text-blue-500 font-bold">{{ analysisData.total }}</div>
          </div>
          <div class="border rounded-8px p-16px text-center">
            <div class="text-sm text-gray-500">最大用量/{{ queryParams.unit }}</div>
            <div class="mt-8px text-2xl text-red-500 font-bold">{{ analysisData.max }}</div>
          </div>
          <div class="border rounded-8px p-16px text-center">
            <div class="text-sm text-gray-500">最小用量/{{ queryParams.unit }}</div>
            <div class="mt-8px text-2xl text-green-500 font-bold">{{ analysisData.min }}</div>
          </div>
          <div class="border rounded-8px p-16px text-center">
            <div class="text-sm text-gray-500">平均用量/{{ queryParams.unit }}</div>
            <div class="mt-8px text-2xl text-purple-500 font-bold">{{ analysisData.avg }}</div>
          </div>
        </div>
      </ElCard>

      <!-- 趋势图 -->
      <ElCard class="flex-1 card-wrapper">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ queryParams.nodeName }} - 能耗趋势</span>
          </div>
        </template>
        <div ref="domRef" class="h-300px" />
      </ElCard>

      <!-- 详情表格 -->
      <ElCard class="card-wrapper">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ queryParams.nodeName }} - 分项能耗详情 - {{ queryParams.energyName }}</span>
          </div>
        </template>
        <ElTable v-loading="loading" :data="tableData" border stripe max-height="400px">
          <ElTableColumn
            v-for="col in tableColumns"
            :key="col.prop"
            :label="col.label"
            :prop="col.prop"
            :min-width="col.prop === 'nodeName' ? 120 : 100"
            align="center"
          >
            <template #default="scope">
              <span v-if="col.prop === 'total'">{{ scope.row.total?.toFixed(2) }}</span>
              <span v-else-if="scope.row[col.prop] !== undefined && scope.row[col.prop] !== null">
                {{ (scope.row[col.prop] as number)?.toFixed(2) }}
              </span>
              <span v-else class="text-gray-400">--</span>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.border {
  border-color: var(--el-border-color);
}
</style>
