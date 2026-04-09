<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({ name: 'PolicySearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Casbin.PolicySearchParams>('model', { required: true });

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <ElCard class="card-wrapper">
    <ElForm :model="model" label-placement="left" :label-width="80">
      <ElRow :gutter="16" wrap>
        <ElCol :span="24" :sm="12" :md="8" :lg="6">
          <ElFormItem label="角色ID">
            <ElInput v-model="model.sub" placeholder="请输入角色ID" clearable @keyup.enter="search" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24" :sm="12" :md="8" :lg="6">
          <ElFormItem label="资源">
            <ElInput v-model="model.obj" placeholder="请输入资源路径" clearable @keyup.enter="search" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24" :sm="12" :md="8" :lg="6">
          <ElFormItem label="操作">
            <ElInput v-model="model.act" placeholder="请输入操作" clearable @keyup.enter="search" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24" :sm="12" :md="8" :lg="6">
          <ElFormItem class="flex justify-end">
            <ElButton type="primary" @click="search">
              {{ $t('common.search') }}
            </ElButton>
            <ElButton @click="reset">
              {{ $t('common.reset') }}
            </ElButton>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
  </ElCard>
</template>

<style scoped></style>
