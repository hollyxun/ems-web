<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCreateTouPeriod, fetchUpdateTouPeriod } from '@/service/api/energy-tou';

defineOptions({ name: 'TouPeriodDrawer' });

interface Props {
  operateType: UI.TableOperateType;
  rowData?: Api.Energy.TouPeriod | null;
  factoryId?: number;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const formRef = ref();

const formData = ref<Api.Energy.TouPeriod>({
  id: 0,
  name: '',
  periodType: 1,
  startTime: '08:00',
  endTime: '12:00',
  crossMidnight: false,
  factoryId: undefined,
  description: ''
});

const title = computed(() => {
  return props.operateType === 'add' ? '新增时段' : '编辑时段';
});

const periodTypeOptions = [
  { label: '峰时', value: 1 },
  { label: '平时', value: 2 },
  { label: '谷时', value: 3 }
];

const rules = {
  name: [{ required: true, message: '请输入时段名称', trigger: 'blur' }],
  periodType: [{ required: true, message: '请选择时段类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
};

const periodTypeColors: Record<number, string> = {
  1: '#f56c6c', // peak - red
  2: '#e6a23c', // flat - orange
  3: '#409eff' // valley - blue
};

function resetForm() {
  formData.value = {
    id: 0,
    name: '',
    periodType: 1,
    startTime: '08:00',
    endTime: '12:00',
    crossMidnight: false,
    factoryId: props.factoryId,
    description: ''
  };
}

async function handleSubmit() {
  await formRef.value?.validate();

  // Check cross-midnight
  const startMinutes = timeToMinutes(formData.value.startTime);
  const endMinutes = timeToMinutes(formData.value.endTime);
  formData.value.crossMidnight = endMinutes <= startMinutes;

  const isEdit = props.operateType === 'edit';
  const submitData = { ...formData.value, factoryId: props.factoryId };
  const { error } = isEdit ? await fetchUpdateTouPeriod(submitData) : await fetchCreateTouPeriod(submitData);

  if (!error) {
    ElMessage.success(isEdit ? '编辑成功' : '新增成功');
    visible.value = false;
    emit('submitted');
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

watch(visible, val => {
  if (val) {
    if (props.operateType === 'edit' && props.rowData) {
      formData.value = { ...props.rowData };
    } else {
      resetForm();
    }
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" size="500px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="时段名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入时段名称" />
      </ElFormItem>
      <ElFormItem label="时段类型" prop="periodType">
        <ElRadioGroup v-model="formData.periodType">
          <ElRadio v-for="item in periodTypeOptions" :key="item.value" :label="item.value">
            <ElTag :color="periodTypeColors[item.value]" class="text-white">{{ item.label }}</ElTag>
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="开始时间" prop="startTime">
        <ElTimeSelect
          v-model="formData.startTime"
          placeholder="请选择开始时间"
          start="00:00"
          step="00:30"
          end="23:30"
        />
      </ElFormItem>
      <ElFormItem label="结束时间" prop="endTime">
        <ElTimeSelect
          v-model="formData.endTime"
          placeholder="请选择结束时间"
          start="00:00"
          step="00:30"
          end="24:00"
          :min-time="formData.startTime"
        />
      </ElFormItem>
      <ElFormItem label="跨午夜">
        <ElSwitch v-model="formData.crossMidnight" disabled />
        <span class="ml-2 text-sm text-gray-500">（自动判断：结束时间早于或等于开始时间）</span>
      </ElFormItem>
      <ElFormItem label="描述">
        <ElInput v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace>
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>
