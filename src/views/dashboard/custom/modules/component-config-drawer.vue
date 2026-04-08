<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  ElButton,
  ElDivider,
  ElDrawer,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
  ElSwitch
} from 'element-plus';
import { type DashboardComponentType, categoryNames } from '../components/index';

const props = defineProps<{
  visible: boolean;
  component: DashboardComponentType | null;
  config: Record<string, any>;
}>();

const emit = defineEmits<{
  close: [];
  save: [config: Record<string, any>];
}>();

// 本地配置状态
const localConfig = ref<Record<string, any>>({});

// 配置选项
const title = ref('');
const refreshInterval = ref(0);
const dataSourceId = ref('');
const autoRefresh = ref(true);

// 数据源列表（模拟）
const dataSources = ref<{ id: string; name: string; type: string }[]>([
  { id: 'ds_realtime', name: '实时数据', type: 'realtime' },
  { id: 'ds_daily', name: '日报数据', type: 'daily' },
  { id: 'ds_meter_mp001', name: '计量点MP001', type: 'meter' },
  { id: 'ds_team_a', name: '班组A数据', type: 'team' }
]);

// 组件信息
const componentInfo = computed(() => {
  if (!props.component) return null;
  return {
    name: props.component.name,
    category: categoryNames[props.component.category],
    icon: props.component.icon,
    description: props.component.description
  };
});

// 初始化配置
function initConfig() {
  if (!props.config) {
    localConfig.value = {};
    title.value = props.component?.name || '';
    refreshInterval.value = 30000;
    dataSourceId.value = '';
    autoRefresh.value = true;
  } else {
    localConfig.value = { ...props.config };
    title.value = props.config.title || props.component?.name || '';
    refreshInterval.value = props.config.refreshInterval || 30000;
    dataSourceId.value = props.config.dataSourceId || '';
    autoRefresh.value = props.config.autoRefresh !== false;
  }
}

watch(
  () => props.visible,
  val => {
    if (val) initConfig();
  }
);

function handleSave() {
  const config: Record<string, any> = {
    ...localConfig.value,
    title: title.value,
    refreshInterval: refreshInterval.value,
    dataSourceId: dataSourceId.value,
    autoRefresh: autoRefresh.value
  };
  emit('save', config);
  ElMessage.success('配置已保存');
}

function handleClose() {
  emit('close');
}
</script>

<template>
  <ElDrawer v-model="props.visible" title="组件配置" :size="400" @close="handleClose">
    <div v-if="componentInfo" class="flex flex-col gap-4">
      <!-- 组件信息 -->
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-700">
        <div class="mb-2 flex items-center gap-3">
          <icon-mdi:chart-bar v-if="componentInfo.icon === 'mdi:chart-bar'" />
          <icon-mdi:trophy v-if="componentInfo.icon === 'mdi:trophy'" />
          <icon-mdi:clipboard-check v-if="componentInfo.icon === 'mdi:clipboard-check'" />
          <icon-mdi:server v-if="componentInfo.icon === 'mdi:server'" />
          <icon-mdi:gauge v-if="componentInfo.icon === 'mdi:gauge'" />
          <icon-mdi:calendar v-if="componentInfo.icon === 'mdi:calendar'" />
          <icon-mdi:bell-ring v-if="componentInfo.icon === 'mdi:bell-ring'" />
          <icon-mdi:chart-line v-if="componentInfo.icon === 'mdi:chart-line'" />
          <icon-mdi:speedometer v-if="componentInfo.icon === 'mdi:speedometer'" />
          <icon-mdi:account-star v-if="componentInfo.icon === 'mdi:account-star'" />
          <icon-mdi:lightning-bolt v-if="componentInfo.icon === 'mdi:lightning-bolt'" />
          <span class="font-medium">{{ componentInfo.name }}</span>
        </div>
        <div class="text-sm text-gray-400">
          <span class="mr-2">类别: {{ componentInfo.category }}</span>
        </div>
        <div class="mt-1 text-sm text-gray-500">
          {{ componentInfo.description }}
        </div>
      </div>

      <ElDivider>基础配置</ElDivider>

      <!-- 标题 -->
      <ElForm label-position="top">
        <ElFormItem label="组件标题">
          <ElInput v-model="title" placeholder="自定义组件标题" />
        </ElFormItem>

        <!-- 数据源 -->
        <ElFormItem label="数据源">
          <ElSelect v-model="dataSourceId" placeholder="选择数据源" clearable>
            <ElOption v-for="ds in dataSources" :key="ds.id" :label="ds.name" :value="ds.id">
              <span>{{ ds.name }}</span>
              <span class="ml-2 text-xs text-gray-400">({{ ds.type }})</span>
            </ElOption>
          </ElSelect>
        </ElFormItem>

        <!-- 自动刷新 -->
        <ElFormItem label="自动刷新">
          <ElSwitch v-model="autoRefresh" />
        </ElFormItem>

        <!-- 刷新间隔 -->
        <ElFormItem v-if="autoRefresh" label="刷新间隔 (毫秒)">
          <ElInputNumber v-model="refreshInterval" :min="5000" :max="300000" :step="5000" controls-position="right" />
        </ElFormItem>

        <!-- 扩展配置（根据组件类型） -->
        <ElDivider>扩展配置</ElDivider>

        <template v-if="props.component?.id === 'energy-trend'">
          <ElFormItem label="默认时间范围">
            <ElSelect v-model="localConfig.defaultRange" placeholder="选择默认范围">
              <ElOption label="小时" value="hour" />
              <ElOption label="日" value="day" />
              <ElOption label="周" value="week" />
              <ElOption label="月" value="month" />
            </ElSelect>
          </ElFormItem>
        </template>

        <template v-if="props.component?.id === 'team-ranking'">
          <ElFormItem label="排名数量">
            <ElInputNumber v-model="localConfig.topCount" :min="3" :max="20" />
          </ElFormItem>
          <ElFormItem label="对比周期">
            <ElSelect v-model="localConfig.comparePeriod" placeholder="选择周期">
              <ElOption label="本周" value="week" />
              <ElOption label="本月" value="month" />
            </ElSelect>
          </ElFormItem>
        </template>

        <template v-if="props.component?.category === 'energy'">
          <ElFormItem label="能耗单位">
            <ElSelect v-model="localConfig.energyUnit" placeholder="选择单位">
              <ElOption label="kWh (千瓦时)" value="kWh" />
              <ElOption label="MJ (兆焦)" value="MJ" />
              <ElOption label="吨标准煤" value="tce" />
            </ElSelect>
          </ElFormItem>
        </template>

        <template v-if="props.component?.id === 'device-status'">
          <ElFormItem label="显示告警详情">
            <ElSwitch v-model="localConfig.showAlertDetail" />
          </ElFormItem>
        </template>
      </ElForm>

      <!-- 操作按钮 -->
      <div class="mt-4 flex justify-end gap-2">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" @click="handleSave">保存配置</ElButton>
      </div>
    </div>
  </ElDrawer>
</template>
