<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect
} from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import dayjs from 'dayjs';
import { useShiftScheduleStore } from '@/store/modules/shift-schedule';

defineOptions({ name: 'ScheduleForm' });

const props = defineProps<{
  visible: boolean;
  schedule?: Api.Shift.ShiftSchedule | null;
  date?: string;
  teamId?: number;
}>();

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  success: [];
}>();

const store = useShiftScheduleStore();

const formRef = ref<FormInstance>();
const loading = ref(false);

const isEdit = computed(() => Boolean(props.schedule));

const formData = ref({
  teamId: props.teamId || (undefined as number | undefined),
  shiftTypeId: undefined as number | undefined,
  scheduleDate: props.date || '',
  status: 1,
  remark: ''
});

const rules: FormRules = {
  teamId: [{ required: true, message: '请选择班组', trigger: 'change' }],
  shiftTypeId: [{ required: true, message: '请选择班次类型', trigger: 'change' }],
  scheduleDate: [{ required: true, message: '请选择日期', trigger: 'change' }]
};

const dialogTitle = computed(() => (isEdit.value ? '编辑排班' : '添加排班'));

watch(
  () => props.visible,
  val => {
    if (val) {
      resetForm();
      if (props.schedule) {
        formData.value = {
          teamId: props.schedule.teamId,
          shiftTypeId: props.schedule.shiftTypeId,
          scheduleDate: props.schedule.scheduleDate.split('T')[0],
          status: props.schedule.status,
          remark: props.schedule.remark
        };
      } else if (props.date) {
        formData.value.scheduleDate = props.date;
      }
      if (props.teamId) {
        formData.value.teamId = props.teamId;
      }
    }
  }
);

function resetForm() {
  formData.value = {
    teamId: props.teamId || undefined,
    shiftTypeId: undefined,
    scheduleDate: props.date || '',
    status: 1,
    remark: ''
  };
  formRef.value?.resetFields();
}

async function handleSubmit() {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  loading.value = true;
  try {
    if (isEdit.value && props.schedule) {
      await store.updateSchedule({
        id: props.schedule.id,
        shiftTypeId: formData.value.shiftTypeId,
        status: formData.value.status,
        remark: formData.value.remark
      });
      ElMessage.success('更新成功');
    } else {
      await store.createSchedule({
        teamId: formData.value.teamId!,
        shiftTypeId: formData.value.shiftTypeId!,
        scheduleDate: formData.value.scheduleDate,
        status: formData.value.status,
        remark: formData.value.remark
      });
      ElMessage.success('创建成功');
    }
    emit('success');
    handleClose();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  emit('update:visible', false);
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    :title="dialogTitle"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="班组" prop="teamId">
        <ElSelect v-model="formData.teamId" placeholder="请选择班组" :disabled="isEdit" style="width: 100%">
          <!-- TODO: Load teams from organization API -->
          <ElOption :value="1" label="甲班" />
          <ElOption :value="2" label="乙班" />
          <ElOption :value="3" label="丙班" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="班次类型" prop="shiftTypeId">
        <ElSelect v-model="formData.shiftTypeId" placeholder="请选择班次类型" style="width: 100%">
          <ElOption v-for="st in store.activeShiftTypes" :key="st.id" :value="st.id" :label="st.name">
            <span>{{ st.name }}</span>
            <span style="color: var(--el-text-color-secondary); margin-left: 8px; font-size: 12px">
              {{ st.startTime }} - {{ st.endTime }}
              <span v-if="st.endNextDay">(次日)</span>
            </span>
          </ElOption>
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="日期" prop="scheduleDate">
        <ElDatePicker
          v-model="formData.scheduleDate"
          type="date"
          placeholder="请选择日期"
          value-format="YYYY-MM-DD"
          :disabled="isEdit"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="状态" prop="status">
        <ElSelect v-model="formData.status" style="width: 100%">
          <ElOption :value="1" label="正常" />
          <ElOption :value="2" label="请假" />
          <ElOption :value="3" label="调休" />
          <ElOption :value="4" label="加班" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
          maxlength="255"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '更新' : '创建' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">
// Component styles
</style>
