<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  fetchCreateGatewaySetting,
  fetchGatewaySettingById,
  fetchUpdateGatewaySetting
} from '@/service/api/gatewaysetting';

defineOptions({ name: 'GatewaySettingDrawer' });

interface Props {
  visible: boolean;
  operateType: 'add' | 'edit';
  rowData?: { id: number } | null;
}
interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'submitted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const drawerVisible = computed({
  get() {
    return props.visible;
  },
  set(v) {
    emit('update:visible', v);
  }
});
const title = computed(() => (props.operateType === 'add' ? '新增网关' : '编辑网关'));

const formRef = ref<FormInstance>();
const loading = ref(false);
const formData = ref({
  gatewayNum: '',
  gatewayName: '',
  specsModel: '',
  installLocation: '',
  ipAdd: '',
  runStatus: '未知',
  hbtTime: '',
  deviceNum: 0,
  ptNum: 0
});

const rules: FormRules = {
  gatewayNum: [{ required: true, message: '请输入网关编号', trigger: 'blur' }],
  gatewayName: [{ required: true, message: '请输入网关名称', trigger: 'blur' }]
};

const runStatusOptions = ['在线', '离线', '未知'];

watch(
  () => props.visible,
  async visible => {
    if (visible && props.operateType === 'edit' && props.rowData?.id) {
      const { data, error } = await fetchGatewaySettingById(props.rowData.id);
      if (!error && data) {
        formData.value = {
          gatewayNum: data.gatewayNum,
          gatewayName: data.gatewayName,
          specsModel: data.specsModel || '',
          installLocation: data.installLocation || '',
          ipAdd: data.ipAdd || '',
          runStatus: data.runStatus || '未知',
          hbtTime: data.hbtTime || '',
          deviceNum: data.deviceNum || 0,
          ptNum: data.ptNum || 0
        };
      }
    } else if (visible && props.operateType === 'add') {
      formData.value = {
        gatewayNum: '',
        gatewayName: '',
        specsModel: '',
        installLocation: '',
        ipAdd: '',
        runStatus: '未知',
        hbtTime: '',
        deviceNum: 0,
        ptNum: 0
      };
      formRef.value?.clearValidate();
    }
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    if (props.operateType === 'edit' && props.rowData?.id) {
      const { error } = await fetchUpdateGatewaySetting({ id: props.rowData.id, ...formData.value });
      if (!error) {
        ElMessage.success('更新成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    } else {
      const { error } = await fetchCreateGatewaySetting(formData.value);
      if (!error) {
        ElMessage.success('创建成功');
        drawerVisible.value = false;
        emit('submitted');
      }
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <ElDrawer v-model="drawerVisible" :title="title" size="500px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="网关编号" prop="gatewayNum">
        <ElInput v-model="formData.gatewayNum" placeholder="请输入网关编号" />
      </ElFormItem>
      <ElFormItem label="网关名称" prop="gatewayName">
        <ElInput v-model="formData.gatewayName" placeholder="请输入网关名称" />
      </ElFormItem>
      <ElFormItem label="规格型号" prop="specsModel">
        <ElInput v-model="formData.specsModel" placeholder="请输入规格型号" />
      </ElFormItem>
      <ElFormItem label="安装位置" prop="installLocation">
        <ElInput v-model="formData.installLocation" placeholder="请输入安装位置" />
      </ElFormItem>
      <ElFormItem label="IP地址" prop="ipAdd">
        <ElInput v-model="formData.ipAdd" placeholder="请输入IP地址" />
      </ElFormItem>
      <ElFormItem label="运行状态" prop="runStatus">
        <ElSelect v-model="formData.runStatus" placeholder="请选择运行状态" class="w-full">
          <ElOption v-for="s in runStatusOptions" :key="s" :label="s" :value="s" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="心跳时间" prop="hbtTime">
        <ElDatePicker
          v-model="formData.hbtTime"
          type="datetime"
          placeholder="选择心跳时间"
          class="w-full"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </ElFormItem>
      <ElFormItem label="计量器具数量" prop="deviceNum">
        <ElInputNumber v-model="formData.deviceNum" :min="0" class="w-full" />
      </ElFormItem>
      <ElFormItem label="监测点数量" prop="ptNum">
        <ElInputNumber v-model="formData.ptNum" :min="0" class="w-full" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="drawerVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDrawer>
</template>
