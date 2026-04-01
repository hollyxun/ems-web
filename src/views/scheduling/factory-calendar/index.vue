<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { ElButton, ElDialog, ElMessage, ElPopconfirm, ElTag } from 'element-plus';
import dayjs from 'dayjs';
import {
  fetchDeleteFactoryCalendar,
  fetchGenerateFactoryCalendar,
  fetchGetAllShifts,
  fetchGetFactoryCalendarList,
  fetchGetFactoryCalendarView
} from '@/service/api/scheduling';
import { defaultTransform, useTableOperate, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import FactoryCalendarSearch from './modules/factoryCalendar-search.vue';

defineOptions({ name: 'FactoryCalendarManage' });

const searchParams = ref(getInitSearchParams());
const showDetailDialog = ref(false);
const currentCalendar = ref<Api.Scheduling.FactoryCalendarView | null>(null);
const showGenerateDialog = ref(false);
const allShifts = ref<Api.Scheduling.Shift[]>([]);

const generateForm = ref({
  year: dayjs().year(),
  month: dayjs().month() + 1,
  calendarCode: '',
  calendarName: '',
  startDay: 25,
  totalDays: 31,
  workDays: 22,
  weekendDays: [0, 6] as number[],
  holidays: [] as Array<{ date: string; holidayName: string; isWorkDay: boolean }>,
  defaultShift: undefined as number | undefined
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
      width: 200,
      formatter: row => (
        <div class="flex-center">
          <ElButton type="primary" plain size="small" onClick={() => viewDetail(row)}>
            详情
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

const { drawerVisible, operateType, editingData, handleAdd, checkedRowKeys, onDeleted } = useTableOperate(data, 'id', getData);

async function loadShifts() {
  const { data } = await fetchGetAllShifts();
  if (data) {
    allShifts.value = data.filter(s => s.status === 1);
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteFactoryCalendar(id);
  if (!error) {
    onDeleted();
  }
}

async function viewDetail(row: Api.Scheduling.FactoryCalendar) {
  if (!row.year || !row.month) {
    ElMessage.warning('日历年份或月份信息不完整');
    return;
  }
  const { data } = await fetchGetFactoryCalendarView({ year: row.year, month: row.month });
  if (data) {
    currentCalendar.value = data;
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
  generateForm.value = {
    year: nextMonth.year(),
    month: nextMonth.month() + 1,
    calendarCode: `FC-${nextMonth.format('YYYYMM')}`,
    calendarName: `${nextMonth.year()}年${nextMonth.month() + 1}月工厂日历`,
    startDay: 25,
    totalDays: 31,
    workDays: 22,
    weekendDays: [0, 6],
    holidays: [],
    defaultShift: undefined
  };
  loadShifts();
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

  const params: Api.Scheduling.GenerateFactoryCalendarParams = {
    year: generateForm.value.year,
    month: generateForm.value.month,
    calendarCode: generateForm.value.calendarCode,
    calendarName: generateForm.value.calendarName,
    startDay: generateForm.value.startDay,
    totalDays: generateForm.value.totalDays,
    workDays: generateForm.value.workDays,
    weekendDays: generateForm.value.weekendDays,
    holidays: generateForm.value.holidays,
    defaultShift: generateForm.value.defaultShift
  };

  const { error } = await fetchGenerateFactoryCalendar(params);
  if (!error) {
    ElMessage.success('工厂月生成成功');
    showGenerateDialog.value = false;
    getDataByPage();
  }
}

function getDayTypeClass(day: Api.Scheduling.FactoryCalendarDayView) {
  if (day.isHoliday) return 'bg-red-100 text-red-600';
  if (!day.isWorkDay) return 'bg-gray-100 text-gray-500';
  return 'bg-green-50 text-green-600';
}

onMounted(() => {
  getData();
  loadShifts();
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
          @selection-change="checkedRowKeys = $event"
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
            <ElFormItem label="起始日期" required>
              <ElInputNumber v-model="generateForm.startDay" :min="1" :max="31" style="width: 100%">
                <template #suffix>日</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="总天数" required>
              <ElInputNumber v-model="generateForm.totalDays" :min="1" :max="31" style="width: 100%">
                <template #suffix>天</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="工作日数" required>
              <ElInputNumber v-model="generateForm.workDays" :min="1" :max="31" style="width: 100%">
                <template #suffix>天</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="默认班次">
              <ElSelect v-model="generateForm.defaultShift" clearable placeholder="请选择默认班次" style="width: 100%">
                <ElOption v-for="shift in allShifts" :key="shift.id" :label="shift.name" :value="shift.id">
                  <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded" :style="{ backgroundColor: shift.color }" />
                    <span>{{ shift.name }}</span>
                  </div>
                </ElOption>
              </ElSelect>
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
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  .ht50 {
    height: calc(100% - 50px);
  }
}
</style>
