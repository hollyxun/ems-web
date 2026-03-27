<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchGetAllMediums } from '@/service/api/energy';
import { fetchOrganizationTree } from '@/service/api/organization';

defineOptions({ name: 'TouSearch' });

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<{
  factoryId?: number;
  mediumId?: number;
  periodType?: number;
  effectiveDate?: string;
}>('model', { required: true });

const allMediums = ref<Api.Energy.Medium[]>([]);
const organizationTree = ref<Api.Organization.OrganizationItem[]>([]);

const periodTypeOptions = [
  { label: '峰时', value: 1 },
  { label: '平时', value: 2 },
  { label: '谷时', value: 3 }
];

// Filter to only show factories (type 2)
const factoryOptions = computed(() => {
  return filterFactories(organizationTree.value);
});

function filterFactories(items: Api.Organization.OrganizationItem[]): Api.Organization.OrganizationItem[] {
  const result: Api.Organization.OrganizationItem[] = [];
  for (const item of items) {
    if (item.type === 2) {
      result.push(item);
    }
    if (item.children && item.children.length > 0) {
      result.push(...filterFactories(item.children));
    }
  }
  return result;
}

async function loadMediums() {
  const { data } = await fetchGetAllMediums();
  if (data) {
    allMediums.value = data;
  }
}

async function loadOrganizations() {
  const { data } = await fetchOrganizationTree();
  if (data) {
    organizationTree.value = data;
  }
}

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
      <ElFormItem label="工厂">
        <ElSelect v-model="model.factoryId" placeholder="请选择工厂" clearable class="w-180px">
          <ElOption v-for="item in factoryOptions" :key="item.id" :label="item.name" :value="item.id" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="能源介质">
        <ElSelect v-model="model.mediumId" placeholder="请选择介质" clearable class="w-140px">
          <ElOption v-for="item in allMediums" :key="item.id" :label="item.mediumName" :value="item.id" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="时段类型">
        <ElSelect v-model="model.periodType" placeholder="请选择类型" clearable class="w-120px">
          <ElOption v-for="item in periodTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="生效日期">
        <ElDatePicker
          v-model="model.effectiveDate"
          type="date"
          placeholder="请选择日期"
          value-format="YYYY-MM-DD"
          class="w-160px"
        />
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
