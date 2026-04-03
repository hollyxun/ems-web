<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { fetchUpdateRoute } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { getLocalIcons } from '@/utils/icon';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';

defineOptions({ name: 'MenuOperateModal' });

export type OperateType = UI.TableOperateType;

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit menu data */
  rowData?: Api.RouteMenu.RouteMenu | null;
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
    edit: $t('page.manage.menu.editMenu')
  };
  return titles[props.operateType] || '编辑路由菜单';
});

interface Model {
  id: number;
  name: string;
  path: string;
  component?: string;
  parentName?: string;
  title?: string;
  icon?: string;
  sort: number;
  isConstant: boolean;
  status: Api.RouteMenu.RouteMenuStatus;
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: 0,
    name: '',
    path: '',
    component: '',
    parentName: '',
    title: '',
    icon: '',
    sort: 1,
    isConstant: false,
    status: 1
  };
}

const rules = {
  status: defaultRequiredRule
};

const statusOptions = [
  { label: $t('page.manage.common.status.enable'), value: 1 },
  { label: $t('page.manage.common.status.disable'), value: 2 },
  { label: $t('page.manage.route.obsolete'), value: 3 }
];

const localIcons = getLocalIcons();
const localIconOptions = localIcons.map(item => ({
  value: item
}));

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

  if (props.operateType === 'edit') {
    const row = props.rowData;
    model.value = {
      id: row.id,
      name: row.name,
      path: row.path,
      component: row.component,
      parentName: row.parentName,
      title: row.title,
      icon: row.icon,
      sort: row.sort,
      isConstant: row.isConstant,
      status: row.status
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
    const { error } = await fetchUpdateRoute({
      id: model.value.id,
      title: model.value.title,
      icon: model.value.icon,
      sort: model.value.sort,
      status: model.value.status
    });

    if (!error) {
      window.$message?.success($t('common.updateSuccess'));
      closeModal();
      emit('submitted');
    }
  } finally {
    loading.value = false;
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
  <ElDialog v-model="visible" :title="title" class="w-600px">
    <ElScrollbar class="h-400px pr-20px">
      <ElForm ref="formRef" :model="model" :rules="rules" label-position="right" :label-width="100">
        <ElRow :gutter="20">
          <!-- 基本信息（只读展示） -->
          <ElCol :span="24">
            <ElFormItem :label="$t('page.manage.menu.routeName')">
              <ElInput
                v-model="model.name"
                disabled
                :placeholder="$t('page.manage.menu.routeName') + $t('page.manage.menu.readOnly')"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem :label="$t('page.manage.menu.routePath')">
              <ElInput
                v-model="model.path"
                disabled
                :placeholder="$t('page.manage.menu.routePath') + $t('page.manage.menu.readOnly')"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem :label="$t('page.manage.menu.componentPath')">
              <ElInput
                v-model="model.component"
                disabled
                :placeholder="$t('page.manage.menu.componentPath') + $t('page.manage.menu.readOnly')"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="父级路由">
              <ElInput v-model="model.parentName" disabled placeholder="父级路由名称（只读）" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem :label="$t('page.manage.menu.constant')">
              <ElRadioGroup v-model="model.isConstant" disabled>
                <ElRadio :value="true">{{ $t('common.yesOrNo.yes') }}</ElRadio>
                <ElRadio :value="false">{{ $t('common.yesOrNo.no') }}</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>

          <!-- 可编辑字段 -->
          <ElDivider content-position="left">{{ $t('page.manage.menu.editableConfig') }}</ElDivider>
          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.menu.menuTitle')" prop="title">
              <ElInput v-model="model.title" :placeholder="$t('page.manage.menu.form.menuName')" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.menu.menuIcon')" prop="icon">
              <ElSelect
                v-model="model.icon"
                :placeholder="$t('page.manage.menu.pleaseSelectIcon')"
                class="w-full"
                clearable
                filterable
              >
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
            <ElFormItem :label="$t('page.manage.menu.order')" prop="sort">
              <ElInputNumber
                v-model="model.sort"
                :min="0"
                class="w-full"
                :placeholder="$t('page.manage.menu.pleaseInputOrder')"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="$t('page.manage.menu.menuStatus')" prop="status">
              <ElRadioGroup v-model="model.status">
                <ElRadio v-for="item in statusOptions" :key="item.value" :value="item.value" :label="item.label" />
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
