<script setup lang="ts">
import { useForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'FactoryCalendarSearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
  (e: 'generate'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useForm();

const model = defineModel<Api.Scheduling.FactoryCalendarSearchParams>('model', { required: true });

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

async function reset() {
  await restoreValidation();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}

function generate() {
  emit('generate');
}
</script>

<template>
  <ElCard class="card-wrapper">
    <ElCollapse>
      <ElCollapseItem :title="$t('common.search')" name="factory-calendar-search">
        <ElForm ref="formRef" :model="model" label-position="right" :label-width="80">
          <ElRow :gutter="24">
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem label="年份">
                <ElSelect v-model="model.year" clearable placeholder="请选择年份">
                  <ElOption v-for="year in yearOptions" :key="year" :label="year + '年'" :value="year" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem label="月份">
                <ElSelect v-model="model.month" clearable placeholder="请选择月份">
                  <ElOption v-for="month in monthOptions" :key="month" :label="month + '月'" :value="month" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem label="工厂月">
                <ElInput v-model="model.factoryMonth" placeholder="如：2024-01" clearable />
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
                <ElButton type="success" @click="generate">
                  <template #icon>
                    <icon-ic-round-add class="text-icon" />
                  </template>
                  生成工厂月
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
