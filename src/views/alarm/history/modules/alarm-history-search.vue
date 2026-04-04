<script setup lang="ts">
import type { Api } from '@/service/api/alarm';

defineOptions({ name: 'AlarmHistorySearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const model = defineModel<Api.AlarmHistory.SearchParams>('model', { required: true });

const emit = defineEmits<Emits>();

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
      <ElFormItem label="指标编码" class="w-280px">
        <ElInput v-model="model.indexCode" placeholder="请输入指标编码" clearable />
      </ElFormItem>
      <ElFormItem label="处理状态" class="w-280px">
        <ElSelect v-model="model.handleStatus" placeholder="请选择状态" clearable>
          <ElOption label="未处理" value="0" />
          <ElOption label="已确认" value="1" />
          <ElOption label="已处理" value="2" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="开始时间" class="w-320px">
        <ElDatePicker
          v-model="model.beginTime"
          type="datetime"
          placeholder="选择开始时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          clearable
        />
      </ElFormItem>
      <ElFormItem label="结束时间" class="w-320px">
        <ElDatePicker
          v-model="model.endTime"
          type="datetime"
          placeholder="选择结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          clearable
        />
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