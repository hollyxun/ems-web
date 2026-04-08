<script setup lang="ts">
defineOptions({ name: 'AlarmItemSearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const model = defineModel<Api.AlarmItem.SearchParams>('model', { required: true });

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
      <ElFormItem label="节点ID" class="w-280px">
        <ElInput v-model="model.nodeId" placeholder="请输入节点ID" clearable />
      </ElFormItem>
      <ElFormItem label="计量点ID" class="w-280px">
        <ElInput v-model="model.pointId" placeholder="请输入计量点ID" clearable />
      </ElFormItem>
      <ElFormItem label="状态" class="w-280px">
        <ElSelect v-model="model.startStop" placeholder="请选择状态" clearable>
          <ElOption label="启用" value="1" />
          <ElOption label="停止" value="2" />
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
