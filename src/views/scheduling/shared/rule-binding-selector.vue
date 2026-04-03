<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  ElButton,
  ElCard,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag
} from 'element-plus';
import {
  fetchCreateBinding,
  fetchDeleteBinding,
  fetchGetBindingsByFactory,
  fetchGetRuleList
} from '@/service/api/scheduling/rule-engine';

interface Props {
  factoryId: number;
  factoryName?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'bound', binding: Api.Scheduling.RuleBinding): void;
  (e: 'unbound', bindingId: number): void;
}>();

const loading = ref(false);
const bindings = ref<Api.Scheduling.RuleBinding[]>([]);
const availableRules = ref<Api.Scheduling.RuleConfig[]>([]);
const dialogVisible = ref(false);

const formData = ref({
  ruleId: undefined as number | undefined,
  bindingScope: 'factory',
  description: ''
});

async function loadBindings() {
  if (!props.factoryId) return;

  loading.value = true;
  try {
    const { data } = await fetchGetBindingsByFactory(props.factoryId);
    bindings.value = data || [];
  } finally {
    loading.value = false;
  }
}

async function loadAvailableRules() {
  const { data } = await fetchGetRuleList({ page: 1, pageSize: 100, isActive: true });
  availableRules.value = data?.list || [];
}

watch(
  () => props.factoryId,
  () => loadBindings(),
  { immediate: true }
);

function openBindDialog() {
  loadAvailableRules();
  dialogVisible.value = true;
}

async function handleBind() {
  if (!formData.value.ruleId) {
    ElMessage.warning('请选择要绑定的规则');
    return;
  }

  loading.value = true;
  try {
    const { data, error } = await fetchCreateBinding({
      ruleId: formData.value.ruleId,
      factoryId: props.factoryId,
      bindingScope: formData.value.bindingScope,
      description: formData.value.description
    });

    if (!error && data) {
      ElMessage.success('绑定成功');
      emit('bound', data);
      dialogVisible.value = false;
      loadBindings();
    } else {
      ElMessage.error(error?.message || '绑定失败');
    }
  } finally {
    loading.value = false;
  }
}

async function handleUnbind(bindingId: number) {
  const { error } = await fetchDeleteBinding(bindingId);
  if (!error) {
    ElMessage.success('解绑成功');
    emit('unbound', bindingId);
    loadBindings();
  } else {
    ElMessage.error(error.message || '解绑失败');
  }
}

function getRuleTypeName(ruleType: number) {
  const names: Record<number, string> = { 1: '排班模式', 2: '日历映射', 3: '轮班算法' };
  return names[ruleType] || '未知';
}
</script>

<template>
  <ElCard class="rule-binding-selector">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="font-bold">规则绑定</span>
        <ElButton type="primary" size="small" @click="openBindDialog">绑定规则</ElButton>
      </div>
    </template>

    <div v-if="bindings.length === 0" class="py-4 text-center text-gray-400">当前工厂未绑定排班规则</div>

    <ElTable v-else :data="bindings" stripe size="small">
      <ElTableColumn prop="ruleName" label="规则名称" min-width="150" />
      <ElTableColumn prop="ruleType" label="规则类型" width="100">
        <template #default="{ row }">
          <ElTag type="primary" size="small">{{ getRuleTypeName(row.ruleType) }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="bindingScope" label="绑定范围" width="100" />
      <ElTableColumn prop="isActive" label="状态" width="80">
        <template #default="{ row }">
          <ElTag :type="row.isActive ? 'success' : 'info'" size="small">
            {{ row.isActive ? '激活' : '禁用' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="100" align="center">
        <template #default="{ row }">
          <ElButton type="danger" text size="small" @click="handleUnbind(row.id)">解绑</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 绑定对话框 -->
    <ElDialog v-model="dialogVisible" title="绑定排班规则" width="500px">
      <ElForm :model="formData" label-position="top">
        <ElFormItem label="选择规则" required>
          <ElSelect v-model="formData.ruleId" placeholder="请选择规则" class="w-full">
            <ElOption
              v-for="rule in availableRules"
              :key="rule.id"
              :label="`${rule.ruleName} (${getRuleTypeName(rule.ruleType)})`"
              :value="rule.id"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="绑定范围">
          <ElSelect v-model="formData.bindingScope" class="w-full">
            <ElOption label="工厂级" value="factory" />
            <ElOption label="车间级" value="workshop" />
            <ElOption label="班组级" value="team" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="描述">
          <ElInput v-model="formData.description" type="textarea" :rows="3" placeholder="绑定说明（可选）" />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleBind">确定绑定</ElButton>
      </template>
    </ElDialog>
  </ElCard>
</template>

<style scoped>
.rule-binding-selector {
  margin-top: 16px;
}
</style>
