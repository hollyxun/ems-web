<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({ name: 'VirtualMeterSearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Energy.VirtualMeterSearchParams>('model', { required: true });

const calculateTypeOptions = [
  { label: '求和', value: 'sum' },
  { label: '差值', value: 'difference' },
  { label: '平均值', value: 'average' },
  { label: '比率', value: 'ratio' },
  { label: '自定义公式', value: 'custom' }
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
      <ElFormItem label="编码">
        <ElInput v-model="model.code" placeholder="请输入虚拟计量点编码" clearable />
      </ElFormItem>
      <ElFormItem label="名称">
        <ElInput v-model="model.name" placeholder="请输入虚拟计量点名称" clearable />
      </ElFormItem>
      <ElFormItem label="计算类型">
        <ElSelect v-model="model.calculateType" placeholder="请选择计算类型" clearable style="width: 160px">
          <ElOption v-for="item in calculateTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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