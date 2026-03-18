<script setup lang="tsx">
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTableColumn, ElTag } from 'element-plus';
import { useBoolean } from '@sa/hooks';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import { fetchDeleteMenu, fetchGetMenuList } from '@/service/api';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const { bool: visible, setTrue: openModal } = useBoolean();

const wrapperRef = ref<HTMLElement | null>(null);
const loading = ref(false);
const data: Ref<Api.SystemManage.Menu[]> = ref([]);

/** the edit menu data or the parent menu data when adding a child menu */
const editingData: Ref<Api.SystemManage.Menu | null> = ref(null);

const operateType = ref<OperateType>('add');

// 获取菜单列表（树形结构）
async function getData() {
  loading.value = true;
  try {
    const response = await fetchGetMenuList();
    // API返回 { data: { list: [...], total, page, pageSize } }
    data.value = response.data?.list || [];
  } catch {
    ElMessage.error('获取菜单列表失败');
  } finally {
    loading.value = false;
  }
}

// 计算总数（递归统计所有菜单）
const totalCount = computed(() => {
  function countMenus(menus: Api.SystemManage.Menu[]): number {
    let count = 0;
    for (const menu of menus) {
      count += 1;
      if (menu.children && menu.children.length > 0) {
        count += countMenus(menu.children);
      }
    }
    return count;
  }
  return countMenus(data.value);
});

// 菜单类型颜色映射
const menuTypeTagMap: Record<string, UI.ThemeColor> = {
  dir: 'info',
  menu: 'primary',
  button: 'warning'
};

// 状态颜色映射
const statusTagMap: Record<string, UI.ThemeColor> = {
  '1': 'success',
  '2': 'warning'
};

function handleAdd() {
  operateType.value = 'add';
  editingData.value = null;
  openModal();
}

// 删除菜单
async function handleDelete(id: number) {
  try {
    const { data: success } = await fetchDeleteMenu(id);
    if (success) {
      ElMessage.success('删除成功');
      getData();
    } else {
      ElMessage.error('删除失败');
    }
  } catch {
    ElMessage.error('删除失败');
  }
}

function handleEdit(item: Api.SystemManage.Menu) {
  operateType.value = 'edit';
  editingData.value = { ...item };
  openModal();
}

function handleAddChildMenu(item: Api.SystemManage.Menu) {
  operateType.value = 'addChild';
  editingData.value = { ...item };
  openModal();
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
            <ElButton type="primary" @click="handleAdd">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.add') }}
            </ElButton>
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
          :data="data"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          default-expand-all
        >
          <ElTableColumn prop="id" :label="$t('page.manage.menu.id')" width="80" />
          <ElTableColumn prop="menuType" :label="$t('page.manage.menu.menuType')" width="100">
            <template #default="{ row }">
              <ElTag :type="menuTypeTagMap[row.menuType] || 'info'">
                {{ $t(menuTypeRecord[row.menuType] || row.menuType) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="title" :label="$t('page.manage.menu.menuName')" min-width="150">
            <template #default="{ row }">
              <div class="ml-20px flex items-center gap-8px">
                <SvgIcon v-if="row.icon" :icon="row.icon" class="text-icon" />
                <span>{{ row.title }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="name" :label="$t('page.manage.menu.routeName')" min-width="140" />
          <ElTableColumn prop="path" :label="$t('page.manage.menu.routePath')" min-width="140" />
          <ElTableColumn prop="status" :label="$t('page.manage.menu.menuStatus')" width="90">
            <template #default="{ row }">
              <ElTag v-if="row.status" :type="statusTagMap[String(row.status)]">
                {{ $t(enableStatusRecord[String(row.status)] || row.status) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="hidden" :label="$t('page.manage.menu.hideInMenu')" width="90">
            <template #default="{ row }">
              <ElTag :type="row.hidden === 1 ? 'danger' : 'info'">
                {{ $t(yesOrNoRecord[row.hidden === 1 ? 'Y' : 'N']) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="sort" :label="$t('page.manage.menu.order')" width="70" />
          <ElTableColumn :label="$t('common.operate')" width="250" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center gap-8px">
                <ElButton
                  v-if="row.menuType === 'dir'"
                  type="primary"
                  plain
                  size="small"
                  @click="handleAddChildMenu(row)"
                >
                  {{ $t('page.manage.menu.addChildMenu') }}
                </ElButton>
                <ElButton type="primary" plain size="small" @click="handleEdit(row)">
                  {{ $t('common.edit') }}
                </ElButton>
                <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(row.id)">
                  <template #reference>
                    <ElButton type="danger" plain size="small">
                      {{ $t('common.delete') }}
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
