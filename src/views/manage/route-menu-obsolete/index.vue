<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import {
  ElButton,
  ElCard,
  ElInputNumber,
  ElMessage,
  ElMessageBox,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElTag
} from 'element-plus';
import { fetchDeleteObsoleteRoutes, fetchGetObsoleteRoutes, fetchRestoreRoute } from '@/service/api/route-menu';
import { $t } from '@/locales';

defineOptions({ name: 'RouteMenuObsoleteManage' });

const wrapperRef = ref<HTMLElement | null>(null);
const loading = ref(false);
const data: Ref<Api.RouteMenu.RouteObsoleteItem[]> = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const daysFilter = ref<number | undefined>(undefined);

// 批量选择
const selectedIds: Ref<number[]> = ref([]);

// 计算分页信息
const paginationInfo = computed(() => $t('datatable.itemCount', { total: total.value }));

// 获取废弃路由列表
async function getData() {
  loading.value = true;
  try {
    const response = await fetchGetObsoleteRoutes({
      days: daysFilter.value,
      page: page.value,
      pageSize: pageSize.value
    });
    data.value = response.data?.list || [];
    total.value = response.data?.total || 0;
    // 清空选择
    selectedIds.value = [];
  } catch {
    ElMessage.error($t('common.error') || '获取废弃路由列表失败');
  } finally {
    loading.value = false;
  }
}

// 恢复路由
async function handleRestore(id: number) {
  try {
    const { data: result } = await fetchRestoreRoute({ id });
    if (result?.success) {
      ElMessage.success($t('common.restoreSuccess') || '恢复成功');
      getData();
    } else {
      ElMessage.error(result?.message || $t('common.error') || '恢复失败');
    }
  } catch {
    ElMessage.error($t('common.error') || '恢复失败');
  }
}

// 批量恢复
async function handleBatchRestore() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning($t('common.selectFirst') || '请先选择要恢复的路由');
    return;
  }

  try {
    await ElMessageBox.confirm(
      $t('common.batchRestoreConfirm', { count: selectedIds.value.length }) ||
        `确定要批量恢复选中的 ${selectedIds.value.length} 个路由吗？`,
      $t('common.tip') || '提示',
      { type: 'warning' }
    );

    loading.value = true;

    // 使用 Promise.allSettled 并行处理，避免循环内 await
    const results = await Promise.allSettled(selectedIds.value.map(id => fetchRestoreRoute({ id })));

    let successCount = 0;
    let failCount = 0;

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.data?.success) {
        successCount += 1;
      } else {
        failCount += 1;
      }
    });

    if (successCount > 0) {
      ElMessage.success($t('common.batchRestoreSuccess', { count: successCount }) || `成功恢复 ${successCount} 个路由`);
    }
    if (failCount > 0) {
      ElMessage.warning($t('common.batchRestoreFail', { count: failCount }) || `${failCount} 个路由恢复失败`);
    }
    getData();
  } catch {
    // 用户取消
  } finally {
    loading.value = false;
  }
}

// 物理删除（单个）
async function handleDelete(ids: number[], _daysObsolete?: number) {
  // 检查废弃天数是否满足90天要求
  const minDays = 90;
  const itemsToDelete = data.value.filter(item => ids.includes(item.id));

  // 检查是否有不满足90天要求的路由
  const notReadyItems = itemsToDelete.filter(item => item.daysObsolete < minDays);
  if (notReadyItems.length > 0) {
    ElMessage.warning(
      $t('common.minObsoleteDaysWarning', { days: minDays, routes: notReadyItems.map(i => i.name).join(', ') }) ||
        `以下路由废弃天数不足 ${minDays} 天，无法删除：${notReadyItems.map(i => i.name).join(', ')}`
    );
    return;
  }

  try {
    // 显示废弃天数信息的确认弹窗
    const daysInfo = itemsToDelete.map(item => `${item.name}: ${item.daysObsolete}天`).join('\n');
    await ElMessageBox.confirm(
      `${$t('common.deleteConfirmWithDays') || '确定要物理删除以下路由吗？此操作不可恢复！'}\n\n${$t('common.obsoleteDaysInfo') || '废弃天数信息'}：\n${daysInfo}`,
      $t('common.confirmDelete') || '确认删除',
      {
        type: 'warning',
        confirmButtonText: $t('common.confirm') || '确认',
        cancelButtonText: $t('common.cancel') || '取消'
      }
    );

    const { data: success } = await fetchDeleteObsoleteRoutes({ ids, forceDays: minDays });
    if (success) {
      ElMessage.success($t('common.deleteSuccess') || '删除成功');
      getData();
    } else {
      ElMessage.error($t('common.error') || '删除失败');
    }
  } catch {
    // 用户取消
  } finally {
    loading.value = false;
  }
}

// 批量删除
async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning($t('common.selectFirst') || '请先选择要删除的路由');
    return;
  }

  await handleDelete(selectedIds.value);
}

// 格式化日期
function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
}

// 获取状态标签颜色
function getDaysColor(days: number): 'danger' | 'warning' | 'info' {
  if (days >= 90) return 'danger';
  if (days >= 60) return 'warning';
  return 'info';
}

// 表格选择变化
function handleSelectionChange(selection: Api.RouteMenu.RouteObsoleteItem[]) {
  selectedIds.value = selection.map(item => item.id);
}

// 是否可以批量删除（所有选中项都满足90天要求）
const canBatchDelete = computed(() => {
  if (selectedIds.value.length === 0) return false;
  const selectedItems = data.value.filter(item => selectedIds.value.includes(item.id));
  return selectedItems.every(item => item.daysObsolete >= 90);
});

// 筛选变化
function handleFilterChange() {
  page.value = 1;
  getData();
}

function init() {
  getData();
}

onMounted(() => {
  init();
});
</script>

<template>
  <div ref="wrapperRef" class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.menu.title') }} - {{ $t('page.manage.route.obsolete') }} ({{ paginationInfo }})</p>
          <div class="flex items-center gap-12px">
            <!-- 批量操作按钮 -->
            <ElButton type="success" plain :disabled="selectedIds.length === 0" @click="handleBatchRestore">
              {{ $t('page.manage.route.batchRestore') || '批量恢复' }}
            </ElButton>
            <ElButton type="danger" plain :disabled="!canBatchDelete" @click="handleBatchDelete">
              {{ $t('common.batchDelete') || '批量删除' }}
            </ElButton>
            <ElInputNumber
              v-model="daysFilter"
              placeholder="废弃天数筛选"
              :min="0"
              :max="365"
              clearable
              controls-position="right"
              style="width: 150px"
              @change="handleFilterChange"
            />
            <ElButton @click="getData">
              <template #icon>
                <icon-ic-round-refresh class="text-icon" />
              </template>
              {{ $t('common.refresh') || '刷新' }}
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
          @selection-change="handleSelectionChange"
        >
          <ElTableColumn type="selection" width="50" />
          <ElTableColumn prop="id" :label="$t('page.manage.menu.id')" width="80" />
          <ElTableColumn prop="name" :label="$t('page.manage.menu.routeName')" min-width="140" />
          <ElTableColumn prop="path" :label="$t('page.manage.menu.routePath')" min-width="140" />
          <ElTableColumn prop="title" :label="$t('page.manage.menu.menuName')" min-width="100">
            <template #default="{ row }">
              {{ row.title || '-' }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="obsoleteAt" :label="$t('page.manage.route.obsoleteTime')" min-width="160">
            <template #default="{ row }">
              {{ formatDate(row.obsoleteAt) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="daysObsolete" :label="$t('page.manage.route.obsoleteDays')" width="100">
            <template #default="{ row }">
              <ElTag :type="getDaysColor(row.daysObsolete)">{{ row.daysObsolete }} 天</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="$t('common.operate')" width="180" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center gap-8px">
                <ElButton type="primary" plain size="small" @click="handleRestore(row.id)">
                  {{ $t('common.restore') || '恢复' }}
                </ElButton>
                <ElButton
                  type="danger"
                  plain
                  size="small"
                  :disabled="row.daysObsolete < 90"
                  @click="handleDelete([row.id], row.daysObsolete)"
                >
                  {{ $t('common.delete') }}
                </ElButton>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="mt-16px flex justify-end">
          <ElPagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50, 100]"
            layout="total, sizes, prev, pager, next"
            @current-change="getData"
            @size-change="getData"
          />
        </div>
      </div>
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
