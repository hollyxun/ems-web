<script setup lang="tsx">
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { ElButton, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import { useBoolean } from '@sa/hooks';
import { enableStatusRecord } from '@/constants/business';
import { fetchDeleteDepartment, fetchGetDepartmentTree } from '@/service/api';
import { $t } from '@/locales';
import DepartmentOperateModal, { type OperateType } from './modules/department-operate-modal.vue';

defineOptions({ name: 'DepartmentManage' });

const { bool: visible, setTrue: openModal } = useBoolean();

const loading = ref(false);
const data: Ref<Api.SystemManage.Department[]> = ref([]);

// 获取部门列表（树形结构）
async function getData() {
  loading.value = true;
  try {
    const response = await fetchGetDepartmentTree();
    data.value = response.data || [];
  } catch (error) {
    console.error('获取部门列表失败:', error);
    ElMessage.error('获取部门列表失败');
  } finally {
    loading.value = false;
  }
}

// 计算总数（递归统计所有部门）
const totalCount = computed(() => {
  function countDepartments(departments: Api.SystemManage.Department[]): number {
    let count = 0;
    for (const dept of departments) {
      count += 1;
      if (dept.children && dept.children.length > 0) {
        count += countDepartments(dept.children);
      }
    }
    return count;
  }
  return countDepartments(data.value);
});

// 状态颜色映射
const statusTagMap: Record<number, UI.ThemeColor> = {
  1: 'success',
  2: 'danger'
};

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  editingData.value = null;
  openModal();
}

// 删除部门
async function handleDelete(id: number) {
  try {
    const { data: success } = await fetchDeleteDepartment(id);
    if (success) {
      ElMessage.success('删除成功');
      getData();
    }
  } catch (error) {
    console.error('删除部门失败:', error);
    ElMessage.error('删除失败');
  }
}

/** the edit department data or the parent department data when adding a child department */
const editingData: Ref<Api.SystemManage.Department | null> = ref(null);

function handleEdit(item: Api.SystemManage.Department) {
  operateType.value = 'edit';
  editingData.value = { ...item };
  openModal();
}

function handleAddChildDepartment(item: Api.SystemManage.Department) {
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
  <div class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>部门管理 ({{ totalCount }})</p>
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
          <ElTableColumn prop="name" label="部门名称" min-width="180" />
          <ElTableColumn prop="phone" label="联系电话" width="140" />
          <ElTableColumn prop="email" label="邮箱" min-width="180" />
          <ElTableColumn prop="sort" label="排序" width="80" align="center" />
          <ElTableColumn prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <ElTag :type="statusTagMap[row.status] || 'info'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="createdAt" label="创建时间" width="300" />
          <ElTableColumn :label="$t('common.operate')" width="240" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center gap-8px">
                <ElButton type="primary" plain size="small" @click="handleAddChildDepartment(row)">添加子部门</ElButton>
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
      <DepartmentOperateModal
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
