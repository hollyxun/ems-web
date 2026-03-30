<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import {
  ElButton,
  ElCard,
  ElInputNumber,
  ElMessage,
  ElPagination,
  ElPopconfirm,
  ElTable,
  ElTableColumn,
  ElTag
} from 'element-plus';
import { fetchDeleteObsoleteRoutes, fetchGetObsoleteRoutes, fetchRestoreRoute } from '@/service/api/route-menu';

defineOptions({ name: 'RouteMenuObsoleteManage' });

const wrapperRef = ref<HTMLElement | null>(null);
const loading = ref(false);
const data: Ref<Api.RouteMenu.RouteObsoleteItem[]> = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const daysFilter = ref<number | undefined>(undefined);

// 计算分页信息
const paginationInfo = computed(() => `共 ${total.value} 条`);

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
  } catch {
    ElMessage.error('获取废弃路由列表失败');
  } finally {
    loading.value = false;
  }
}

// 恢复路由
async function handleRestore(id: number) {
  try {
    const { data: result } = await fetchRestoreRoute({ id });
    if (result?.success) {
      ElMessage.success('恢复成功');
      getData();
    } else {
      ElMessage.error(result?.message || '恢复失败');
    }
  } catch {
    ElMessage.error('恢复失败');
  }
}

// 物理删除
async function handleDelete(ids: number[]) {
  try {
    const { data: success } = await fetchDeleteObsoleteRoutes({ ids, forceDays: 90 });
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
          <p>废弃路由管理 ({{ paginationInfo }})</p>
          <div class="flex items-center gap-12px">
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
              刷新
            </ElButton>
          </div>
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data">
          <ElTableColumn prop="id" label="ID" width="80" />
          <ElTableColumn prop="name" label="路由名称" min-width="140" />
          <ElTableColumn prop="path" label="路由路径" min-width="140" />
          <ElTableColumn prop="title" label="标题" min-width="100">
            <template #default="{ row }">
              {{ row.title || '-' }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="obsoleteAt" label="废弃时间" min-width="160">
            <template #default="{ row }">
              {{ formatDate(row.obsoleteAt) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="daysObsolete" label="废弃天数" width="100">
            <template #default="{ row }">
              <ElTag :type="getDaysColor(row.daysObsolete)">{{ row.daysObsolete }} 天</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center gap-8px">
                <ElButton type="primary" plain size="small" @click="handleRestore(row.id)">恢复</ElButton>
                <ElPopconfirm title="确定要物理删除该路由吗？此操作不可恢复！" @confirm="handleDelete([row.id])">
                  <template #reference>
                    <ElButton type="danger" plain size="small" :disabled="row.daysObsolete < 90">删除</ElButton>
                  </template>
                </ElPopconfirm>
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
