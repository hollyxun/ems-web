<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { fetchUpdateMenu } from '@/service/api';
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
  rowData?: Api.SystemManage.MenuTree | null;
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
  return titles[props.operateType] || '编辑菜单';
});

interface Model {
  id: number;
  routeName: string;
  parentMenuId: number;
  title: string;
  icon: string;
  sort: number;
  status: Api.SystemManage.MenuStatus;
  isFolder: boolean;
  hideInMenu: boolean;
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    id: 0,
    routeName: '',
    parentMenuId: 0,
    title: '',
    icon: '',
    sort: 1,
    status: 1,
    isFolder: false,
    hideInMenu: false
  };
}

const rules = {
  status: defaultRequiredRule
};

const statusOptions = [
  { label: $t('page.manage.common.status.enable'), value: 1 },
  { label: $t('page.manage.route.obsolete'), value: 2 }
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
      routeName: row.routeName,
      parentMenuId: row.parentMenuId,
      title: row.title,
      icon: row.icon,
      sort: row.sort,
      status: row.status,
      isFolder: row.isFolder,
      hideInMenu: row.hideInMenu || false
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
    const { error } = await fetchUpdateMenu({
      id: model.value.id,
      title: model.value.title,
      icon: model.value.icon,
      sort: model.value.sort,
      status: model.value.status,
      hideInMenu: model.value.hideInMenu
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
  <ElDialog v-model="visible" :title="title" class="w-900px">
    <ElScrollbar class="h-400px pr-20px">
      <ElForm ref="formRef" :model="model" :rules="rules" label-position="right" :label-width="100">
        <ElRow :gutter="20">
          <!-- 基本信息（只读展示） -->
          <ElCol :span="24">
            <ElFormItem :label="$t('page.manage.menu.routeName')">
              <ElInput
                v-model="model.routeName"
                disabled
                :placeholder="$t('page.manage.menu.routeName') + $t('page.manage.menu.readOnly')"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="父级菜单ID">
              <ElInput v-model="model.parentMenuId" disabled placeholder="父级菜单ID（只读）" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="是否文件夹">
              <ElRadioGroup v-model="model.isFolder" disabled>
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
          <ElCol :span="12">
            <ElFormItem label="隐藏菜单" prop="hideInMenu">
              <ElRadioGroup v-model="model.hideInMenu">
                <ElRadio :value="true">{{ $t('common.yesOrNo.yes') }}</ElRadio>
                <ElRadio :value="false">{{ $t('common.yesOrNo.no') }}</ElRadio>
              </ElRadioGroup>
              <div class="mt-4px text-12px text-gray-500">隐藏后不在导航菜单中显示，但路由仍可访问</div>
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
