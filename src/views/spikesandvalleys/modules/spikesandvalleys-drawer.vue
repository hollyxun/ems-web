<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type { SpikesAndValleys } from '@/service/api/spikesandvalleys';
import {
  fetchCreateSpikesAndValleys,
  fetchSpikesAndValleysById,
  fetchUpdateSpikesAndValleys,
  schemeTypeOptions,
  timeTypeOptions
} from '@/service/api/spikesandvalleys';

defineOptions({ name: 'SpikesAndValleysDrawer' });

interface Props {
  visible: boolean;
  operateType: 'add' | 'edit';
  rowData?: { id: number } | null;
}
interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'submitted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = computed({
  get() {
    return props.visible;
  },
  set(v) {
    emit('update:visible', v);
  }
});
const title = computed(() => (props.operateType === 'add' ? '新增方案' : '编辑方案'));

const formRef = ref<FormInstance>();
const loading = ref(false);

// 默认时段明细项
const defaultItem = (): SpikesAndValleys.ItemCreate => ({
  time: '1',
  electrovalency: 0,
  startTime: '',
  endTime: ''
});

const formData = ref<SpikesAndValleys.CreateParams>({
  schemeName: '',
  executeTime: '',
  type: '1',
  remark: '',
  itemList: [defaultItem()]
});

const rules: FormRules = {
  schemeName: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
  executeTime: [{ required: true, message: '请选择执行时间', trigger: 'change' }]
};

watch(
  () => props.visible,
  async visible => {
    if (visible && props.operateType === 'edit' && props.rowData?.id) {
      const { data, error } = await fetchSpikesAndValleysById(props.rowData.id);
      if (!error && data) {
        formData.value = {
          schemeName: data.schemeName,
          executeTime: data.executeTime,
          type: data.type,
          remark: data.remark || '',
          itemList: data.itemList?.length
            ? data.itemList.map(item => ({
                time: item.time,
                electrovalency: item.electrovalency,
                startTime: item.startTime,
                endTime: item.endTime
              }))
            : [defaultItem()]
        };
      }
    } else if (visible && props.operateType === 'add') {
      formData.value = {
        schemeName: '',
        executeTime: '',
        type: '1',
        remark: '',
        itemList: [defaultItem()]
      };
      formRef.value?.clearValidate();
    }
  }
);

function addItem() {
  formData.value.itemList.push(defaultItem());
}

function removeItem(index: number) {
  if (formData.value.itemList.length > 1) {
    formData.value.itemList.splice(index, 1);
  }
}

function getTimeLabel(time: string) {
  const item = timeTypeOptions.find(t => t.value === time);
  return item ? item.label : time;
}

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    if (props.operateType === 'edit' && props.rowData?.id) {
      const { error } = await fetchUpdateSpikesAndValleys({
        id: props.rowData.id,
        ...formData.value
      });
      if (!error) {
        ElMessage.success('更新成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    } else {
      const { error } = await fetchCreateSpikesAndValleys(formData.value);
      if (!error) {
        ElMessage.success('创建成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="title" size="600px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="方案名称" prop="schemeName">
        <ElInput v-model="formData.schemeName" placeholder="请输入方案名称" />
      </ElFormItem>
      <ElFormItem label="执行时间" prop="executeTime">
        <ElDatePicker
          v-model="formData.executeTime"
          type="date"
          placeholder="请选择执行时间"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </ElFormItem>
      <ElFormItem label="方案类型" prop="type">
        <ElSelect v-model="formData.type" placeholder="请选择方案类型" class="w-full">
          <ElOption v-for="t in schemeTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" type="textarea" placeholder="请输入备注" :rows="2" />
      </ElFormItem>

      <!-- 时段明细 -->
      <ElFormItem label="时段明细">
        <div class="w-full">
          <div
            v-for="(item, index) in formData.itemList"
            :key="index"
            class="mb-16px rd-8px bg-gray-50 p-16px dark:bg-dark-100"
          >
            <div class="mb-12px flex items-center gap-8px">
              <ElTag :type="item.time === '1' ? 'danger' : item.time === '2' ? 'warning' : 'info'">
                {{ getTimeLabel(item.time) }}
              </ElTag>
              <ElButton
                v-if="formData.itemList.length > 1"
                type="danger"
                size="small"
                circle
                icon="Delete"
                @click="removeItem(index)"
              />
            </div>
            <div class="grid grid-cols-2 gap-12px">
              <ElFormItem label="时段" :show-message="false" class="mb-0">
                <ElSelect v-model="item.time" placeholder="选择时段" size="small">
                  <ElOption v-for="t in timeTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="电费" :show-message="false" class="mb-0">
                <ElInputNumber
                  v-model="item.electrovalency"
                  :min="0"
                  :precision="4"
                  placeholder="电费单价"
                  size="small"
                  class="w-full"
                />
              </ElFormItem>
              <ElFormItem label="开始时间" :show-message="false" class="mb-0">
                <ElTimePicker
                  v-model="item.startTime"
                  placeholder="开始时间"
                  value-format="HH:mm"
                  size="small"
                  class="w-full"
                />
              </ElFormItem>
              <ElFormItem label="结束时间" :show-message="false" class="mb-0">
                <ElTimePicker
                  v-model="item.endTime"
                  placeholder="结束时间"
                  value-format="HH:mm"
                  size="small"
                  class="w-full"
                />
              </ElFormItem>
            </div>
          </div>
          <ElButton type="primary" plain size="small" icon="Plus" @click="addItem">添加时段</ElButton>
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>
