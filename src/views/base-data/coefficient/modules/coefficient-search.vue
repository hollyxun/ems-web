<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({ name: 'CoefficientSearch' });

interface Props {
  mediums: Api.Energy.Medium[];
}

defineProps<Props>();

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Energy.CoefficientSearchParams>('model', { required: true });

const coefficientTypeOptions = [
  { label: '折标煤系数', value: 1 },
  { label: '碳排放系数', value: 2 }
];

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '停用', value: 2 }
];

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <ElCard class="card-wrapper">
    <ElForm :model="model" label-width="80px" inline>
      <ElFormItem label="所属介质">
        <ElSelect v-model="model.mediumId" placeholder="请选择介质" clearable style="width: 160px">
          <ElOption v-for="item in mediums" :key="item.id" :label="item.mediumName" :value="item.id" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="系数类型">
        <ElSelect v-model="model.coefficientType" placeholder="请选择系数类型" clearable style="width: 160px">
          <ElOption v-for="item in coefficientTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSelect v-model="model.status" placeholder="请选择状态" clearable style="width: 160px">
          <ElOption v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="search">
          <template #icon>
            <icon-ic-round-search />
          </template>
          {{ $t('common.search') }}
        </ElButton>
        <ElButton @click="reset">
          <template #icon>
            <icon-ic-round-refresh />
          </template>
          {{ $t('common.reset') }}
        </ElButton>
      </ElFormItem>
    </ElForm>
  </ElCard>
</template>
