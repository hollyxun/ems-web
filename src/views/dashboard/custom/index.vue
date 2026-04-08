<script setup lang="ts">
import { ref, onMounted, computed, shallowRef } from 'vue';
import { ElCard, ElButton, ElEmpty, ElTag, ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus';
import { fetchGetDashboardConfig, fetchSaveDashboardConfig } from '@/service/api/dashboard';
import { builtinComponents, componentsByCategory, categoryNames, getComponent, type DashboardComponentType } from './components/index';
import ComponentConfigDrawer from './modules/component-config-drawer.vue';

defineOptions({ name: 'CustomDashboard' });

interface LayoutItem {
  id: string;
  componentId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: Record<string, any>;
}

const isEditing = ref(false);
const layoutItems = ref<LayoutItem[]>([]);
const selectedComponentType = ref<DashboardComponentType | null>(null);
const selectedLayoutItem = ref<LayoutItem | null>(null);
const configDrawerVisible = ref(false);
const dashboardName = ref('我的看板');
const dashboardId = ref<number | null>(null);

// 组件实例引用（用于刷新）
const componentRefs = shallowRef<Record<string, any>>({});

const gridCols = 12;
const rowHeight = 80;

async function loadDashboard() {
  const { data } = await fetchGetDashboardConfig({ owner_type: 'user' });
  if (data) {
    dashboardId.value = data.id;
    dashboardName.value = data.name || '我的看板';
    try {
      layoutItems.value = JSON.parse(data.layout_json || '[]');
    } catch {
      layoutItems.value = [];
    }
  }
}

function handleAddComponent(componentId: string) {
  const comp = getComponent(componentId);
  if (!comp) return;

  const maxY = layoutItems.value.reduce((max, item) => Math.max(max, item.y + item.h), 0);
  const item: LayoutItem = {
    id: `${componentId}_${Date.now()}`,
    componentId,
    title: comp.name,
    x: 0,
    y: maxY,
    w: comp.defaultSize.w,
    h: comp.defaultSize.h,
    config: {}
  };
  layoutItems.value.push(item);
}

function handleRemoveComponent(id: string) {
  layoutItems.value = layoutItems.value.filter(item => item.id !== id);
}

function handleComponentClick(item: LayoutItem) {
  if (!isEditing.value) return;

  const comp = getComponent(item.componentId);
  selectedComponentType.value = comp || null;
  selectedLayoutItem.value = item;
  configDrawerVisible.value = true;
}

function handleConfigSave(config: Record<string, any>) {
  if (selectedLayoutItem.value) {
    selectedLayoutItem.value.config = config;
    selectedLayoutItem.value.title = config.title || selectedLayoutItem.value.title;
  }
  configDrawerVisible.value = false;
}

function handleConfigClose() {
  configDrawerVisible.value = false;
  selectedComponentType.value = null;
  selectedLayoutItem.value = null;
}

function getComponentStyle(item: LayoutItem) {
  const colWidth = 100 / gridCols;
  return {
    position: 'absolute' as const,
    left: `${item.x * colWidth}%`,
    top: `${item.y * rowHeight}px`,
    width: `${item.w * colWidth}%`,
    height: `${item.h * rowHeight}px`
  };
}

async function handleSave() {
  const data = {
    id: dashboardId.value || undefined,
    name: dashboardName.value,
    layout_json: JSON.stringify(layoutItems.value),
    is_default: true
  };
  const res = await fetchSaveDashboardConfig(data);
  if (res.data) {
    dashboardId.value = res.data.id;
    ElMessage.success('看板已保存');
    isEditing.value = false;
  }
}

function handleResetLayout() {
  layoutItems.value = [];
}

// 刷新所有组件
function refreshAllComponents() {
  Object.values(componentRefs.value).forEach((ref: any) => {
    if (ref?.refresh) ref.refresh();
  });
  ElMessage.success('已刷新所有组件');
}

const containerHeight = computed(() => {
  if (layoutItems.value.length === 0) return '400px';
  const maxY = layoutItems.value.reduce((max, item) => Math.max(max, item.y + item.h), 0);
  return `${(maxY + 1) * rowHeight}px`;
});

onMounted(() => {
  loadDashboard();
});
</script>

<template>
  <div class="h-full flex flex-col" style="background: #1E2028; color: #e5e7eb;">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between px-4 py-3 border-b" style="border-color: rgba(255,255,255,0.06);">
      <div class="flex items-center gap-3">
        <h2 class="text-lg font-semibold">{{ dashboardName }}</h2>
        <ElTag v-if="isEditing" size="small" type="warning">编辑中</ElTag>
      </div>
      <div class="flex items-center gap-2">
        <template v-if="isEditing">
          <!-- 添加组件下拉 -->
          <ElDropdown trigger="click" @command="handleAddComponent">
            <ElButton size="small" type="primary">
              <icon-mdi:plus class="mr-1" />
              添加组件
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <!-- 按类别分组 -->
                <template v-for="category in Object.keys(componentsByCategory)" :key="category">
                  <div class="px-3 py-1 text-xs text-gray-400 font-medium">{{ categoryNames[category] }}</div>
                  <ElDropdownItem
                    v-for="comp in componentsByCategory[category]"
                    :key="comp.id"
                    :command="comp.id"
                  >
                    <div class="flex items-center gap-2">
                      <ElIcon>
                        <icon-mdi:chart-bar v-if="comp.icon === 'mdi:chart-bar'" />
                        <icon-mdi:trophy v-if="comp.icon === 'mdi:trophy'" />
                        <icon-mdi:clipboard-check v-if="comp.icon === 'mdi:clipboard-check'" />
                        <icon-mdi:server v-if="comp.icon === 'mdi:server'" />
                        <icon-mdi:gauge v-if="comp.icon === 'mdi:gauge'" />
                        <icon-mdi:calendar v-if="comp.icon === 'mdi:calendar'" />
                        <icon-mdi:bell-ring v-if="comp.icon === 'mdi:bell-ring'" />
                        <icon-mdi:chart-line v-if="comp.icon === 'mdi:chart-line'" />
                        <icon-mdi:speedometer v-if="comp.icon === 'mdi:speedometer'" />
                        <icon-mdi:account-star v-if="comp.icon === 'mdi:account-star'" />
                        <icon-mdi:lightning-bolt v-if="comp.icon === 'mdi:lightning-bolt'" />
                      </ElIcon>
                      <span>{{ comp.name }}</span>
                    </div>
                  </ElDropdownItem>
                </template>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
          <ElButton size="small" @click="handleResetLayout">清空</ElButton>
          <ElButton size="small" type="success" @click="handleSave">保存</ElButton>
          <ElButton size="small" @click="isEditing = false">取消</ElButton>
        </template>
        <template v-else>
          <ElButton size="small" @click="refreshAllComponents">
            <icon-mdi:refresh class="mr-1" />
            刷新
          </ElButton>
          <ElButton size="small" @click="isEditing = true">编辑看板</ElButton>
        </template>
      </div>
    </div>

    <!-- 看板内容区 -->
    <div class="flex-1 overflow-auto p-4 relative" :style="{ minHeight: containerHeight }">
      <!-- 编辑态网格辅助线 -->
      <div
        v-if="isEditing"
        class="absolute inset-0 pointer-events-none opacity-10"
        style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: calc(100% / 12) 80px;"
      />

      <!-- 空状态 -->
      <ElEmpty v-if="layoutItems.length === 0" description="暂无组件，点击「编辑看板」添加组件">
        <ElButton type="primary" @click="isEditing = true">开始编辑</ElButton>
      </ElEmpty>

      <!-- 组件卡片 -->
      <div
        v-for="item in layoutItems"
        :key="item.id"
        class="dashboard-widget"
        :class="{ 'editing': isEditing }"
        :style="getComponentStyle(item)"
        @click="handleComponentClick(item)"
      >
        <div class="widget-header">
          <span class="widget-title">{{ item.title }}</span>
          <div v-if="isEditing" class="widget-actions">
            <ElButton type="danger" size="small" text @click.stop="handleRemoveComponent(item.id)">
              <icon-mdi:close />
            </ElButton>
          </div>
        </div>
        <div class="widget-body">
          <!-- 动态渲染实际组件 -->
          <component
            :is="getComponent(item.componentId)?.component"
            :ref="(el: any) => componentRefs[item.id] = el"
            :config="item.config"
            :refresh-interval="item.config.refreshInterval"
          />
        </div>
      </div>
    </div>

    <!-- 组件配置抽屉 -->
    <ComponentConfigDrawer
      :visible="configDrawerVisible"
      :component="selectedComponentType"
      :config="selectedLayoutItem?.config || {}"
      @close="handleConfigClose"
      @save="handleConfigSave"
    />
  </div>
</template>

<style scoped>
.dashboard-widget {
  border-radius: 8px;
  background: #252830;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s;
}

.dashboard-widget.editing {
  cursor: pointer;
}

.dashboard-widget.editing:hover {
  box-shadow: 0 0 0 2px #F59E0B;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 13px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.2);
}

.widget-title {
  font-family: 'DM Sans', sans-serif;
}

.widget-body {
  flex: 1;
  padding: 0;
  overflow: hidden;
}
</style>