<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchGetAllMediums } from '@/service/api/energy';
import { fetchOrganizationTree } from '@/service/api/organization';

defineOptions({ name: 'MeterSearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Energy.MeterSearchParams>('model', { required: true });

const allMediums = ref<Api.Energy.Medium[]>([]);
const organizations = ref<Api.Organization.OrganizationItem[]>([]);

const meterTypeOptions = [
  { label: '总表', value: 1 },
  { label: '分表', value: 2 },
  { label: '设备表', value: 3 }
];

const statusOptions = [
  { label: '在线', value: 1 },
  { label: '离线', value: 2 },
  { label: '故障', value: 3 }
];

async function loadMediums() {
  const { data } = await fetchGetAllMediums();
  if (data) {
    allMediums.value = data;
  }
}

async function loadOrganizations() {
  const { data } = await fetchOrganizationTree();
  if (data) {
    organizations.value = data;
  }
}

const organizationTree = computed(() => {
  return organizations.value;
});

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}

onMounted(() => {
  loadMediums();
  loadOrganizations();
});
</script>

<template>
  <ElCard class="card-wrapper">
    <ElForm :model="model" label-width="80px" inline>
      <ElFormItem label="计量点编码">
        <ElInput v-model="model.code" placeholder="请输入编码" clearable class="w-160px" />
      </ElFormItem>
      <ElFormItem label="计量点名称">
        <ElInput v-model="model.name" placeholder="请输入名称" clearable class="w-160px" />
      </ElFormItem>
      <ElFormItem label="类型">
        <ElSelect v-model="model.type" placeholder="请选择类型" clearable class="w-140px">
          <ElOption v-for="item in meterTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="所属组织">
        <ElTreeSelect
          v-model="model.organizationId"
          :data="organizationTree"
          :props="{ label: 'name', value: 'id' }"
          placeholder="请选择组织"
          clearable
          check-strictly
          class="w-180px"
        />
      </ElFormItem>
      <ElFormItem label="能源介质">
        <ElSelect v-model="model.mediumId" placeholder="请选择介质" clearable class="w-140px">
          <ElOption v-for="item in allMediums" :key="item.id" :label="item.mediumName" :value="item.id" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSelect v-model="model.status" placeholder="请选择状态" clearable class="w-120px">
          <ElOption v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="search">
          <template #icon>
            <icon-ic-round-search />
          </template>
          查询
        </ElButton>
        <ElButton @click="reset">
          <template #icon>
            <icon-ic-round-refresh />
          </template>
          重置
        </ElButton>
      </ElFormItem>
    </ElForm>
  </ElCard>
</template>
