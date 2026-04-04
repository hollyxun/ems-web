<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { fetchCreateKnowledge, fetchUpdateKnowledge, fetchKnowledgeById } from '@/service/api/knowledge';
import { $t } from '@/locales';

defineOptions({ name: 'KnowledgeDrawer' });

interface Props {
  visible: boolean;
  operateType: 'add' | 'edit';
  rowData?: Api.Knowledge.Item | null;
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
  set(visible: boolean) {
    emit('update:visible', visible);
  }
});

const title = computed(() => {
  return props.operateType === 'add' ? '新增知识库' : '编辑知识库';
});

const formRef = ref<FormInstance>();
const loading = ref(false);

const formData = ref({
  title: '',
  energyType: 0,
  content: '',
  urls: [] as string[]
});

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
};

const energyTypeOptions = [
  { label: '电', value: 0 },
  { label: '水', value: 1 },
  { label: '天然气', value: 2 },
  { label: '蒸汽', value: 3 }
];

watch(
  () => props.visible,
  async visible => {
    if (visible && props.operateType === 'edit' && props.rowData?.id) {
      const { data, error } = await fetchKnowledgeById(props.rowData.id);
      if (!error && data) {
        formData.value = {
          title: data.title || '',
          energyType: data.energyType ?? 0,
          content: data.content || '',
          urls: data.files?.map((f: Api.Knowledge.File) => f.url) || []
        };
      }
    } else if (visible && props.operateType === 'add') {
      resetForm();
    }
  }
);

function resetForm() {
  formData.value = {
    title: '',
    energyType: 0,
    content: '',
    urls: []
  };
  formRef.value?.clearValidate();
}

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;

  try {
    if (props.operateType === 'add') {
      const { error } = await fetchCreateKnowledge(formData.value);
      if (!error) {
        ElMessage.success('创建成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    } else if (props.operateType === 'edit' && props.rowData?.id) {
      const { error } = await fetchUpdateKnowledge({
        id: props.rowData.id,
        ...formData.value
      });
      if (!error) {
        ElMessage.success('更新成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    }
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  drawerVisible.value = false;
}
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="title" size="700px" @close="handleClose">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="标题" prop="title">
        <ElInput v-model="formData.title" placeholder="请输入标题" />
      </ElFormItem>
      <ElFormItem label="能源类型" prop="energyType">
        <ElRadioGroup v-model="formData.energyType">
          <ElRadio v-for="item in energyTypeOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="内容" prop="content">
        <div class="w-full">
          <!-- 简化版富文本编辑器，可替换为实际组件 -->
          <ElInput
            v-model="formData.content"
            type="textarea"
            :rows="10"
            placeholder="请输入内容（支持富文本）"
          />
        </div>
      </ElFormItem>
      <ElFormItem label="附件" prop="urls">
        <div class="w-full">
          <!-- 简化版附件上传，可替换为实际组件 -->
          <ElInput
            v-model="formData.urls[0]"
            placeholder="请输入附件URL（多个用逗号分隔）"
            clearable
          />
          <div class="mt-8px text-12px text-gray-400">支持多个附件，每行一个URL</div>
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>