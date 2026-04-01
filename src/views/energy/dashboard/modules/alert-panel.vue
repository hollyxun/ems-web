<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { confirmAlert, fetchAlerts, ignoreAlert } from '@/service/api/dashboard';
import AlertItem from './alert-item.vue';

interface Props {
  orgId?: string;
  maxItems?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 10
});

const alerts = ref<Api.Dashboard.AlertItem[]>([]);
const loading = ref(false);
const activeFilter = ref<'all' | 'active'>('active');
const severityFilter = ref<string>('');

const filteredAlerts = computed(() => {
  let result = alerts.value;

  if (activeFilter.value === 'active') {
    result = result.filter((a: Api.Dashboard.AlertItem) => a.status === 'active');
  }

  if (severityFilter.value) {
    result = result.filter((a: Api.Dashboard.AlertItem) => a.severity === severityFilter.value);
  }

  return result.slice(0, props.maxItems);
});

const alertCounts = computed(() => ({
  critical: alerts.value.filter((a: Api.Dashboard.AlertItem) => a.severity === 'critical' && a.status === 'active')
    .length,
  warning: alerts.value.filter((a: Api.Dashboard.AlertItem) => a.severity === 'warning' && a.status === 'active')
    .length,
  info: alerts.value.filter((a: Api.Dashboard.AlertItem) => a.severity === 'info' && a.status === 'active').length
}));

async function loadAlerts() {
  loading.value = true;
  try {
    const result = await fetchAlerts({
      orgId: props.orgId,
      status: activeFilter.value === 'active' ? 'active' : undefined,
      page: 1,
      pageSize: 50
    });
    if (result.data) {
      alerts.value = result.data.items;
    }
  } catch (e) {
    console.error('Failed to load alerts:', e);
  } finally {
    loading.value = false;
  }
}

async function handleConfirm(alertId: string) {
  try {
    await confirmAlert(alertId);
    const alert = alerts.value.find((a: Api.Dashboard.AlertItem) => a.id === alertId);
    if (alert) {
      alert.status = 'confirmed';
    }
  } catch (e) {
    console.error('Failed to confirm alert:', e);
  }
}

async function handleIgnore(alertId: string) {
  try {
    await ignoreAlert(alertId);
    const alert = alerts.value.find((a: Api.Dashboard.AlertItem) => a.id === alertId);
    if (alert) {
      alert.status = 'ignored';
    }
  } catch (e) {
    console.error('Failed to ignore alert:', e);
  }
}

onMounted(loadAlerts);
</script>

<template>
  <ElCard class="card-wrapper">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:bell-alert" class="text-xl text-red-500" />
          <span class="font-medium">Real-time Alerts</span>
        </div>

        <!-- Quick Stats -->
        <div class="flex gap-2">
          <ElBadge v-if="alertCounts.critical > 0" :value="alertCounts.critical" type="danger">
            <ElButton size="small" circle @click="severityFilter = 'critical'">
              <Icon icon="mdi:alert-circle" />
            </ElButton>
          </ElBadge>
          <ElBadge v-if="alertCounts.warning > 0" :value="alertCounts.warning" type="warning">
            <ElButton size="small" circle @click="severityFilter = 'warning'">
              <Icon icon="mdi:alert" />
            </ElButton>
          </ElBadge>
        </div>
      </div>
    </template>

    <!-- Filters -->
    <div class="mb-4 flex items-center gap-4">
      <ElRadioGroup v-model="activeFilter" size="small" @change="loadAlerts">
        <ElRadioButton value="active">Pending</ElRadioButton>
        <ElRadioButton value="all">All</ElRadioButton>
      </ElRadioGroup>

      <ElSelect v-model="severityFilter" placeholder="Severity" size="small" clearable>
        <ElOption value="critical" label="Critical" />
        <ElOption value="warning" label="Warning" />
        <ElOption value="info" label="Info" />
      </ElSelect>

      <ElButton size="small" @click="loadAlerts">
        <Icon icon="mdi:refresh" />
      </ElButton>
    </div>

    <!-- Alert List -->
    <div v-if="loading" class="space-y-3">
      <ElSkeleton v-for="i in 3" :key="i" :rows="2" animated />
    </div>

    <div v-else-if="filteredAlerts.length === 0" class="py-8 text-center text-gray-400">
      <Icon icon="mdi:check-circle" class="text-4xl text-green-400" />
      <div class="mt-2">No alerts</div>
    </div>

    <div v-else class="max-h-400px overflow-y-auto space-y-3">
      <AlertItem
        v-for="alert in filteredAlerts"
        :key="alert.id"
        :alert="alert"
        @confirm="handleConfirm"
        @ignore="handleIgnore"
      />
    </div>

    <!-- View All Link -->
    <div v-if="alerts.length > props.maxItems" class="mt-4 text-center">
      <ElButton text type="primary" @click="$router.push('/energy/alerts')">View All ({{ alerts.length }})</ElButton>
    </div>
  </ElCard>
</template>
