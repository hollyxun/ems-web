<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({ name: 'MediumSearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Energy.MediumSearchParams>('model', { required: true });

const mediumTypeOptions = [
  { label: '一次能源', value: 1 },
  { label: '二次能源', value: 2 },
  { label: '耗能工质', value: 3 }
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
      <ElFormItem label="介质编码">
        <ElInput v-model="model.mediumCode" placeholder="请输入介质编码" clearable />
      </ElFormItem>
      <ElFormItem label="介质名称">
        <ElInput v-model="model.mediumName" placeholder="请输入介质名称" clearable />
      </ElFormItem>
      <ElFormItem label="介质类型">
        <ElSelect v-model="model.mediumType" placeholder="请选择介质类型" clearable style="width: 160px">
          <ElOption v-for="item in mediumTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
