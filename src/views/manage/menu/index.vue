<script setup lang="tsx">
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag, ElTree } from 'element-plus';
import { useBoolean } from '@sa/hooks';
import { fetchGetMenuTree, fetchMoveMenu, fetchUpdateMenu } from '@/service/api';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const { bool: visible, setTrue: openModal } = useBoolean();

const wrapperRef = ref<HTMLElement | null>(null);
const loading = ref(false);
const data: Ref<Api.SystemManage.MenuTree[]> = ref([]);
const treeRef = ref<InstanceType<typeof ElTree> | null>(null);

/** the edit menu data or the parent menu data when adding a child menu */
const editingData: Ref<Api.SystemManage.MenuTree | null> = ref(null);

const operateType = ref<OperateType>('edit');

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

// 是否文件夹颜色映射
const isFolderTagMap: Record<string, UI.ThemeColor> = {
  true: 'primary',
  false: 'info'
};

// ElTree 节点渲染内容
function renderNodeContent(h: any, { node, data }: { node: any; data: Api.SystemManage.MenuTree }) {
  const menuData = data;
  return h('div', { class: 'flex items-center justify-between w-full pr-8px' }, [
    // 左侧：图标 + 标题
    h('div', { class: 'flex items-center gap-8px' }, [
      h(SvgIcon, { icon: menuData.icon, class: 'text-icon' }),
      h('span', { class: 'font-medium' }, menuData.title || menuData.routeName),
      menuData.isFolder
        ? h(ElTag, { type: 'primary', size: 'small', class: 'ml-4px' }, $t('common.yesOrNo.yes'))
        : null
    ]),
    // 右侧：routeName + 状态 + 操作按钮
    h('div', { class: 'flex items-center gap-8px' }, [
      h('span', { class: 'text-gray-500 text-sm' }, menuData.routeName || '(纯目录)'),
      h(ElTag, { type: statusTagMap[menuData.status] || 'info', size: 'small' }, statusTextMap[menuData.status] || String(menuData.status)),
      h('span', { class: 'text-gray-400 text-sm' }, `#${menuData.sort}`),
      // 编辑按钮
      h(ElButton, {
        type: 'primary',
        plain: true,
        size: 'small',
        onClick: () => handleEdit(menuData)
      }, $t('common.edit')),
      // 状态切换按钮
      menuData.status !== 2
        ? h(ElPopconfirm, {
            title: menuData.status === 1 ? $t('page.manage.menu.confirmDisable') : $t('page.manage.menu.confirmEnable'),
            onConfirm: () => handleToggleStatus(menuData)
          }, {
            reference: () => h(ElButton, {
              type: menuData.status === 1 ? 'warning' : 'success',
              plain: true,
              size: 'small'
            }, menuData.status === 1 ? $t('page.manage.common.status.disable') : $t('page.manage.common.status.enable'))
          })
        : null
    ])
  ]);
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
function allowDrag(draggingNode: any) {
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
  <div ref="wrapperRef" class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.menu.title') }} ({{ totalCount }})</p>
          <div class="flex items-center gap-12px">
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
        <!-- 提示：拖拽可调整菜单层级 -->
        <div class="mb-8px text-gray-500 text-sm">
          <icon-ic-round-info class="text-icon mr-4px" />
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
          @node-drop="handleDrop"
          class="menu-tree"
        >
          <template #default="{ node, data }">
            <div class="flex items-center justify-between w-full pr-8px py-4px">
              <!-- 左侧：图标 + 标题 -->
              <div class="flex items-center gap-8px">
                <SvgIcon v-if="data.icon" :icon="data.icon" class="text-icon" />
                <span class="font-medium">{{ data.title || data.routeName }}</span>
                <ElTag v-if="data.isFolder" type="primary" size="small" class="ml-4px">
                  {{ $t('common.yesOrNo.yes') }}
                </ElTag>
              </div>
              <!-- 右侧：routeName + 状态 + 操作按钮 -->
              <div class="flex items-center gap-8px">
                <span class="text-gray-500 text-sm">{{ data.routeName || '(纯目录)' }}</span>
                <ElTag :type="statusTagMap[data.status] || 'info'" size="small">
                  {{ statusTextMap[data.status] || data.status }}
                </ElTag>
                <span class="text-gray-400 text-sm">#{{ data.sort }}</span>
                <!-- 编辑按钮 -->
                <ElButton type="primary" plain size="small" @click="handleEdit(data)">
                  {{ $t('common.edit') }}
                </ElButton>
                <!-- 状态切换按钮 -->
                <ElPopconfirm
                  v-if="data.status !== 2"
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