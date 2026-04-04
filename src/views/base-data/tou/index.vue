<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import {
  fetchDeleteFactoryTouPrice,
  fetchDeleteTouPeriod,
  fetchGetFactoryTouPrices,
  fetchGetTouPeriods
} from '@/service/api/energy-tou';
import { fetchGetAllMediums } from '@/service/api/energy';
import { fetchOrganizationTree } from '@/service/api/organization';
import TouSearch from './modules/tou-search.vue';
import TouPeriodDrawer from './modules/tou-period-drawer.vue';
import TouPriceDrawer from './modules/tou-price-drawer.vue';

defineOptions({ name: 'BaseDataTou' });

const activeTab = ref('periods');
const searchParams = ref(getInitSearchParams());
const allMediums = ref<Api.Energy.Medium[]>([]);
const organizationTree = ref<Api.Organization.OrganizationItem[]>([]);

const periods = ref<Api.Energy.TouPeriod[]>([]);
const prices = ref<Api.Energy.FactoryTouPrice[]>([]);
const loading = ref(false);

// Period drawer
const periodDrawerVisible = ref(false);
const periodOperateType = ref<UI.TableOperateType>('add');
const periodEditingData = ref<Api.Energy.TouPeriod | null>(null);

// Price drawer
const priceDrawerVisible = ref(false);
const priceOperateType = ref<UI.TableOperateType>('add');
const priceEditingData = ref<Api.Energy.FactoryTouPrice | null>(null);

const periodTypeMap: Record<number, { label: string; color: string; type: UI.ThemeColor }> = {
  1: { label: '峰时', color: '#f56c6c', type: 'danger' },
  2: { label: '平时', color: '#e6a23c', type: 'warning' },
  3: { label: '谷时', color: '#409eff', type: 'primary' }
};

function getInitSearchParams() {
  return {
    factoryId: undefined as number | undefined,
    mediumId: undefined as number | undefined,
    periodType: undefined as number | undefined,
    effectiveDate: undefined as string | undefined
  };
}

async function loadMediums() {
  const { data } = await fetchGetAllMediums();
  if (data) {
    allMediums.value = data;
  }
}

async function loadOrganizations() {
  const { data } = await fetchOrganizationTree();
  if (data) {
    organizationTree.value = data;
  }
}

async function loadPeriods() {
  loading.value = true;
  const { data, error } = await fetchGetTouPeriods({ factoryId: searchParams.value.factoryId });
  if (!error && data) {
    periods.value = data;
  }
  loading.value = false;
}

async function loadPrices() {
  if (!searchParams.value.factoryId) {
    prices.value = [];
    return;
  }
  loading.value = true;
  const { data, error } = await fetchGetFactoryTouPrices({
    factoryId: searchParams.value.factoryId,
    mediumId: searchParams.value.mediumId
  });
  if (!error && data) {
    prices.value = data;
  }
  loading.value = false;
}

function handleSearch() {
  loadPeriods();
  loadPrices();
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

// Period operations
function handleAddPeriod() {
  periodOperateType.value = 'add';
  periodEditingData.value = null;
  periodDrawerVisible.value = true;
}

function handleEditPeriod(row: Api.Energy.TouPeriod) {
  periodOperateType.value = 'edit';
  periodEditingData.value = { ...row };
  periodDrawerVisible.value = true;
}

async function handleDeletePeriod(id: number) {
  const { error } = await fetchDeleteTouPeriod(id);
  if (!error) {
    ElMessage.success('删除成功');
    loadPeriods();
  }
}

// Price operations
function handleAddPrice() {
  if (!searchParams.value.factoryId) {
    ElMessage.warning('请先选择工厂');
    return;
  }
  priceOperateType.value = 'add';
  priceEditingData.value = null;
  priceDrawerVisible.value = true;
}

function handleEditPrice(row: Api.Energy.FactoryTouPrice) {
  priceOperateType.value = 'edit';
  priceEditingData.value = { ...row };
  priceDrawerVisible.value = true;
}

async function handleDeletePrice(id: number) {
  const { error } = await fetchDeleteFactoryTouPrice(id);
  if (!error) {
    ElMessage.success('删除成功');
    loadPrices();
  }
}

// Timeline visualization helpers
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getPeriodStyle(period: Api.Energy.TouPeriod): Record<string, string> {
  const startMinutes = timeToMinutes(period.startTime);
  let endMinutes = timeToMinutes(period.endTime);

  if (period.crossMidnight) {
    endMinutes += 24 * 60;
  }

  const widthPercent = ((endMinutes - startMinutes) / (24 * 60)) * 100;
  const leftPercent = (startMinutes / (24 * 60)) * 100;

  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    backgroundColor: periodTypeMap[period.periodType]?.color || '#909399'
  };
}

function getMediumName(mediumId: number): string {
  const medium = allMediums.value.find(m => m.id === mediumId);
  return medium?.mediumName || '-';
}

onMounted(() => {
  loadMediums();
  loadOrganizations();
  loadPeriods();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <TouSearch v-model:model="searchParams" @reset="resetSearchParams" @search="handleSearch" />

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>分时电价管理</p>
          <div class="flex gap-2">
            <ElButton v-if="activeTab === 'periods'" type="primary" @click="handleAddPeriod">
              <template #icon><icon-ic-round-plus /></template>
              新增时段
            </ElButton>
            <ElButton v-if="activeTab === 'prices'" type="primary" @click="handleAddPrice">
              <template #icon><icon-ic-round-plus /></template>
              新增电价
            </ElButton>
          </div>
        </div>
      </template>

      <ElTabs v-model="activeTab" @tab-change="activeTab === 'prices' ? loadPrices() : loadPeriods()">
        <ElTabPane label="时段配置" name="periods">
          <!-- Timeline visualization -->
          <div v-if="periods.length > 0" class="mb-4">
            <div class="mb-2 text-sm text-gray-500">24小时时段分布图</div>
            <div class="relative h-10 overflow-hidden rounded bg-gray-100">
              <div
                v-for="period in periods"
                :key="period.id"
                class="absolute h-full flex cursor-pointer items-center justify-center text-xs text-white transition-all hover:opacity-80"
                :style="getPeriodStyle(period)"
                :title="`${period.name}: ${period.startTime} - ${period.endTime}`"
              >
                {{ period.name }}
              </div>
            </div>
            <div class="mt-1 flex justify-between text-xs text-gray-400">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
            <div class="mt-2 flex gap-4">
              <div class="flex items-center gap-1">
                <span class="bg-peak h-3 w-3 rounded"></span>
                <span class="text-xs">峰时</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="bg-flat h-3 w-3 rounded"></span>
                <span class="text-xs">平时</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="bg-valley h-3 w-3 rounded"></span>
                <span class="text-xs">谷时</span>
              </div>
            </div>
          </div>

          <!-- Period table -->
          <ElTable v-loading="loading" :data="periods" border stripe>
            <ElTableColumn prop="name" label="时段名称" min-width="120" />
            <ElTableColumn prop="startTime" label="开始时间" width="100" />
            <ElTableColumn prop="endTime" label="结束时间" width="100" />
            <ElTableColumn label="时段类型" width="100" align="center">
              <template #default="{ row }">
                <ElTag :type="periodTypeMap[row.periodType]?.type || 'info'" size="small">
                  {{ periodTypeMap[row.periodType]?.label || '-' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="跨午夜" width="80" align="center">
              <template #default="{ row }">
                <ElTag v-if="row.crossMidnight" type="warning" size="small">是</ElTag>
                <span v-else class="text-gray-400">否</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="description" label="描述" min-width="150" />
            <ElTableColumn label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <ElButton link type="primary" @click="handleEditPeriod(row)">编辑</ElButton>
                <ElPopconfirm title="确定删除该时段？" @confirm="handleDeletePeriod(row.id)">
                  <template #reference>
                    <ElButton link type="danger">删除</ElButton>
                  </template>
                </ElPopconfirm>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <ElTabPane label="电价配置" name="prices">
          <div v-if="!searchParams.factoryId" class="py-8 text-center text-gray-400">请先选择工厂</div>
          <ElTable v-else v-loading="loading" :data="prices" border stripe>
            <ElTableColumn label="能源介质" min-width="120">
              <template #default="{ row }">
                {{ getMediumName(row.mediumId) }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="时段类型" width="100" align="center">
              <template #default="{ row }">
                <ElTag :type="periodTypeMap[row.periodType]?.type || 'info'" size="small">
                  {{ periodTypeMap[row.periodType]?.label || '-' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="电价" width="120" align="right">
              <template #default="{ row }">
                <span class="font-medium">{{ row.price.toFixed(4) }}</span>
                <span class="ml-1 text-xs text-gray-400">元/kWh</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="effectiveDate" label="生效日期" width="120" />
            <ElTableColumn prop="expireDate" label="失效日期" width="120">
              <template #default="{ row }">
                {{ row.expireDate || '长期有效' }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <ElButton link type="primary" @click="handleEditPrice(row)">编辑</ElButton>
                <ElPopconfirm title="确定删除该电价？" @confirm="handleDeletePrice(row.id)">
                  <template #reference>
                    <ElButton link type="danger">删除</ElButton>
                  </template>
                </ElPopconfirm>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <!-- Period Drawer -->
    <TouPeriodDrawer
      v-model="periodDrawerVisible"
      :operate-type="periodOperateType"
      :row-data="periodEditingData"
      :factory-id="searchParams.factoryId"
      @submitted="loadPeriods"
    />

    <!-- Price Drawer -->
    <TouPriceDrawer
      v-model="priceDrawerVisible"
      :operate-type="priceOperateType"
      :row-data="priceEditingData"
      :factory-id="searchParams.factoryId || 0"
      @submitted="loadPrices"
    />
  </div>
</template>

<style scoped>
.bg-peak {
  background-color: #f56c6c;
}
.bg-flat {
  background-color: #e6a23c;
}
.bg-valley {
  background-color: #409eff;
}
</style>
