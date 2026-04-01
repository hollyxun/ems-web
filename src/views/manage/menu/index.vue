<script setup lang="tsx">
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTableColumn, ElTag } from 'element-plus';
import { useBoolean } from '@sa/hooks';
import { fetchGetRouteTree, fetchUpdateRoute } from '@/service/api';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const { bool: visible, setTrue: openModal } = useBoolean();

const wrapperRef = ref<HTMLElement | null>(null);
const loading = ref(false);
const data: Ref<Api.RouteMenu.RouteMenu[]> = ref([]);

/** the edit menu data or the parent menu data when adding a child menu */
const editingData: Ref<Api.RouteMenu.RouteMenu | null> = ref(null);

const operateType = ref<OperateType>('edit');

// 状态筛选
const statusFilter = ref<Api.RouteMenu.RouteMenuStatus | undefined>(undefined);

// 路由菜单状态选项
const statusOptions: { label: string; value: Api.RouteMenu.RouteMenuStatus | undefined }[] = [
  { label: $t('common.lookForward') || '全部', value: undefined },
  { label: $t('page.manage.common.status.enable'), value: 1 },
  { label: $t('page.manage.common.status.disable'), value: 2 },
  { label: $t('page.manage.route.obsolete'), value: 3 }
];

// 获取路由菜单树
async function getData() {
  loading.value = true;
  try {
    const response = await fetchGetRouteTree();
    data.value = response.data || [];
  } catch {
    ElMessage.error('获取路由菜单列表失败');
  } finally {
    loading.value = false;
  }
}

// 根据状态筛选后的数据
const filteredData = computed(() => {
  if (statusFilter.value === undefined) {
    return data.value;
  }
  return filterByStatus(data.value, statusFilter.value);
});

// 递归筛选指定状态的路由
function filterByStatus(
  routes: Api.RouteMenu.RouteMenu[],
  status: Api.RouteMenu.RouteMenuStatus
): Api.RouteMenu.RouteMenu[] {
  return routes
    .map(route => {
      if (route.children && route.children.length > 0) {
        const filteredChildren = filterByStatus(route.children, status);
        if (filteredChildren.length > 0 || route.status === status) {
          return { ...route, children: filteredChildren };
        }
        return null;
      }
      return route.status === status ? route : null;
    })
    .filter((route): route is Api.RouteMenu.RouteMenu => route !== null);
}

// 计算总数（递归统计所有路由）
const totalCount = computed(() => {
  function countRoutes(routes: Api.RouteMenu.RouteMenu[]): number {
    let count = 0;
    for (const route of routes) {
      count += 1;
      if (route.children && route.children.length > 0) {
        count += countRoutes(route.children);
      }
    }
    return count;
  }
  return countRoutes(filteredData.value);
});

// 状态颜色映射
const statusTagMap: Record<number, UI.ThemeColor> = {
  1: 'success',
  2: 'warning',
  3: 'danger'
};

// 状态文本映射
const statusTextMap: Record<number, string> = {
  1: $t('page.manage.common.status.enable'),
  2: $t('page.manage.common.status.disable'),
  3: $t('page.manage.route.obsolete')
};

// 是否常量路由
const isConstantTagMap: Record<string, UI.ThemeColor> = {
  true: 'primary',
  false: 'info'
};

function handleEdit(item: Api.RouteMenu.RouteMenu) {
  operateType.value = 'edit';
  editingData.value = { ...item };
  openModal();
}

// 切换状态（启用/禁用）
async function handleToggleStatus(item: Api.RouteMenu.RouteMenu) {
  const newStatus = item.status === 1 ? 2 : 1;
  const statusText = newStatus === 1 ? '启用' : '禁用';

  try {
    const { error } = await fetchUpdateRoute({
      id: item.id,
      status: newStatus as Api.RouteMenu.RouteMenuStatus
    });
    if (!error) {
      ElMessage.success(`${statusText}成功`);
      getData();
    } else {
      ElMessage.error(`${statusText}失败`);
    }
  } catch {
    ElMessage.error(`${statusText}失败`);
  }
}

function init() {
  getData();
}

// init
init();
</script>

<template>
  <div ref="wrapperRef" class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.menu.title') }} ({{ totalCount }})</p>
          <div class="flex items-center gap-12px">
            <ElSelect v-model="statusFilter" :placeholder="$t('page.manage.menu.statusFilter')" class="w-120px" clearable>
              <ElOption
                v-for="item in statusOptions"
                :key="item.label"
                :label="item.label"
                :value="item.value as number"
              />
            </ElSelect>
            <ElButton @click="getData">
              <template #icon>
                <icon-ic-round-refresh class="text-icon" />
              </template>
              {{ $t('common.refresh') }}
            </ElButton>
          </div>
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable
          v-loading="loading"
          height="100%"
          border
          class="sm:h-full"
          :data="filteredData"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          default-expand-all
        >
          <ElTableColumn prop="id" :label="$t('page.manage.menu.id')" width="80" />
          <ElTableColumn prop="title" :label="$t('page.manage.menu.menuName')" min-width="180">
            <template #default="{ row }">
              <div class="ml-20px flex items-center gap-8px">
                <SvgIcon v-if="row.icon" :icon="row.icon" class="text-icon" />
                <span>{{ row.title || row.name }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="name" :label="$t('page.manage.menu.routeName')" min-width="160" />
          <ElTableColumn prop="path" :label="$t('page.manage.menu.routePath')" min-width="160" />
          <ElTableColumn prop="component" :label="$t('page.manage.menu.componentPath')" min-width="140">
            <template #default="{ row }">
              <span v-if="row.component" class="text-gray-600">{{ row.component }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="isConstant" :label="$t('page.manage.menu.constant')" width="100">
            <template #default="{ row }">
              <ElTag :type="isConstantTagMap[String(row.isConstant)] || 'info'" size="small">
                {{ row.isConstant ? $t('common.yesOrNo.yes') : $t('common.yesOrNo.no') }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="status" :label="$t('page.manage.menu.menuStatus')" width="90">
            <template #default="{ row }">
              <ElTag :type="statusTagMap[row.status] || 'info'">
                {{ statusTextMap[row.status] || row.status }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="sort" :label="$t('page.manage.menu.order')" width="70" />
          <ElTableColumn :label="$t('common.operate')" width="180" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center gap-8px">
                <ElButton type="primary" plain size="small" @click="handleEdit(row)">
                  {{ $t('common.edit') }}
                </ElButton>
                <ElPopconfirm
                  v-if="row.status !== 3"
                  :title="row.status === 1 ? $t('page.manage.menu.confirmDisable') : $t('page.manage.menu.confirmEnable')"
                  @confirm="handleToggleStatus(row)"
                >
                  <template #reference>
                    <ElButton :type="row.status === 1 ? 'warning' : 'success'" plain size="small">
                      {{ row.status === 1 ? $t('page.manage.common.status.disable') : $t('page.manage.common.status.enable') }}
                    </ElButton>
                  </template>
                </ElPopconfirm>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      <MenuOperateModal
        v-model:visible="visible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>
