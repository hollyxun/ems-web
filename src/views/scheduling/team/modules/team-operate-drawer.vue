<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCreateTeam, fetchUpdateTeam } from '@/service/api/scheduling';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'TeamOperateDrawer' });

interface Props {
  visible: boolean;
  operateType: UI.TableOperateType;
  rowData?: Api.Scheduling.Team | null;
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
    add: '新增班组',
    edit: '编辑班组'
  };
  return titles[props.operateType];
});

const model = ref<Partial<Api.Scheduling.Team>>(createDefaultModel());

function createDefaultModel(): Partial<Api.Scheduling.Team> {
  return {
    name: '',
    code: '',
    leaderName: '',
    color: '#1890ff',
    sort: 0,
    status: 1,
    description: ''
  };
}

const rules: Record<string, App.Global.FormRule> = {
  name: defaultRequiredRule,
  code: defaultRequiredRule,
  status: defaultRequiredRule
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
  const api = props.operateType === 'add' ? fetchCreateTeam : fetchUpdateTeam;
  const { error } = await api(model.value as Api.Scheduling.Team);
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
      <ElFormItem label="班组名称" prop="name">
        <ElInput v-model="model.name" placeholder="请输入班组名称" />
      </ElFormItem>
      <ElFormItem label="班组编码" prop="code">
        <ElInput v-model="model.code" placeholder="请输入班组编码" :disabled="operateType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="班组长">
        <ElInput v-model="model.leaderName" placeholder="请输入班组长姓名" />
      </ElFormItem>
      <ElFormItem label="颜色标识">
        <ElColorPicker v-model="model.color" />
      </ElFormItem>
      <ElFormItem label="排序">
        <ElInputNumber v-model="model.sort" :min="0" placeholder="请输入排序" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="model.status">
          <ElRadio :label="1">启用</ElRadio>
          <ElRadio :label="2">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="描述">
        <ElInput v-model="model.description" type="textarea" :rows="3" placeholder="请输入描述" />
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
