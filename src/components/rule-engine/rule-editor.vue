<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  ElAlert,
  ElButton,
  ElCollapse,
  ElCollapseItem,
  ElDivider,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
  ElSwitch
} from 'element-plus';

/**
 * 可视化规则编辑器组件
 * 基于 JSON Schema 动态生成表单化配置界面
 */

interface Props {
  schema: string;
  modelValue: string;
  ruleType: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'validate', valid: boolean, errors: string[]): void;
}>();

// 解析后的 schema 对象
const schemaObj = computed(() => {
  try {
    return JSON.parse(props.schema);
  } catch {
    return { type: 'object', properties: {} };
  }
});

// 当前配置对象
const configObj = computed({
  get: () => {
    try {
      return JSON.parse(props.modelValue);
    } catch {
      return {};
    }
  },
  set: val => {
    emit('update:modelValue', JSON.stringify(val, null, 2));
  }
});

// 活动的折叠面板
const activeCollapse = ref(['basic', 'advanced']);

// 验证错误
const validationErrors = ref<string[]>([]);

// 字段渲染器
function renderField(key: string, property: Record<string, any>, value: any) {
  const fieldProps = {
    label: property.title || key,
    disabled: props.disabled
  };

  const commonProps = {
    modelValue: value,
    'onUpdate:modelValue': (val: any) => {
      configObj.value = { ...configObj.value, [key]: val };
    },
    disabled: props.disabled,
    placeholder: property.description || `请输入${property.title || key}`
  };

  // 根据类型渲染不同的输入组件
  if (property.enum) {
    return (
      <ElFormItem {...fieldProps} key={key}>
        <ElSelect {...commonProps} class="w-full">
          {property.enum.map((opt: any) => (
            <ElOption key={opt} label={opt} value={opt} />
          ))}
        </ElSelect>
      </ElFormItem>
    );
  }

  switch (property.type) {
    case 'integer':
    case 'number':
      return (
        <ElFormItem {...fieldProps} key={key}>
          <ElInputNumber
            {...commonProps}
            min={property.minimum}
            max={property.maximum}
            step={property.type === 'number' ? 0.1 : 1}
            class="w-full"
          />
        </ElFormItem>
      );

    case 'boolean':
      return (
        <ElFormItem {...fieldProps} key={key}>
          <ElSwitch
            modelValue={value}
            onUpdate:modelValue={(val: boolean) => {
              configObj.value = { ...configObj.value, [key]: val };
            }}
            disabled={props.disabled}
          />
        </ElFormItem>
      );

    case 'string':
    default:
      if (property.maxLength && property.maxLength > 100) {
        return (
          <ElFormItem {...fieldProps} key={key}>
            <ElInput {...commonProps} type="textarea" rows={3} />
          </ElFormItem>
        );
      }
      return (
        <ElFormItem {...fieldProps} key={key}>
          <ElInput {...commonProps} />
        </ElFormItem>
      );
  }
}

// 验证配置
function validateConfig() {
  const errors: string[] = [];
  const required = schemaObj.value.required || [];

  for (const key of required) {
    if (configObj.value[key] === undefined || configObj.value[key] === '') {
      errors.push(`${schemaObj.value.properties?.[key]?.title || key} 为必填项`);
    }
  }

  // 类型验证
  for (const [key, value] of Object.entries(configObj.value)) {
    const prop = schemaObj.value.properties?.[key];
    if (prop) {
      if (prop.type === 'integer' && !Number.isInteger(value)) {
        errors.push(`${prop.title || key} 必须为整数`);
      }
      if (prop.minimum !== undefined && value < prop.minimum) {
        errors.push(`${prop.title || key} 不能小于 ${prop.minimum}`);
      }
      if (prop.maximum !== undefined && value > prop.maximum) {
        errors.push(`${prop.title || key} 不能大于 ${prop.maximum}`);
      }
    }
  }

  validationErrors.value = errors;
  emit('validate', errors.length === 0, errors);
  return errors.length === 0;
}

// 重置为默认值
function resetToDefault() {
  const defaults: Record<string, any> = {};
  for (const [key, prop] of Object.entries(schemaObj.value.properties || {})) {
    if ((prop as any).default !== undefined) {
      defaults[key] = (prop as any).default;
    }
  }
  configObj.value = defaults;
}

// 监听 schema 变化自动验证
watch(
  () => props.modelValue,
  () => {
    validateConfig();
  },
  { immediate: true }
);

// 暴露验证方法
defineExpose({ validateConfig, resetToDefault });
</script>

<template>
  <div class="rule-editor">
    <!-- 验证错误提示 -->
    <ElAlert v-if="validationErrors.length > 0" type="error" :closable="false" class="mb-4">
      <template #title>
        <ul class="m-0 list-disc pl-4">
          <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
        </ul>
      </template>
    </ElAlert>

    <!-- 规则类型提示 -->
    <ElAlert
      v-if="ruleType"
      :type="ruleType === 1 ? 'info' : ruleType === 2 ? 'success' : 'warning'"
      :closable="false"
      class="mb-4"
    >
      <template #title>
        <span class="font-medium">
          {{ ruleType === 1 ? '排班模式规则' : ruleType === 2 ? '日历映射规则' : '轮班算法规则' }}
        </span>
      </template>
    </ElAlert>

    <!-- 表单区域 -->
    <ElCollapse v-model="activeCollapse">
      <ElCollapseItem title="基本配置" name="basic">
        <ElForm label-position="top" class="rule-form">
          <template v-for="(prop, key) in schemaObj.properties" :key="key">
            <component :is="renderField(String(key), prop, configObj[key])" v-if="!prop['x-advanced']" />
          </template>
        </ElForm>
      </ElCollapseItem>

      <ElCollapseItem
        v-if="Object.values(schemaObj.properties || {}).some((p: any) => p['x-advanced'])"
        title="高级配置"
        name="advanced"
      >
        <ElForm label-position="top" class="rule-form">
          <template v-for="(prop, key) in schemaObj.properties" :key="key">
            <component :is="renderField(String(key), prop, configObj[key])" v-if="prop['x-advanced']" />
          </template>
        </ElForm>
      </ElCollapseItem>
    </ElCollapse>

    <!-- 操作按钮 -->
    <ElDivider />
    <div class="flex justify-end gap-2">
      <ElButton :disabled="disabled" @click="resetToDefault">重置为默认</ElButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rule-editor {
  .rule-form {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }
}
</style>
