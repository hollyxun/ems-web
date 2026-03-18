<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { fetchCreateMenu, fetchGetMenuTree, fetchUpdateMenu } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { getLocalIcons } from '@/utils/icon';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({ name: 'MenuOperateModal' });

export type OperateType = UI.TableOperateType | 'addChild';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit menu data or the parent menu data when adding a child menu */
  rowData?: Api.SystemManage.Menu | null;
}

const props = withDefaults(defineProps<Props>(), {
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
  const titles: Record<OperateType, string> = {
    add: $t('page.manage.menu.addMenu'),
    addChild: $t('page.manage.menu.addChildMenu'),
    edit: $t('page.manage.menu.editMenu')
  };
  return titles[props.operateType];
});

interface Model {
  id?: number;
  parentId: string;
  path: string;
  name: string;
  hidden: number;
  component: string;
  sort: number;
  keepAlive: number;
  title: string;
  icon: string;
  menuType: string;
  isFrame: number;
  parameters: string;
  status: number;
  singleLayout: string;
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    parentId: '0',
    path: '',
    name: '',
    hidden: 0,
    component: '',
    sort: 1,
    keepAlive: 0,
    title: '',
    icon: '',
    menuType: 'dir',
    isFrame: 0,
    parameters: '',
    status: 1,
    singleLayout: ''
  };
}

const rules = {
  title: defaultRequiredRule,
  name: defaultRequiredRule,
  path: defaultRequiredRule,
  menuType: defaultRequiredRule
};

const menuTypeOptions = [
  { label: '目录', value: 'dir' },
  { label: '菜单', value: 'menu' },
  { label: '按钮', value: 'button' }
];

const disabledMenuType = computed(() => props.operateType === 'edit');

const localIcons = getLocalIcons();
const localIconOptions = localIcons.map(item => ({
  value: item
}));

// 菜单树数据（用于选择父菜单）
const menuTreeData = ref<Api.SystemManage.MenuTree[]>([]);
const menuTreeLoading = ref(false);

async function loadMenuTree() {
  menuTreeLoading.value = true;
  try {
    const response = await fetchGetMenuTree();
    menuTreeData.value = response.data || [];
  } catch {
    // Silently ignore menu tree load errors
  } finally {
    menuTreeLoading.value = false;
  }
}

function getIconLabelVNode(value: string) {
  return h('div', { class: 'flex-y-center gap-16px' }, [
    h(SvgIcon, { icon: value, class: 'text-icon' }),
    h('span', { class: 'text-sm' }, value)
  ]);
}

const loading = ref(false);

function handleInitModel() {
  model.value = createDefaultModel();

  if (!props.rowData) return;

  if (props.operateType === 'addChild') {
    const { id } = props.rowData;
    Object.assign(model.value, { parentId: String(id) });
  }

  if (props.operateType === 'edit') {
    const row = props.rowData;
    model.value = {
      id: row.id,
      parentId: row.parentId || '0',
      path: row.path,
      name: row.name,
      hidden: row.hidden,
      component: row.component,
      sort: row.sort,
      keepAlive: row.keepAlive,
      title: row.title,
      icon: row.icon,
      menuType: row.menuType,
      isFrame: row.isFrame,
      parameters: row.parameters || '',
      status: row.status,
      singleLayout: row.singleLayout || ''
    };
  }
}

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  loading.value = true;
  try {
    const submitData = {
      parentId: model.value.parentId,
      path: model.value.path,
      name: model.value.name,
      hidden: model.value.hidden,
      component: model.value.component,
      sort: model.value.sort,
      keepAlive: model.value.keepAlive,
      title: model.value.title,
      icon: model.value.icon,
      menuType: model.value.menuType,
      isFrame: model.value.isFrame,
      status: model.value.status,
      singleLayout: model.value.singleLayout
    };

    if (props.operateType === 'edit') {
      const { error } = await fetchUpdateMenu({
        id: model.value.id!,
        ...submitData
      });
      if (!error) {
        window.$message?.success($t('common.updateSuccess'));
        closeModal();
        emit('submitted');
      }
    } else {
      const { error } = await fetchCreateMenu(submitData);
      if (!error) {
        window.$message?.success($t('common.addSuccess'));
        closeModal();
        emit('submitted');
      }
    }
  } finally {
    loading.value = false;
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    loadMenuTree();
  }
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" preset="card" class="w-800px">
    <ElScrollbar class="h-480px pr-20px">
      <ElForm ref="formRef" :model="model" :rules="rules" label-position="right" :label-width="100">
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="上级菜单" prop="parentId">
              <ElTreeSelect
                v-model="model.parentId"
                :data="menuTreeData"
                :props="{ label: 'label', value: 'id', children: 'children' } as any"
                check-strictly
                clearable
                placeholder="请选择上级菜单（不选则为顶级菜单）"
                class="w-full"
                :loading="menuTreeLoading"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="菜单类型" prop="menuType">
              <ElRadioGroup v-model="model.menuType" :disabled="disabledMenuType">
                <ElRadio v-for="item in menuTypeOptions" :key="item.value" :value="item.value" :label="item.label" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="菜单名称" prop="title">
              <ElInput v-model="model.title" placeholder="请输入菜单名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="路由名称" prop="name">
              <ElInput v-model="model.name" placeholder="请输入路由名称（如：manage_user）" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="路由路径" prop="path">
              <ElInput v-model="model.path" placeholder="请输入路由路径（如：/manage/user）" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="组件路径" prop="component">
              <ElInput v-model="model.component" placeholder="请输入组件路径（如：manage_user）" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="菜单图标" prop="icon">
              <ElSelect v-model="model.icon" placeholder="请选择图标" class="w-full" clearable filterable>
                <template #label="{ value }">
                  <component :is="getIconLabelVNode(value)" />
                </template>
                <ElOption v-for="{ value } in localIconOptions" :key="value" :value="value">
                  <component :is="getIconLabelVNode(value)" />
                </ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="排序" prop="sort">
              <ElInputNumber v-model="model.sort" :min="0" class="w-full" placeholder="请输入排序" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="状态" prop="status">
              <ElRadioGroup v-model="model.status">
                <ElRadio :value="1">启用</ElRadio>
                <ElRadio :value="2">禁用</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否隐藏" prop="hidden">
              <ElRadioGroup v-model="model.hidden">
                <ElRadio :value="0">否</ElRadio>
                <ElRadio :value="1">是</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否缓存" prop="keepAlive">
              <ElRadioGroup v-model="model.keepAlive">
                <ElRadio :value="0">否</ElRadio>
                <ElRadio :value="1">是</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否外链" prop="isFrame">
              <ElRadioGroup v-model="model.isFrame">
                <ElRadio :value="0">否</ElRadio>
                <ElRadio :value="1">是</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </ElScrollbar>
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeModal">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
