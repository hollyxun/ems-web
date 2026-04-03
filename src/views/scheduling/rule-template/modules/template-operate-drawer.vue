<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { ElButton, ElDrawer, ElForm, ElFormItem, ElInput, ElMessage, ElOption, ElSelect, ElSwitch } from 'element-plus';
import { fetchCreateTemplate, fetchUpdateTemplate } from '@/service/api/scheduling/rule-engine';

interface Props {
  visible: boolean;
  template: Api.Scheduling.RuleTemplate | null;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isEdit = computed(() => Boolean(props.template?.id));
const title = computed(() => (isEdit.value ? '编辑模板' : '新增模板'));

const formRef = ref();
const loading = ref(false);

const formData = reactive({
  id: undefined as number | undefined,
  templateCode: '',
  templateName: '',
  ruleType: 1,
  configValue: '{}',
  applicableScope: '',
  description: '',
  isPublic: true
});

const rules = {
  templateCode: [{ required: true, message: '请输入模板编码', trigger: 'blur' }],
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }]
};

const ruleTypeOptions = [
  { label: '排班模式', value: 1 },
  { label: '日历映射', value: 2 },
  { label: '轮班算法', value: 3 }
];

// 预设模板
const presetTemplates: Record<number, string> = {
  1: JSON.stringify(
    {
      patternType: 1,
      cycleDays: 8,
      workDaysPerCycle: 6,
      restDaysPerCycle: 2,
      teamsCount: 5,
      description: '五班四运转标准模板'
    },
    null,
    2
  ),
  2: JSON.stringify(
    {
      startDay: 25,
      totalDays: 31,
      boundaryMode: 'same_year',
      description: '自然月映射标准模板'
    },
    null,
    2
  ),
  3: JSON.stringify(
    {
      algorithmType: 'rotating',
      rotationInterval: 1,
      description: '轮班算法标准模板'
    },
    null,
    2
  )
};

function handleRuleTypeChange(type: number) {
  if (!isEdit.value && presetTemplates[type]) {
    formData.configValue = presetTemplates[type];
  }
}

watch(
  () => props.visible,
  visible => {
    if (visible && props.template) {
      Object.assign(formData, {
        id: props.template.id,
        templateCode: props.template.templateCode,
        templateName: props.template.templateName,
        ruleType: props.template.ruleType,
        configValue: props.template.configValue,
        applicableScope: props.template.applicableScope || '',
        description: props.template.description || '',
        isPublic: props.template.isPublic
      });
    } else if (visible) {
      resetForm();
    }
  }
);

function resetForm() {
  Object.assign(formData, {
    id: undefined,
    templateCode: '',
    templateName: '',
    ruleType: 1,
    configValue: '{}',
    applicableScope: '',
    description: '',
    isPublic: true
  });
}

function handleClose() {
  emit('update:visible', false);
  formRef.value?.resetFields();
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    let error;
    if (isEdit.value) {
      error = (await fetchUpdateTemplate(formData.id!, formData)).error;
    } else {
      error = (await fetchCreateTemplate(formData)).error;
    }

    if (!error) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
      emit('success');
      handleClose();
    } else {
      ElMessage.error(error.message || '操作失败');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ElDrawer :model-value="visible" :title="title" size="600px" @close="handleClose">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-position="top">
      <ElFormItem label="模板编码" prop="templateCode">
        <ElInput v-model="formData.templateCode" placeholder="如 TEMPLATE_5T4R" />
      </ElFormItem>

      <ElFormItem label="模板名称" prop="templateName">
        <ElInput v-model="formData.templateName" placeholder="如 五班四运转标准模板" />
      </ElFormItem>

      <ElFormItem label="规则类型" prop="ruleType">
        <ElSelect
          v-model="formData.ruleType"
          placeholder="请选择规则类型"
          class="w-full"
          @change="handleRuleTypeChange"
        >
          <ElOption v-for="item in ruleTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="配置值" prop="configValue">
        <ElInput
          v-model="formData.configValue"
          type="textarea"
          :rows="12"
          placeholder="请输入JSON格式的配置值"
          class="font-mono"
        />
      </ElFormItem>

      <ElFormItem label="适用范围" prop="applicableScope">
        <ElInput v-model="formData.applicableScope" placeholder="如 化工行业、钢铁行业" />
      </ElFormItem>

      <ElFormItem label="描述" prop="description">
        <ElInput v-model="formData.description" type="textarea" :rows="3" placeholder="请输入模板描述" />
      </ElFormItem>

      <ElFormItem label="可见性" prop="isPublic">
        <ElSwitch v-model="formData.isPublic" active-text="公共模板" inactive-text="私有模板" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="flex justify-end gap-2">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>
