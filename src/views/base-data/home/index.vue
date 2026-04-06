<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElCard, ElProgress } from 'element-plus';
import { fetchGetOverview } from '@/service/api/base-data';

defineOptions({ name: 'BaseDataHome' });

const router = useRouter();

interface OverviewData {
  medium: {
    total: number;
    enabled: number;
    disabled: number;
    byType: Record<string, number>;
  };
  unit: {
    total: number;
    standard: number;
    nonStandard: number;
  };
  coefficient: {
    total: number;
    effective: number;
    expired: number;
  };
  meter: {
    total: number;
    online: number;
    offline: number;
    fault: number;
  };
  virtualMeter: {
    total: number;
    enabled: number;
    disabled: number;
  };
  tou: {
    periodCount: number;
    priceCount: number;
  };
}

const overviewData = ref<OverviewData | null>(null);
const loading = ref(true);

// 统计卡片配置
const statsCards = computed(() => {
  if (!overviewData.value) return [];

  const data = overviewData.value;

  return [
    {
      title: '能源介质',
      icon: 'mdi:gas-cylinder',
      color: '#00d4ff',
      stats: [
        { label: '总数', value: data.medium.total, unit: '种' },
        { label: '启用', value: data.medium.enabled, unit: '种', status: 'success' },
        { label: '停用', value: data.medium.disabled, unit: '种', status: 'warning' }
      ],
      route: '/base-data/medium',
      pulse: data.medium.enabled > 0
    },
    {
      title: '计量单位',
      icon: 'mdi:scale-balance',
      color: '#4CAF50',
      stats: [
        { label: '总数', value: data.unit.total, unit: '个' },
        { label: '标准单位', value: data.unit.standard, unit: '个', status: 'success' },
        { label: '非标准', value: data.unit.nonStandard, unit: '个', status: 'info' }
      ],
      route: '/base-data/unit',
      pulse: false
    },
    {
      title: '转换系数',
      icon: 'mdi:function',
      color: '#FF9800',
      stats: [
        { label: '总数', value: data.coefficient.total, unit: '条' },
        { label: '有效', value: data.coefficient.effective, unit: '条', status: 'success' },
        { label: '失效', value: data.coefficient.expired, unit: '条', status: 'danger' }
      ],
      route: '/base-data/coefficient',
      pulse: data.coefficient.expired > 0
    },
    {
      title: '计量点',
      icon: 'mdi:gauge',
      color: '#E91E63',
      stats: [
        { label: '总数', value: data.meter.total, unit: '个' },
        { label: '在线', value: data.meter.online, unit: '个', status: 'success' },
        { label: '离线', value: data.meter.offline, unit: '个', status: 'warning' },
        { label: '故障', value: data.meter.fault, unit: '个', status: 'danger' }
      ],
      route: '/base-data/meter',
      pulse: data.meter.fault > 0
    },
    {
      title: '虚拟计量点',
      icon: 'mdi:calculator-variant',
      color: '#9C27B0',
      stats: [
        { label: '总数', value: data.virtualMeter.total, unit: '个' },
        { label: '启用', value: data.virtualMeter.enabled, unit: '个', status: 'success' },
        { label: '停用', value: data.virtualMeter.disabled, unit: '个', status: 'warning' }
      ],
      route: '/base-data/virtual-meter',
      pulse: data.virtualMeter.enabled > 0
    },
    {
      title: '分时电价',
      icon: 'mdi:clock-outline',
      color: '#607D8B',
      stats: [
        { label: '时段数', value: data.tou.periodCount, unit: '段' },
        { label: '电价数', value: data.tou.priceCount, unit: '条' }
      ],
      route: '/base-data/tou',
      pulse: false
    }
  ];
});

// 获取在线率
const getOnlineRate = computed(() => {
  if (!overviewData.value || overviewData.value.meter.total === 0) return 0;
  return Math.round((overviewData.value.meter.online / overviewData.value.meter.total) * 100);
});

// 获取有效系数率
const getEffectiveRate = computed(() => {
  if (!overviewData.value || overviewData.value.coefficient.total === 0) return 0;
  return Math.round((overviewData.value.coefficient.effective / overviewData.value.coefficient.total) * 100);
});

async function loadOverviewData() {
  loading.value = true;
  const { data, error } = await fetchGetOverview();
  if (!error && data) {
    overviewData.value = data;
  }
  loading.value = false;
}

function navigateTo(route: string) {
  router.push(route);
}

onMounted(() => {
  loadOverviewData();
});
</script>

<template>
  <div class="base-data-overview">
    <!-- 标题栏 -->
    <div class="overview-header">
      <div class="header-title">
        <span class="title-icon">⚡</span>
        <h2>基础数据管理中心</h2>
      </div>
      <div class="header-status">
        <div class="status-indicator" :class="{ pulse: overviewData?.meter.fault > 0 }">
          <span class="indicator-dot" :class="overviewData?.meter.fault > 0 ? 'danger' : 'success'" />
          <span class="indicator-label">{{ overviewData?.meter.fault > 0 ? '异常告警' : '系统正常' }}</span>
        </div>
      </div>
    </div>

    <!-- 状态概览条 -->
    <div class="status-bar">
      <div class="status-item">
        <div class="status-label">计量点在线率</div>
        <div class="status-value">
          <ElProgress
            :percentage="getOnlineRate"
            :stroke-width="12"
            :color="getOnlineRate >= 95 ? '#4CAF50' : getOnlineRate >= 80 ? '#FF9800' : '#E91E63'"
            :show-text="false"
          />
          <span class="progress-text">{{ getOnlineRate }}%</span>
        </div>
      </div>
      <div class="status-item">
        <div class="status-label">系数有效率</div>
        <div class="status-value">
          <ElProgress
            :percentage="getEffectiveRate"
            :stroke-width="12"
            :color="getEffectiveRate >= 90 ? '#4CAF50' : getEffectiveRate >= 70 ? '#FF9800' : '#E91E63'"
            :show-text="false"
          />
          <span class="progress-text">{{ getEffectiveRate }}%</span>
        </div>
      </div>
    </div>

    <!-- 统计卡片网格 -->
    <div v-loading="loading" class="stats-grid">
      <ElCard
        v-for="card in statsCards"
        :key="card.title"
        class="stats-card"
        :body-style="{ padding: '16px' }"
        @click="navigateTo(card.route)"
      >
        <div class="card-header" :style="{ borderColor: card.color }">
          <div class="card-icon-wrapper" :style="{ backgroundColor: `${card.color}20` }">
            <SvgIcon :icon="card.icon" :style="{ color: card.color }" class="card-icon" />
          </div>
          <h3 class="card-title">{{ card.title }}</h3>
          <div v-if="card.pulse" class="pulse-indicator">
            <span class="pulse-dot" :style="{ backgroundColor: card.color }" />
          </div>
        </div>
        <div class="card-stats">
          <div v-for="stat in card.stats" :key="stat.label" class="stat-item" :class="stat.status">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">
              <strong>{{ stat.value }}</strong>
              <small>{{ stat.unit }}</small>
            </span>
          </div>
        </div>
        <div class="card-footer">
          <span class="nav-hint">点击查看详情 →</span>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-data-overview {
  height: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 50%, #1a2332 100%);
  color: #e0e6ed;
  overflow-y: auto;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;

  .title-icon {
    font-size: 24px;
    color: #00d4ff;
  }

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #00d4ff;
    letter-spacing: 1px;
  }
}

.header-status {
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 4px;

    &.pulse {
      animation: pulse-bg 2s infinite;
    }
  }

  .indicator-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: blink 1.5s infinite;

    &.success {
      background-color: #4caf50;
    }

    &.danger {
      background-color: #e91e63;
      animation: blink-danger 0.5s infinite;
    }
  }

  .indicator-label {
    font-size: 14px;
    color: #a0aec0;
  }
}

.status-bar {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  margin-bottom: 24px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
}

.status-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .status-label {
    font-size: 14px;
    color: #a0aec0;
  }

  .status-value {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-progress {
      flex: 1;
    }

    .progress-text {
      font-size: 16px;
      font-weight: 600;
      color: #00d4ff;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.stats-card {
  background: rgba(30, 40, 55, 0.8) !important;
  border: 1px solid rgba(0, 212, 255, 0.15) !important;
  border-radius: 8px !important;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(0, 212, 255, 0.4) !important;
    box-shadow: 0 8px 24px rgba(0, 212, 255, 0.2);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 2px solid;
    margin-bottom: 12px;
  }

  .card-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-icon {
    font-size: 24px;
  }

  .card-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #e0e6ed;
    flex: 1;
  }

  .pulse-indicator {
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse-dot 1.5s infinite;
    }
  }

  .card-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 8px 0;

    .stat-item {
      display: flex;
      flex-direction: column;
      padding: 8px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;

      &.success {
        border-left: 3px solid #4caf50;
      }

      &.warning {
        border-left: 3px solid #ff9800;
      }

      &.danger {
        border-left: 3px solid #e91e63;
      }

      &.info {
        border-left: 3px solid #2196f3;
      }

      .stat-label {
        font-size: 12px;
        color: #718096;
      }

      .stat-value {
        font-size: 14px;
        color: #e0e6ed;

        strong {
          font-size: 18px;
          font-weight: 600;
          color: #00d4ff;
        }

        small {
          font-size: 12px;
          color: #718096;
          margin-left: 4px;
        }
      }
    }
  }

  .card-footer {
    padding-top: 12px;
    border-top: 1px solid rgba(0, 212, 255, 0.1);
    text-align: right;

    .nav-hint {
      font-size: 12px;
      color: #00d4ff;
    }
  }
}

// 动画
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes blink-danger {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px #e91e63;
  }
  50% {
    opacity: 0.3;
    box-shadow: 0 0 4px #e91e63;
  }
}

@keyframes pulse-bg {
  0%,
  100% {
    background: rgba(0, 0, 0, 0.4);
  }
  50% {
    background: rgba(233, 30, 99, 0.2);
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
}
</style>
