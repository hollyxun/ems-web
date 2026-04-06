<script setup lang="ts">
import type { Api } from '@/service/api/knowledge';

defineOptions({ name: 'KnowledgeSearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const model = defineModel<Api.Knowledge.SearchParams>('model', { required: true });

const emit = defineEmits<Emits>();

const energyTypeOptions = [
  { label: '电', value: 0 },
  { label: '水', value: 1 },
  { label: '天然气', value: 2 },
  { label: '蒸汽', value: 3 }
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
    <ElForm :model="model" label-width="80px" class="flex flex-wrap gap-16px">
      <ElFormItem label="标题" class="w-280px">
        <ElInput v-model="model.title" placeholder="请输入标题" clearable />
      </ElFormItem>
      <ElFormItem label="能源类型" class="w-280px">
        <ElSelect v-model="model.energyType" placeholder="请选择能源类型" clearable>
          <ElOption v-for="item in energyTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem class="ml-auto">
        <ElButton type="primary" @click="search">
          <template #icon>
            <SvgIcon icon="ic:baseline-search" />
          </template>
          查询
        </ElButton>
        <ElButton @click="reset">
          <template #icon>
            <SvgIcon icon="ic:baseline-refresh" />
          </template>
          重置
        </ElButton>
      </ElFormItem>
    </ElForm>
  </ElCard>
</template>
