<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { ElButton, ElForm, ElFormItem, ElInput, ElMessage, ElOption, ElSelect, ElSwitch } from 'element-plus';
import { fetchCreateRuleConfig, fetchUpdateRuleConfig } from '@/service/api/scheduling/rule-engine';

interface Props {
  visible: boolean;
  config: Api.Scheduling.RuleConfig | null;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isEdit = computed(() => Boolean(props.config?.id));
const title = computed(() => (isEdit.value ? '编辑规则配置' : '新增规则配置'));

const formRef = ref();
const loading = ref(false);

const formData = reactive({
  id: undefined as number | undefined,
  ruleCode: '',
  ruleName: '',
  ruleType: 1,
  category: '',
  configSchema: '{"type":"object","properties":{}}',
  defaultConfig: '{}',
  description: '',
  validatorExpr: '',
  status: 1
});

const rules = {
  ruleCode: [{ required: true, message: '请输入规则编码', trigger: 'blur' }],
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  configSchema: [{ required: true, message: '请输入配置Schema', trigger: 'blur' }],
  defaultConfig: [{ required: true, message: '请输入默认配置', trigger: 'blur' }]
};

const ruleTypeOptions = [
  { label: '排班模式', value: 1 },
  { label: '日历映射', value: 2 },
  { label: '轮班算法', value: 3 }
];

// 预设模板
const presetTemplates: Record<number, { schema: string; config: string }> = {
  1: {
    schema: JSON.stringify({
      type: 'object',
      properties: {
        patternType: {
          type: 'integer',
          title: '模式类型',
          enum: [1, 2, 3, 4, 5, 6]
        },
        cycleDays: { type: 'integer', title: '周期天数', minimum: 1 },
        workDaysPerCycle: { type: 'integer', title: '每周期工作天数' },
        restDaysPerCycle: { type: 'integer', title: '每周期休息天数' },
        teamsCount: { type: 'integer', title: '参与班组数' }
      }
    }),
    config: JSON.stringify({
      patternType: 1,
      cycleDays: 8,
      workDaysPerCycle: 6,
      restDaysPerCycle: 2,
      teamsCount: 5
    })
  },
  2: {
    schema: JSON.stringify({
      type: 'object',
      properties: {
        startDay: { type: 'integer', title: '起始日', minimum: 1, maximum: 31 },
        totalDays: { type: 'integer', title: '总天数' },
        boundaryMode: {
          type: 'string',
          title: '边界模式',
          enum: ['same_year', 'cross_year']
        }
      }
    }),
    config: JSON.stringify({
      startDay: 25,
      totalDays: 31,
      boundaryMode: 'same_year'
    })
  },
  3: {
    schema: JSON.stringify({
      type: 'object',
      properties: {
        algorithmType: {
          type: 'string',
          title: '算法类型',
          enum: ['sequence', 'fixed', 'rotating']
        },
        rotationInterval: {
          type: 'integer',
          title: '轮换间隔(天)',
          minimum: 1
        }
      }
    }),
    config: JSON.stringify({
      algorithmType: 'rotating',
      rotationInterval: 1
    })
  }
};

function handleRuleTypeChange(type: number) {
  const preset = presetTemplates[type];
  if (preset && !isEdit.value) {
    formData.configSchema = preset.schema;
    formData.defaultConfig = preset.config;
  }
}

watch(
  () => props.visible,
  visible => {
    if (visible && props.config) {
      Object.assign(formData, {
        id: props.config.id,
        ruleCode: props.config.ruleCode,
        ruleName: props.config.ruleName,
        ruleType: props.config.ruleType,
        category: props.config.category || '',
        configSchema: props.config.configSchema,
        defaultConfig: props.config.defaultConfig,
        description: props.config.description || '',
        validatorExpr: props.config.validatorExpr || '',
        status: props.config.status
      });
    } else if (visible) {
      resetForm();
    }
  }
);

function resetForm() {
  Object.assign(formData, {
    id: undefined,
    ruleCode: '',
    ruleName: '',
    ruleType: 1,
    category: '',
    configSchema: '{"type":"object","properties":{}}',
    defaultConfig: '{}',
    description: '',
    validatorExpr: '',
    status: 1
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
    const data = { ...formData };
    let error;

    if (isEdit.value) {
      error = (await fetchUpdateRuleConfig(data as any)).error;
    } else {
      error = (await fetchCreateRuleConfig(data as any)).error;
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
    <ElForm ref="formRef" :model="formData" :rules="rules" label-position="right" label-width="100px">
      <ElFormItem label="规则编码" prop="ruleCode">
        <ElInput v-model="formData.ruleCode" placeholder="请输入规则编码，如 PATTERN_5T4R" />
      </ElFormItem>

      <ElFormItem label="规则名称" prop="ruleName">
        <ElInput v-model="formData.ruleName" placeholder="请输入规则名称" />
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

      <ElFormItem label="分类" prop="category">
        <ElInput v-model="formData.category" placeholder="请输入分类，如：轮班规则、日历规则" />
      </ElFormItem>

      <ElFormItem label="配置Schema" prop="configSchema">
        <ElInput
          v-model="formData.configSchema"
          type="textarea"
          :rows="6"
          placeholder="请输入JSON Schema格式的配置定义"
          class="font-mono"
        />
      </ElFormItem>

      <ElFormItem label="默认配置" prop="defaultConfig">
        <ElInput
          v-model="formData.defaultConfig"
          type="textarea"
          :rows="6"
          placeholder="请输入JSON格式的默认配置值"
          class="font-mono"
        />
      </ElFormItem>

      <ElFormItem label="描述" prop="description">
        <ElInput v-model="formData.description" type="textarea" :rows="3" placeholder="请输入规则描述" />
      </ElFormItem>

      <ElFormItem label="验证表达式" prop="validatorExpr">
        <ElInput v-model="formData.validatorExpr" placeholder="可选，自定义验证表达式" />
      </ElFormItem>

      <ElFormItem label="状态" prop="status">
        <ElSwitch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="2"
          active-text="启用"
          inactive-text="禁用"
        />
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
