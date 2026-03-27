<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchCreateOrganization, fetchOrganizationTree, fetchUpdateOrganization } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'OrganizationOperateModal' });

interface Props {
  /** the type of operation */
  operateType: UI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Organization.OrganizationItem | null;
  /** parent id for creating child organization */
  parentId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  parentId: 0,
  rowData: null
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<UI.TableOperateType, string> = {
    add: '新增组织',
    edit: '编辑组织'
  };
  return titles[props.operateType];
});

interface Model {
  id?: number;
  parentId: number;
  name: string;
  code: string;
  type: Api.Organization.OrgType;
  sort: number;
  status: number;
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    parentId: 0,
    name: '',
    code: '',
    type: 1,
    sort: 0,
    status: 1
  };
}

const rules = computed(() => ({
  name: defaultRequiredRule,
  code: defaultRequiredRule,
  type: defaultRequiredRule
}));

const loading = ref(false);

/** all organizations for parent selection */
const organizationTree = ref<Api.Organization.OrganizationItem[]>([]);

async function getOrganizationTree() {
  const { data } = await fetchOrganizationTree();
  organizationTree.value = data || [];
}

async function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const rowData = props.rowData;
    model.value = {
      id: rowData.id,
      parentId: rowData.parentId,
      name: rowData.name,
      code: rowData.code,
      type: rowData.type,
      sort: rowData.sort,
      status: rowData.status
    };
  } else if (props.operateType === 'add') {
    // Set parent id for creating child
    model.value.parentId = props.parentId || 0;
    // Auto-calculate type based on parent level
    if (props.parentId && props.parentId > 0) {
      // Find parent and set type to next level
      const findParent = (orgs: Api.Organization.OrganizationItem[]): Api.Organization.OrganizationItem | null => {
        for (const org of orgs) {
          if (org.id === props.parentId) return org;
          if (org.children) {
            const found = findParent(org.children);
            if (found) return found;
          }
        }
        return null;
      };
      const parent = findParent(organizationTree.value);
      if (parent && parent.level < 4) {
        model.value.type = (parent.level + 1) as Api.Organization.OrgType;
      }
    }
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  loading.value = true;
  try {
    if (props.operateType === 'add') {
      const { error } = await fetchCreateOrganization({
        parentId: model.value.parentId,
        name: model.value.name,
        code: model.value.code,
        type: model.value.type,
        sort: model.value.sort
      });
      if (!error) {
        window.$message?.success($t('common.addSuccess'));
        closeDrawer();
        emit('submitted');
      }
    } else {
      const { error } = await fetchUpdateOrganization({
        id: model.value.id!,
        name: model.value.name,
        sort: model.value.sort,
        status: model.value.status
      });
      if (!error) {
        window.$message?.success($t('common.updateSuccess'));
        closeDrawer();
        emit('submitted');
      }
    }
  } finally {
    loading.value = false;
  }
}

// Organization type options
const orgTypeOptions = [
  { label: '集团', value: 1 },
  { label: '工厂', value: 2 },
  { label: '车间', value: 3 },
  { label: '班组', value: 4 }
];

watch(visible, () => {
  if (visible.value) {
    getOrganizationTree();
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" :size="400">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="top">
      <ElFormItem v-if="operateType === 'add'" label="上级组织" prop="parentId">
        <ElTreeSelect
          v-model="model.parentId"
          :data="organizationTree"
          :props="{ label: 'name', value: 'id', children: 'children' } as any"
          check-strictly
          clearable
          placeholder="选择上级组织（不选则为根节点）"
          class="w-full"
        />
      </ElFormItem>
      <ElFormItem label="组织名称" prop="name">
        <ElInput v-model="model.name" placeholder="请输入组织名称" />
      </ElFormItem>
      <ElFormItem label="组织编码" prop="code">
        <ElInput v-model="model.code" placeholder="请输入组织编码（唯一标识）" :disabled="operateType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="组织类型" prop="type">
        <ElSelect v-model="model.type" placeholder="请选择组织类型" class="w-full" :disabled="operateType === 'edit'">
          <ElOption v-for="opt in orgTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="model.sort" :min="0" :max="9999" class="w-full" />
      </ElFormItem>
      <ElFormItem v-if="operateType === 'edit'" label="状态" prop="status">
        <ElRadioGroup v-model="model.status">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="2">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace :size="16">
        <ElButton @click="closeDrawer">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
