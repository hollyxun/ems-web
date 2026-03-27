<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  fetchGetCrossFactoryPermission,
  fetchGetOperationPermissions,
  fetchGetShiftPermission,
  fetchSetCrossFactoryPermission,
  fetchSetOperationPermission,
  fetchSetShiftPermission
} from '@/service/api/advanced-permission';
import type { OperationPermission } from '@/service/api/advanced-permission';

defineOptions({ name: 'AdvancedPermissionManage' });

// Roles - should come from store or API
const roles = ref([
  { id: 1, name: '系统管理员' },
  { id: 2, name: '集团管理员' },
  { id: 3, name: '工厂管理员' },
  { id: 4, name: '车间主管' },
  { id: 5, name: '班组长' },
  { id: 6, name: '访客' }
]);

// Factories - should come from organization API
const factories = ref([
  { id: 1, name: '北京工厂' },
  { id: 2, name: '上海工厂' },
  { id: 3, name: '广州工厂' }
]);

const selectedRoleId = ref<number>(3);
const activeTab = ref('cross-factory');
const loading = ref(false);

// Cross-factory permission
const crossFactoryForm = ref({
  allowed: false,
  factoryIds: [] as number[]
});

// Shift permission
const shiftScope = ref<'own' | 'all'>('own');

// Operation permissions
const operationPermissions = ref<OperationPermission[]>([]);
const saving = ref(false);

const modules = ['energy', 'report', 'ranking', 'comparison'];
const operations = ['view', 'enter', 'modify', 'delete', 'export'] as const;

const operationLabels: Record<string, string> = {
  view: '查看',
  enter: '录入',
  modify: '修改',
  delete: '删除',
  export: '导出'
};

const moduleLabels: Record<string, string> = {
  energy: '能源数据',
  report: '报表管理',
  ranking: '能效排名',
  comparison: '对比分析'
};

const isAllFactories = computed(() => {
  return (
    crossFactoryForm.value.factoryIds.length === 0 ||
    crossFactoryForm.value.factoryIds.length === factories.value.length
  );
});

// Load permission data
async function loadPermissions() {
  if (!selectedRoleId.value) return;
  loading.value = true;

  try {
    // Load cross-factory permission
    const crossFactoryRes = await fetchGetCrossFactoryPermission(selectedRoleId.value);
    if (crossFactoryRes.data) {
      crossFactoryForm.value.allowed = crossFactoryRes.data.allowed;
      crossFactoryForm.value.factoryIds = crossFactoryRes.data.factoryIds || [];
    }

    // Load shift permission
    const shiftRes = await fetchGetShiftPermission(selectedRoleId.value);
    if (shiftRes.data) {
      shiftScope.value = shiftRes.data.scope;
    }

    // Load operation permissions
    const opRes = await fetchGetOperationPermissions(selectedRoleId.value);
    operationPermissions.value = opRes.data || [];
  } catch {
    ElMessage.error('加载权限失败');
  } finally {
    loading.value = false;
  }
}

// Build permission matrix
const permissionMatrix = computed(() => {
  const matrix: Record<string, Record<string, boolean>> = {};

  modules.forEach(module => {
    matrix[module] = {};
    operations.forEach(op => {
      const perm = operationPermissions.value.find(p => p.module === module && p.operation === op);
      matrix[module][op] = perm?.allowed ?? false;
    });
  });

  return matrix;
});

// Save cross-factory permission
async function saveCrossFactoryPermission() {
  loading.value = true;
  try {
    await fetchSetCrossFactoryPermission({
      roleId: selectedRoleId.value,
      allowed: crossFactoryForm.value.allowed,
      factoryIds: crossFactoryForm.value.allowed ? crossFactoryForm.value.factoryIds : []
    });
    ElMessage.success('跨厂权限设置成功');
  } catch {
    ElMessage.error('设置失败');
  } finally {
    loading.value = false;
  }
}

// Save shift permission
async function saveShiftPermission() {
  loading.value = true;
  try {
    await fetchSetShiftPermission({
      roleId: selectedRoleId.value,
      scope: shiftScope.value
    });
    ElMessage.success('班次权限设置成功');
  } catch {
    ElMessage.error('设置失败');
  } finally {
    loading.value = false;
  }
}

// Toggle operation permission
async function toggleOperationPermission(module: string, operation: string) {
  if (!selectedRoleId.value) return;

  saving.value = true;
  const newAllowed = !permissionMatrix.value[module][operation];

  try {
    await fetchSetOperationPermission({
      roleId: selectedRoleId.value,
      module,
      operation: operation as OperationPermission['operation'],
      allowed: newAllowed
    });

    // Update local state
    const idx = operationPermissions.value.findIndex(p => p.module === module && p.operation === operation);
    if (idx >= 0) {
      operationPermissions.value[idx].allowed = newAllowed;
    } else {
      operationPermissions.value.push({
        roleId: selectedRoleId.value,
        module,
        operation: operation as OperationPermission['operation'],
        allowed: newAllowed
      });
    }

    ElMessage.success(`${moduleLabels[module]} ${operationLabels[operation]} 权限${newAllowed ? '开启' : '关闭'}`);
  } catch {
    ElMessage.error('设置失败');
  } finally {
    saving.value = false;
  }
}

// Handle "select all" toggle for factories
function handleSelectAll(val: boolean) {
  if (val) {
    crossFactoryForm.value.factoryIds = factories.value.map(f => f.id);
  } else {
    crossFactoryForm.value.factoryIds = [];
  }
}

watch(() => selectedRoleId.value, loadPermissions, { immediate: true });
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">高级权限配置</h3>
          <ElSelect v-model="selectedRoleId" placeholder="选择角色" class="w-48">
            <ElOption v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </ElSelect>
        </div>
      </template>

      <ElTabs v-model="activeTab">
        <ElTabPane label="跨厂权限" name="cross-factory">
          <ElForm v-loading="loading" label-width="120px" class="p-4">
            <ElFormItem label="启用跨厂查看">
              <ElSwitch v-model="crossFactoryForm.allowed" />
              <span class="ml-2 text-sm text-gray-500">开启后可查看其他工厂数据</span>
            </ElFormItem>

            <ElFormItem v-if="crossFactoryForm.allowed" label="授权工厂">
              <div class="flex flex-col gap-2">
                <ElCheckbox
                  :model-value="isAllFactories"
                  :indeterminate="crossFactoryForm.factoryIds.length > 0 && !isAllFactories"
                  @change="handleSelectAll"
                >
                  全部工厂
                </ElCheckbox>
                <ElCheckboxGroup v-model="crossFactoryForm.factoryIds">
                  <ElCheckbox v-for="factory in factories" :key="factory.id" :label="factory.id">
                    {{ factory.name }}
                  </ElCheckbox>
                </ElCheckboxGroup>
              </div>
            </ElFormItem>

            <ElFormItem>
              <ElButton type="primary" :loading="loading" @click="saveCrossFactoryPermission">保存设置</ElButton>
            </ElFormItem>
          </ElForm>
        </ElTabPane>

        <ElTabPane label="班次权限" name="shift">
          <div v-loading="loading" class="p-4">
            <ElRadioGroup v-model="shiftScope" class="flex flex-col gap-3">
              <ElRadio label="own" class="flex items-start border rounded-lg p-3 hover:bg-gray-50">
                <div class="flex flex-col">
                  <span class="font-medium">仅本班次</span>
                  <span class="text-sm text-gray-500">只能查看本人所在班次的数据</span>
                </div>
              </ElRadio>
              <ElRadio label="all" class="flex items-start border rounded-lg p-3 hover:bg-gray-50">
                <div class="flex flex-col">
                  <span class="font-medium">全部班次</span>
                  <span class="text-sm text-gray-500">可查看所有班次的数据</span>
                </div>
              </ElRadio>
            </ElRadioGroup>

            <div class="mt-4">
              <ElButton type="primary" :loading="loading" @click="saveShiftPermission">保存设置</ElButton>
            </div>
          </div>
        </ElTabPane>

        <ElTabPane label="操作权限" name="operation">
          <div v-loading="loading" class="p-4">
            <ElTable :data="modules" border>
              <ElTableColumn label="模块" prop="module" width="120">
                <template #default="{ row: module }">
                  {{ moduleLabels[module] }}
                </template>
              </ElTableColumn>

              <ElTableColumn v-for="op in operations" :key="op" :label="operationLabels[op]" width="80" align="center">
                <template #default="{ row: module }">
                  <ElSwitch
                    :model-value="permissionMatrix[module][op]"
                    :disabled="saving"
                    @change="toggleOperationPermission(module, op)"
                  />
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-radio) {
  height: auto;
  align-items: flex-start;
}
</style>
