<script setup lang="ts">
import { computed } from 'vue';
import { ElDatePicker, ElButton, ElBreadcrumb, ElBreadcrumbItem, ElSelect, ElOption } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

defineOptions({ name: 'FlowToolbar' });

interface Props {
  currentLevel: 'factory' | 'workshop';
  currentOrgName: string;
  factoryName?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  back: [];
  timeChange: [range: [Date, Date]];
  mediumChange: [medium: string];
}>();

// Time range
const timeRange = defineModel<[Date, Date] | null>('timeRange');

// Energy medium
const selectedMedium = defineModel<string>('selectedMedium', { default: '' });

// Quick time options
const quickTimeOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
];

// Energy medium options
const mediumOptions = [
  { label: '全部', value: '' },
  { label: '电力', value: 'electric' },
  { label: '水', value: 'water' },
  { label: '天然气', value: 'gas' },
  { label: '热力', value: 'heat' }
];

// Breadcrumb items
const breadcrumbItems = computed(() => {
  const items = [{ label: '能流图', path: '/energy/flow' }];
  if (props.currentLevel === 'workshop' && props.factoryName) {
    items.push({ label: props.factoryName, path: '' });
    items.push({ label: props.currentOrgName, path: '' });
  } else {
    items.push({ label: props.currentOrgName || '工厂', path: '' });
  }
  return items;
});

// Handle quick time selection
function handleQuickTime(value: string) {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (value) {
    case 'today': {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    }
    case 'week': {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59);
      break;
    }
    case 'month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    }
    case 'year': {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    }
    default:
      return;
  }

  timeRange.value = [start, end];
  emit('timeChange', [start, end]);
}

// Handle time range change
function handleTimeChange(value: [Date, Date] | null) {
  if (value) {
    emit('timeChange', value);
  }
}

// Handle medium change
function handleMediumChange(value: string) {
  emit('mediumChange', value);
}
</script>

<template>
  <div class="flow-toolbar">
    <div class="toolbar-left">
      <ElButton
        v-if="currentLevel === 'workshop'"
        :icon="ArrowLeft"
        @click="emit('back')"
      >
        返回工厂
      </ElButton>

      <ElBreadcrumb separator="/">
        <ElBreadcrumbItem v-for="(item, index) in breadcrumbItems" :key="index">
          {{ item.label }}
        </ElBreadcrumbItem>
      </ElBreadcrumb>
    </div>

    <div class="toolbar-right">
      <div class="quick-time-buttons">
        <ElButton
          v-for="option in quickTimeOptions"
          :key="option.value"
          size="small"
          @click="handleQuickTime(option.value)"
        >
          {{ option.label }}
        </ElButton>
      </div>

      <ElDatePicker
        v-model="timeRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="YYYY-MM-DDTHH:mm:ss"
        @change="handleTimeChange"
      />

      <ElSelect
        v-model="selectedMedium"
        placeholder="能源介质"
        clearable
        class="medium-select"
        @change="handleMediumChange"
      >
        <ElOption
          v-for="option in mediumOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
    </div>
  </div>
</template>

<style scoped>
.flow-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-time-buttons {
  display: flex;
  gap: 4px;
}

.medium-select {
  width: 120px;
}
</style>