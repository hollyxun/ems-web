<script setup lang="tsx">
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import {
  ElButton,
  ElMessage,
  ElPopconfirm,
  ElRadioButton,
  ElRadioGroup,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTree
} from 'element-plus';
import { useBoolean } from '@sa/hooks';
import { fetchGetMenuTree, fetchMoveMenu, fetchUpdateMenu } from '@/service/api';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { getRoutePath } from '@/router/elegant/transform';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const { bool: visible, setTrue: openModal } = useBoolean();

const loading = ref(false);
const data: Ref<Api.SystemManage.MenuTree[]> = ref([]);
const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
const tableRef = ref<InstanceType<typeof ElTable> | null>(null);

/** the edit menu data or the parent menu data when adding a child menu */
const editingData: Ref<Api.SystemManage.MenuTree | null> = ref(null);

const operateType = ref<OperateType>('edit');

// 视图模式：tree | table
const viewMode = ref<'tree' | 'table'>('tree');

// 状态筛选
const statusFilter = ref<Api.SystemManage.MenuStatus | undefined>(undefined);

// 菜单状态选项
const statusOptions: { label: string; value: Api.SystemManage.MenuStatus | undefined }[] = [
  { label: $t('common.lookForward') || '全部', value: undefined },
  { label: $t('page.manage.common.status.enable'), value: 1 },
  { label: $t('page.manage.route.obsolete'), value: 2 }
];

// 获取菜单树
async function getData() {
  loading.value = true;
  try {
    const response = await fetchGetMenuTree();
    data.value = response.data || [];
  } catch {
    ElMessage.error('获取菜单列表失败');
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

// 递归筛选指定状态的菜单
function filterByStatus(
  menus: Api.SystemManage.MenuTree[],
  status: Api.SystemManage.MenuStatus
): Api.SystemManage.MenuTree[] {
  return menus
    .map(menu => {
      if (menu.children && menu.children.length > 0) {
        const filteredChildren = filterByStatus(menu.children, status);
        if (filteredChildren.length > 0 || menu.status === status) {
          return { ...menu, children: filteredChildren };
        }
        return null;
      }
      return menu.status === status ? menu : null;
    })
    .filter((menu): menu is Api.SystemManage.MenuTree => menu !== null);
}

// 计算总数（递归统计所有菜单）
const totalCount = computed(() => {
  function countMenus(menus: Api.SystemManage.MenuTree[]): number {
    let count = 0;
    for (const menu of menus) {
      count += 1;
      if (menu.children && menu.children.length > 0) {
        count += countMenus(menu.children);
      }
    }
    return count;
  }
  return countMenus(filteredData.value);
});

// 状态颜色映射
const statusTagMap: Record<number, UI.ThemeColor> = {
  1: 'success',
  2: 'danger'
};

// 状态文本映射
const statusTextMap: Record<number, string> = {
  1: $t('page.manage.common.status.enable'),
  2: $t('page.manage.route.obsolete')
};

// 获取路由路径
function getRoutePathDisplay(routeName: string): string {
  if (!routeName) return '';
  try {
    return getRoutePath(routeName as any) || '';
  } catch {
    return '';
  }
}

// 获取 i18n 翻译（使用 any 类型绕过严格类型检查）
function getRouteI18n(routeName: string): string {
  const i18nKey = `route.${routeName}` as any;
  return $t(i18nKey) || routeName;
}

function handleEdit(item: Api.SystemManage.MenuTree) {
  operateType.value = 'edit';
  editingData.value = { ...item };
  openModal();
}

// 切换状态（启用/废弃）
async function handleToggleStatus(item: Api.SystemManage.MenuTree) {
  const newStatus = item.status === 1 ? 2 : 1;
  const statusText = newStatus === 1 ? '启用' : '标记废弃';

  try {
    const { error } = await fetchUpdateMenu({
      id: item.id,
      status: newStatus as Api.SystemManage.MenuStatus
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

// 拖拽完成后更新父级
async function handleDrop(draggingNode: any, dropNode: any, dropType: string) {
  const dragData = draggingNode.data as Api.SystemManage.MenuTree;
  const dropData = dropNode.data as Api.SystemManage.MenuTree;

  // 计算新的父级ID
  let newParentId: number | null = null;
  if (dropType === 'inner') {
    // 拖入节点内部，成为其子节点
    newParentId = dropData.id;
  } else {
    // 拖到节点前/后/next，同级，继承父级
    newParentId = dropData.parentMenuId || null;
  }

  // 检查是否实际发生变化
  const currentParentId = dragData.parentMenuId || null;
  if (currentParentId === newParentId) {
    return; // 无变化
  }

  // 检查是否拖到自己下面（循环）
  if (newParentId === dragData.id) {
    ElMessage.warning('不能将菜单移动到自己下面');
    return;
  }

  try {
    const { error } = await fetchMoveMenu({
      id: dragData.id,
      parentMenuId: newParentId
    });
    if (!error) {
      ElMessage.success('移动成功');
      getData();
    } else {
      ElMessage.error('移动失败');
    }
  } catch {
    ElMessage.error('移动失败');
  }
}

// 允许拖拽判断
function allowDrag(_draggingNode: any) {
  return true; // 所有节点都允许拖拽
}

// 允许放置判断
function allowDrop(draggingNode: any, dropNode: any, type: string) {
  // 禁止拖到自己内部（防止循环）
  if (type === 'inner' && draggingNode.data.id === dropNode.data.id) {
    return false;
  }
  return true;
}

function init() {
  getData();
}

// init
init();
</script>

<template>
  <div class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.menu.title') }} ({{ totalCount }})</p>
          <div class="flex items-center gap-12px">
            <!-- 视图模式切换 -->
            <ElRadioGroup v-model="viewMode" size="small">
              <ElRadioButton value="tree">
                <icon-ic-round-account-tree class="mr-4px" />
                树形
              </ElRadioButton>
              <ElRadioButton value="table">
                <icon-ic-round-table-chart class="mr-4px" />
                表格
              </ElRadioButton>
            </ElRadioGroup>
            <ElSelect
              v-model="statusFilter"
              :placeholder="$t('page.manage.menu.statusFilter')"
              class="w-120px"
              clearable
            >
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
        <!-- Tree 视图 -->
        <template v-if="viewMode === 'tree'">
          <!-- 提示：拖拽可调整菜单层级 -->
          <div class="mb-8px text-sm text-gray-500">
            <icon-ic-round-info class="mr-4px text-icon" />
            拖拽菜单可调整层级结构
          </div>
          <ElTree
            ref="treeRef"
            v-loading="loading"
            :data="filteredData"
            :props="{ children: 'children', label: 'title' }"
            node-key="id"
            default-expand-all
            draggable
            :allow-drag="allowDrag"
            :allow-drop="allowDrop"
            class="menu-tree"
            @node-drop="handleDrop"
          >
            <template #default="{ data }">
              <div class="w-full flex items-center justify-between py-4px pr-8px">
                <!-- 左侧：图标 + 标题 -->
                <div class="flex items-center gap-8px">
                  <SvgIcon v-if="data.icon" :icon="data.icon" class="text-icon" />
                  <span class="font-medium">{{ data.title || getRouteI18n(data.routeName) || data.routeName }}</span>
                  <ElTag v-if="data.isFolder" type="primary" size="small" class="ml-4px">
                    {{ $t('common.yesOrNo.yes') }}
                  </ElTag>
                </div>
                <!-- 右侧：路由信息 + 状态 + 操作按钮 -->
                <div class="flex items-center gap-8px">
                  <span v-if="getRoutePathDisplay(data.routeName)" class="text-sm text-gray-400">
                    {{ getRoutePathDisplay(data.routeName) }}
                  </span>
                  <span class="text-sm text-gray-500">{{ data.routeName || '(纯目录)' }}</span>
                  <span v-if="data.title" class="text-sm text-primary">{{ getRouteI18n(data.routeName) }}</span>
                  <ElTag v-if="data.hideInMenu" type="warning" size="small">隐藏</ElTag>
                  <ElTag :type="statusTagMap[data.status] || 'info'" size="small">
                    {{ statusTextMap[data.status] || data.status }}
                  </ElTag>
                  <span class="text-sm text-gray-400">#{{ data.sort }}</span>
                  <ElButton v-permission="'menu:update'" type="primary" plain size="small" @click="handleEdit(data)">
                    {{ $t('common.edit') }}
                  </ElButton>
                  <ElPopconfirm
                    v-if="data.status !== 2"
                    v-permission="'menu:update'"
                    :title="
                      data.status === 1 ? $t('page.manage.menu.confirmDisable') : $t('page.manage.menu.confirmEnable')
                    "
                    @confirm="handleToggleStatus(data)"
                  >
                    <template #reference>
                      <ElButton :type="data.status === 1 ? 'warning' : 'success'" plain size="small">
                        {{
                          data.status === 1
                            ? $t('page.manage.common.status.disable')
                            : $t('page.manage.common.status.enable')
                        }}
                      </ElButton>
                    </template>
                  </ElPopconfirm>
                </div>
              </div>
            </template>
          </ElTree>
        </template>

        <!-- Table 视图（树形表格） -->
        <template v-else>
          <ElTable
            ref="tableRef"
            v-loading="loading"
            :data="filteredData"
            border
            stripe
            height="100%"
            row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            default-expand-all
          >
            <ElTableColumn label="菜单名称" min-width="150">
              <template #default="{ row }">
                <div class="flex items-center gap-4px">
                  <SvgIcon v-if="row.icon" :icon="row.icon" class="text-icon" />
                  <span class="font-medium">
                    {{ row.title || getRouteI18n(row.routeName) || row.routeName }}
                  </span>
                  <ElTag v-if="row.isFolder" type="primary" size="small">
                    {{ $t('common.yesOrNo.yes') }}
                  </ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="routeName" label="路由名称" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="text-gray-600">{{ row.routeName || '(纯目录)' }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="路由路径" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="text-gray-400">{{ getRoutePathDisplay(row.routeName) }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="i18n 翻译" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="text-primary">{{ getRouteI18n(row.routeName) }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="sort" label="排序" width="80" align="center">
              <template #default="{ row }">
                <span class="text-gray-400">#{{ row.sort }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <ElTag :type="statusTagMap[row.status] || 'info'" size="small">
                  {{ statusTextMap[row.status] || row.status }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="隐藏" width="80" align="center">
              <template #default="{ row }">
                <ElTag v-if="row.hideInMenu" type="warning" size="small">隐藏</ElTag>
                <span v-else class="text-gray-400">-</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="140" align="center" fixed="right">
              <template #default="{ row }">
                <div class="flex-center gap-4px">
                  <ElButton v-permission="'menu:update'" type="primary" plain size="small" @click="handleEdit(row)">
                    {{ $t('common.edit') }}
                  </ElButton>
                  <ElPopconfirm
                    v-if="row.status !== 2"
                    v-permission="'menu:update'"
                    :title="
                      row.status === 1 ? $t('page.manage.menu.confirmDisable') : $t('page.manage.menu.confirmEnable')
                    "
                    @confirm="handleToggleStatus(row)"
                  >
                    <template #reference>
                      <ElButton :type="row.status === 1 ? 'warning' : 'success'" plain size="small">
                        {{
                          row.status === 1
                            ? $t('page.manage.common.status.disable')
                            : $t('page.manage.common.status.enable')
                        }}
                      </ElButton>
                    </template>
                  </ElPopconfirm>
                </div>
              </template>
            </ElTableColumn>
          </ElTable>
        </template>
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

:deep(.menu-tree) {
  .el-tree-node__content {
    height: auto;
    padding: 4px 0;
  }
}
</style>
