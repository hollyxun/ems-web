<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElDialog, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import dayjs from 'dayjs';
import {
  fetchBatchDeleteFactoryCalendars,
  fetchDeleteFactoryCalendar,
  fetchGenerateFactoryCalendar,
  fetchGetFactoryCalendarList,
  fetchGetFactoryCalendarView,
  fetchUpdateMappingConfig
} from '@/service/api/scheduling';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import FactoryCalendarSearch from './modules/factoryCalendar-search.vue';
import CalendarMappingConfigDrawer from './modules/calendar-mapping-config-drawer.vue';

defineOptions({ name: 'FactoryCalendarManage' });

const searchParams = ref(getInitSearchParams());
const showDetailDialog = ref(false);
const currentCalendar = ref<Api.Scheduling.FactoryCalendarView | null>(null);
const showGenerateDialog = ref(false);

// 日历映射配置抽屉
const mappingDrawerVisible = ref(false);
const editingCalendarId = ref<number>(0);
const editingMappingConfig = ref<
  | {
      mappingRuleId?: number;
      mappingConfig?: string;
      naturalMonthStart?: number;
    }
  | undefined
>();

const generateForm = ref({
  year: dayjs().year(),
  month: dayjs().month() + 1,
  calendarCode: '',
  calendarName: '',
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  weekendDays: [0, 6] as number[],
  holidays: [] as Array<{ date: string; holidayName: string; isWorkDay: boolean }>
});

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function getInitSearchParams(): Api.Scheduling.FactoryCalendarSearchParams {
  return {
    page: 1,
    pageSize: 10,
    year: undefined,
    month: undefined,
    factoryMonth: undefined,
    calendarCode: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.page,
    pageSize: searchParams.value.pageSize
  },
  api: () => fetchGetFactoryCalendarList(searchParams.value),
  transform: response => {
    return defaultTransform(response);
  },
  onPaginationParamsChange: params => {
    searchParams.value.page = params.currentPage;
    searchParams.value.pageSize = params.pageSize;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48 },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'calendarName', label: '日历名称', minWidth: 150 },
    { prop: 'calendarCode', label: '日历编码', minWidth: 120 },
    { prop: 'factoryMonth', label: '工厂月', width: 120, align: 'center' },
    {
      prop: 'dateRange',
      label: '日期范围',
      minWidth: 200,
      formatter: row => {
        const start = row.startDate ? dayjs(row.startDate).format('YYYY-MM-DD') : '-';
        const end = row.endDate ? dayjs(row.endDate).format('YYYY-MM-DD') : '-';
        return `${start} ~ ${end}`;
      }
    },
    { prop: 'workDays', label: '工作日', width: 80, align: 'center' },
    { prop: 'restDays', label: '休息日', width: 80, align: 'center' },
    {
      prop: 'status',
      label: $t('page.manage.user.userStatus'),
      align: 'center',
      width: 100,
      formatter: row => {
        const tagMap: Record<number, UI.ThemeColor> = {
          1: 'success',
          2: 'danger'
        };
        const label = row.status === 1 ? '启用' : '禁用';
        return <ElTag type={tagMap[row.status] || 'info'}>{label}</ElTag>;
      }
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 260,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => viewDetail(row)}>
            详情
          </ElButton>
          <ElButton type="success" plain size="small" onClick={() => openMappingConfig(row)}>
            映射配置
          </ElButton>
          <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row.id)}>
            {{
              reference: () => (
                <ElButton type="danger" plain size="small">
                  {$t('common.delete')}
                </ElButton>
              )
            }}
          </ElPopconfirm>
        </div>
      )
    }
  ]
});

const { checkedRowKeys, onDeleted } = useTableOperate(data, 'id', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteFactoryCalendar(id);
  if (!error) {
    onDeleted();
  }
}

async function handleBatchDelete() {
  const ids = checkedRowKeys.value.map(key => Number(key));
  if (ids.length === 0) return;

  const { error } = await fetchBatchDeleteFactoryCalendars(ids);
  if (!error) {
    onDeleted();
  }
}

async function viewDetail(row: Api.Scheduling.FactoryCalendar) {
  if (!row.year || !row.month) {
    ElMessage.warning('日历年份或月份信息不完整');
    return;
  }
  const { data: viewData } = await fetchGetFactoryCalendarView({ year: row.year, month: row.month });
  if (viewData) {
    currentCalendar.value = viewData;
    showDetailDialog.value = true;
  }
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

function openGenerateDialog() {
  showGenerateDialog.value = true;
  const now = dayjs();
  const nextMonth = now.add(1, 'month');
  // 默认从下月25日开始
  const startDate = nextMonth.date(25);
  const endDate = startDate.add(30, 'day');
  generateForm.value = {
    year: nextMonth.year(),
    month: nextMonth.month() + 1,
    calendarCode: `FC-${nextMonth.format('YYYYMM')}`,
    calendarName: `${nextMonth.year()}年${nextMonth.month() + 1}月工厂日历`,
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
    weekendDays: [0, 6],
    holidays: []
  };
}

function addHoliday() {
  generateForm.value.holidays.push({
    date: '',
    holidayName: '',
    isWorkDay: false
  });
}

function removeHoliday(index: number) {
  generateForm.value.holidays.splice(index, 1);
}

async function handleGenerate() {
  if (!generateForm.value.calendarCode || !generateForm.value.calendarName) {
    ElMessage.warning('请填写完整的日历信息');
    return;
  }

  if (!generateForm.value.startDate || !generateForm.value.endDate) {
    ElMessage.warning('请选择日期范围');
    return;
  }

  if (dayjs(generateForm.value.endDate).isBefore(dayjs(generateForm.value.startDate))) {
    ElMessage.warning('结束日期不能早于开始日期');
    return;
  }

  const params: Api.Scheduling.GenerateFactoryCalendarParams = {
    year: generateForm.value.year,
    month: generateForm.value.month,
    calendarCode: generateForm.value.calendarCode,
    calendarName: generateForm.value.calendarName,
    startDate: generateForm.value.startDate,
    endDate: generateForm.value.endDate,
    weekendDays: generateForm.value.weekendDays,
    holidays: generateForm.value.holidays
  };

  const { error } = await fetchGenerateFactoryCalendar(params);
  if (!error) {
    ElMessage.success('工厂日历生成成功');
    showGenerateDialog.value = false;
    getDataByPage();
  }
}

function getDayTypeClass(day: Api.Scheduling.FactoryCalendarDayView) {
  if (day.isHoliday) return 'bg-red-100 text-red-600';
  if (!day.isWorkDay) return 'bg-gray-100 text-gray-500';
  return 'bg-green-50 text-green-600';
}

// 打开日历映射配置
function openMappingConfig(row: Api.Scheduling.FactoryCalendar) {
  editingCalendarId.value = row.id;
  editingMappingConfig.value = {
    naturalMonthStart: row.startDate ? Number.parseInt(dayjs(row.startDate).format('D'), 10) : 25
  };
  mappingDrawerVisible.value = true;
}

// 保存映射配置
async function handleSaveMappingConfig(config: {
  mappingRuleId: number;
  mappingConfig: string;
  naturalMonthStart: number;
}) {
  const { error } = await fetchUpdateMappingConfig({
    calendarId: editingCalendarId.value,
    mappingRuleId: config.mappingRuleId,
    mappingConfig: config.mappingConfig
  });

  if (!error) {
    ElMessage.success('映射配置保存成功');
    mappingDrawerVisible.value = false;
    getData();
  } else {
    ElMessage.error('保存失败');
  }
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <FactoryCalendarSearch
      v-model:model="searchParams"
      @reset="resetSearchParams"
      @search="getDataByPage"
      @generate="openGenerateDialog"
    />

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>工厂日历管理</p>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @add="openGenerateDialog"
            @delete="handleBatchDelete"
            @refresh="getData"
          />
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
          @selection-change="(rows: any[]) => (checkedRowKeys = rows.map(r => r.id))"
        >
          <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
        </ElTable>
      </div>
      <div class="mt-20px flex justify-end">
        <ElPagination
          v-if="mobilePagination.total"
          layout="total,prev,pager,next,sizes"
          v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']"
          @size-change="mobilePagination['size-change']"
        />
      </div>
    </ElCard>

    <!-- 详情对话框 -->
    <ElDialog v-model="showDetailDialog" title="工厂日历详情" width="900px">
      <div v-if="currentCalendar" class="space-y-4">
        <ElDescriptions :column="3" border>
          <ElDescriptionsItem label="日历名称">{{ currentCalendar.calendarName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="日历编码">{{ currentCalendar.calendarCode }}</ElDescriptionsItem>
          <ElDescriptionsItem label="工厂月">{{ currentCalendar.factoryMonth }}</ElDescriptionsItem>
          <ElDescriptionsItem label="开始日期">
            {{ currentCalendar.startDate ? dayjs(currentCalendar.startDate).format('YYYY-MM-DD') : '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="结束日期">
            {{ currentCalendar.endDate ? dayjs(currentCalendar.endDate).format('YYYY-MM-DD') : '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="工作日/休息日">
            {{ currentCalendar.workDays }} / {{ currentCalendar.restDays }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <!-- 日历视图 -->
        <div v-if="currentCalendar.days" class="mt-4">
          <div class="grid grid-cols-7 mb-1 gap-1">
            <div v-for="day in weekDays" :key="day" class="bg-gray-100 py-2 text-center font-medium">
              {{ day }}
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="(day, index) in currentCalendar.days"
              :key="index"
              class="h-16 flex flex-col items-center justify-center border p-1"
              :class="getDayTypeClass(day)"
            >
              <span class="text-lg font-medium">{{ day.dayOfMonth }}</span>
              <span v-if="day.isHoliday" class="text-xs">{{ day.holidayName || '休' }}</span>
              <span v-else-if="!day.isWorkDay" class="text-xs">休</span>
              <span v-else class="text-xs">班</span>
            </div>
          </div>
        </div>
      </div>
    </ElDialog>

    <!-- 生成工厂月对话框 -->
    <ElDialog v-model="showGenerateDialog" title="生成工厂月" width="700px">
      <ElForm label-position="right" :label-width="100">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="年份" required>
              <ElSelect v-model="generateForm.year" style="width: 100%">
                <ElOption
                  v-for="year in Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i)"
                  :key="year"
                  :label="year + '年'"
                  :value="year"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="月份" required>
              <ElSelect v-model="generateForm.month" style="width: 100%">
                <ElOption v-for="m in 12" :key="m" :label="m + '月'" :value="m" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="日历编码" required>
              <ElInput v-model="generateForm.calendarCode" placeholder="如：FC-202401" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="日历名称" required>
              <ElInput v-model="generateForm.calendarName" placeholder="如：2024年1月工厂日历" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="开始日期" required>
              <ElDatePicker
                v-model="generateForm.startDate"
                type="date"
                placeholder="选择开始日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="结束日期" required>
              <ElDatePicker
                v-model="generateForm.endDate"
                type="date"
                placeholder="选择结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem label="休息日设置">
          <ElCheckboxGroup v-model="generateForm.weekendDays">
            <ElCheckbox v-for="(day, index) in weekDays" :key="index" :label="index">
              {{ day }}
            </ElCheckbox>
          </ElCheckboxGroup>
        </ElFormItem>

        <ElDivider content-position="left">节假日设置</ElDivider>

        <div v-for="(holiday, index) in generateForm.holidays" :key="index" class="mb-4">
          <ElRow :gutter="8">
            <ElCol :span="8">
              <ElDatePicker
                v-model="holiday.date"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </ElCol>
            <ElCol :span="8">
              <ElInput v-model="holiday.holidayName" placeholder="节假日名称" />
            </ElCol>
            <ElCol :span="6">
              <ElCheckbox v-model="holiday.isWorkDay">调休上班</ElCheckbox>
            </ElCol>
            <ElCol :span="2">
              <ElButton type="danger" circle @click="removeHoliday(index)">
                <icon-ic-round-delete />
              </ElButton>
            </ElCol>
          </ElRow>
        </div>

        <ElButton type="primary" plain @click="addHoliday">
          <icon-ic-round-add />
          添加节假日
        </ElButton>
      </ElForm>

      <template #footer>
        <ElSpace>
          <ElButton @click="showGenerateDialog = false">{{ $t('common.cancel') }}</ElButton>
          <ElButton type="primary" @click="handleGenerate">{{ $t('common.confirm') }}</ElButton>
        </ElSpace>
      </template>
    </ElDialog>

    <!-- 日历映射配置抽屉 -->
    <CalendarMappingConfigDrawer
      v-model:visible="mappingDrawerVisible"
      :calendar-id="editingCalendarId"
      :initial-config="editingMappingConfig"
      @save="handleSaveMappingConfig"
    />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>
