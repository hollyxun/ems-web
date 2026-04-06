<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCreatePowerDistribution, fetchUpdatePowerDistribution } from '@/service/api/power-distribution';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'PowerDistributionOperateDrawer' });

interface Props {
  visible: boolean;
  operateType: UI.TableOperateType;
  rowData?: Api.PowerDistribution.PowerDistribution | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit('update:visible', val);
  }
});

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<UI.TableOperateType, string> = {
    add: '新增配电室',
    edit: '编辑配电室'
  };
  return titles[props.operateType];
});

const model = ref<Partial<Api.PowerDistribution.PowerDistribution>>(createDefaultModel());

function createDefaultModel(): Partial<Api.PowerDistribution.PowerDistribution> {
  return {
    name: '',
    code: '',
    principals: '',
    principalsTel: '',
    remark: ''
  };
}

const rules: Record<string, App.Global.FormRule> = {
  name: defaultRequiredRule,
  code: defaultRequiredRule
};

function handleInitModel() {
  model.value = createDefaultModel();
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, props.rowData);
  }
}

async function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  const api = props.operateType === 'add' ? fetchCreatePowerDistribution : fetchUpdatePowerDistribution;
  const { error } = await api(model.value as Api.PowerDistribution.PowerDistribution);
  if (!error) {
    ElMessage.success($t(props.operateType === 'add' ? 'common.addSuccess' : 'common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" size="500px">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="right" :label-width="100">
      <ElFormItem label="配电室名称" prop="name">
        <ElInput v-model="model.name" placeholder="请输入配电室名称" />
      </ElFormItem>
      <ElFormItem label="配电室编码" prop="code">
        <ElInput v-model="model.code" placeholder="请输入配电室编码" :disabled="operateType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="负责人">
        <ElInput v-model="model.principals" placeholder="请输入负责人姓名" />
      </ElFormItem>
      <ElFormItem label="负责人电话">
        <ElInput v-model="model.principalsTel" placeholder="请输入负责人电话" />
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="model.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace>
        <ElButton @click="closeDrawer">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
