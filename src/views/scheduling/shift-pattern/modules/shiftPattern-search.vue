<script setup lang="ts">
import { useForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'ShiftPatternSearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useForm();

const model = defineModel<Api.Scheduling.ShiftPatternSearchParams>('model', { required: true });

const patternTypeOptions = [
  { label: '五班四运转', value: 1 },
  { label: '四班三运转', value: 2 },
  { label: '三班两运转', value: 3 },
  { label: '两班制', value: 4 },
  { label: '长白班', value: 5 },
  { label: '自定义', value: 6 }
];

async function reset() {
  await restoreValidation();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <ElCard class="card-wrapper">
    <ElCollapse>
      <ElCollapseItem :title="$t('common.search')" name="shiftPattern-search">
        <ElForm ref="formRef" :model="model" label-position="right" :label-width="80">
          <ElRow :gutter="24">
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem label="模式名称" prop="name">
                <ElInput v-model="model.name" placeholder="请输入模式名称" />
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem label="模式类型" prop="patternType">
                <ElSelect v-model="model.patternType" clearable placeholder="请选择模式类型">
                  <ElOption
                    v-for="item in patternTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem label="状态" prop="status">
                <ElSelect v-model="model.status" clearable placeholder="请选择状态">
                  <ElOption label="启用" :value="1" />
                  <ElOption label="禁用" :value="2" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="24" :sm="24">
              <ElSpace class="w-full justify-end" alignment="end">
                <ElButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </ElButton>
                <ElButton type="primary" plain @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </ElButton>
              </ElSpace>
            </ElCol>
          </ElRow>
        </ElForm>
      </ElCollapseItem>
    </ElCollapse>
  </ElCard>
</template>

<style scoped></style>
