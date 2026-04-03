<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElAlert, ElButton, ElInput } from 'element-plus';

/**
 * 规则表达式编辑器
 * 高级模式 - 直接编辑规则表达式
 */

interface Props {
  modelValue: string;
  ruleType: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'format', success: boolean): void;
}>();

// 当前编辑内容
const localValue = ref(props.modelValue);

// 错误信息
const parseError = ref<string | null>(null);

// 格式化 JSON
function formatJson() {
  try {
    const parsed = JSON.parse(localValue.value);
    localValue.value = JSON.stringify(parsed, null, 2);
    parseError.value = null;
    emit('update:modelValue', localValue.value);
    emit('format', true);
  } catch (e: any) {
    parseError.value = `JSON 格式错误: ${e.message}`;
    emit('format', false);
  }
}

// 压缩 JSON
function compressJson() {
  try {
    const parsed = JSON.parse(localValue.value);
    localValue.value = JSON.stringify(parsed);
    parseError.value = null;
    emit('update:modelValue', localValue.value);
  } catch (e: any) {
    parseError.value = `JSON 格式错误: ${e.message}`;
  }
}

// 验证表达式
function validateExpression(): boolean {
  try {
    JSON.parse(localValue.value);
    parseError.value = null;
    return true;
  } catch (e: any) {
    parseError.value = `JSON 格式错误: ${e.message}`;
    return false;
  }
}

// 同步外部值变化
watch(
  () => props.modelValue,
  val => {
    localValue.value = val;
  }
);

// 同步内部编辑
watch(localValue, val => {
  emit('update:modelValue', val);
});

// 预设模板
const presetTemplates = computed(() => {
  switch (props.ruleType) {
    case 1: // 排班模式
      return {
        five_team_four: {
          label: '五班四运转',
          value: JSON.stringify(
            {
              patternType: 1,
              cycleDays: 8,
              workDaysPerCycle: 6,
              restDaysPerCycle: 2,
              teamsCount: 5,
              rotationInterval: 1
            },
            null,
            2
          )
        },
        six_team_five: {
          label: '六班五运转',
          value: JSON.stringify(
            {
              patternType: 2,
              cycleDays: 7,
              workDaysPerCycle: 6,
              restDaysPerCycle: 1,
              teamsCount: 6,
              rotationInterval: 1
            },
            null,
            2
          )
        }
      };
    case 2: // 日历映射
      return {
        natural_month: {
          label: '自然月映射',
          value: JSON.stringify(
            {
              startDay: 25,
              totalDays: 31,
              boundaryMode: 'same_year'
            },
            null,
            2
          )
        }
      };
    case 3: // 轮班算法
      return {
        rotating: {
          label: '轮换班次',
          value: JSON.stringify(
            {
              algorithmType: 'rotating',
              rotationInterval: 1
            },
            null,
            2
          )
        }
      };
    default:
      return {};
  }
});

// 应用预设模板
function applyPreset(key: string) {
  const template = presetTemplates.value[key];
  if (template) {
    localValue.value = template.value;
    emit('update:modelValue', template.value);
  }
}

// 暴露验证方法
defineExpose({ validateExpression });
</script>

<template>
  <div class="rule-expression-editor">
    <!-- 预设模板 -->
    <div v-if="Object.keys(presetTemplates).length > 0" class="mb-4">
      <span class="mr-2 text-sm text-gray-500">快速模板：</span>
      <ElButton v-for="(template, key) in presetTemplates" :key="key" size="small" @click="applyPreset(String(key))">
        {{ template.label }}
      </ElButton>
    </div>

    <!-- 工具栏 -->
    <div class="mb-2 flex justify-end gap-2">
      <ElButton size="small" @click="formatJson">格式化</ElButton>
      <ElButton size="small" @click="compressJson">压缩</ElButton>
    </div>

    <!-- 错误提示 -->
    <ElAlert v-if="parseError" type="error" :closable="false" class="mb-2">
      {{ parseError }}
    </ElAlert>

    <!-- 编辑器 -->
    <ElInput
      v-model="localValue"
      type="textarea"
      :rows="15"
      :disabled="disabled"
      placeholder="请输入 JSON 格式的规则配置"
      class="font-mono"
      @blur="validateExpression"
    />

    <!-- 帮助提示 -->
    <ElAlert type="info" :closable="false" class="mt-4">
      <template #title>
        <div class="text-sm">
          <p class="mb-2 font-bold">配置格式说明：</p>
          <ul class="list-disc pl-4 space-y-1">
            <li>请使用标准的 JSON 格式</li>
            <li>字段名使用双引号包裹</li>
            <li>数值不需要引号，字符串需要</li>
            <li>可使用上方"快速模板"快速填充预设配置</li>
          </ul>
        </div>
      </template>
    </ElAlert>
  </div>
</template>

<style lang="scss" scoped>
.rule-expression-editor {
  :deep(.el-textarea__inner) {
    font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.5;
  }
}
</style>
