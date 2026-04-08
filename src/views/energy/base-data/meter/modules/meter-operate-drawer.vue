<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCreateMeter, fetchGetQRCode, fetchUpdateMeter } from '@/service/api/energy-meter';
import { fetchGetAllMediums } from '@/service/api/energy';
import { fetchOrganizationTree } from '@/service/api/organization';

defineOptions({ name: 'MeterOperateDrawer' });

interface Props {
  operateType: UI.TableOperateType;
  rowData?: Api.Energy.MeteringPoint | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const formRef = ref();
const qrCodeUrl = ref('');
const allMediums = ref<Api.Energy.Medium[]>([]);
const organizationTree = ref<Api.Organization.OrganizationItem[]>([]);

const formData = ref<Api.Energy.MeteringPoint>({
  id: 0,
  code: '',
  name: '',
  type: 1,
  organizationId: 0,
  mediumId: 0,
  location: '',
  frequency: 15,
  influxTag: '',
  qrCode: '',
  installDate: '',
  status: 1,
  description: ''
});

const title = computed(() => {
  return props.operateType === 'add' ? '新增计量点' : '编辑计量点';
});

const meterTypeOptions = [
  { label: '总表', value: 1 },
  { label: '分表', value: 2 },
  { label: '设备表', value: 3 }
];

const frequencyOptions = [
  { label: '1分钟', value: 1 },
  { label: '5分钟', value: 5 },
  { label: '15分钟', value: 15 },
  { label: '60分钟', value: 60 }
];

const statusOptions = [
  { label: '在线', value: 1 },
  { label: '离线', value: 2 },
  { label: '故障', value: 3 }
];

const rules = {
  code: [{ required: true, message: '请输入计量点编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入计量点名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择计量点类型', trigger: 'change' }],
  organizationId: [{ required: true, message: '请选择所属组织', trigger: 'change' }],
  mediumId: [{ required: true, message: '请选择能源介质', trigger: 'change' }],
  frequency: [{ required: true, message: '请选择采集频率', trigger: 'change' }]
};

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

function resetForm() {
  formData.value = {
    id: 0,
    code: '',
    name: '',
    type: 1,
    organizationId: 0,
    mediumId: 0,
    location: '',
    frequency: 15,
    influxTag: '',
    qrCode: '',
    installDate: '',
    status: 1,
    description: ''
  };
  qrCodeUrl.value = '';
}

async function handleSubmit() {
  await formRef.value?.validate();

  const isEdit = props.operateType === 'edit';
  const { error } = isEdit ? await fetchUpdateMeter(formData.value) : await fetchCreateMeter(formData.value);

  if (!error) {
    ElMessage.success(isEdit ? '编辑成功' : '新增成功');
    visible.value = false;
    emit('submitted');
  }
}

async function loadQRCode() {
  if (!formData.value.id) return;

  const { data, error } = await fetchGetQRCode(formData.value.id);
  if (!error && data) {
    qrCodeUrl.value = data.qrCode;
  }
}

function downloadQRCode() {
  if (!qrCodeUrl.value) return;

  const link = document.createElement('a');
  link.href = `data:image/png;base64,${qrCodeUrl.value}`;
  link.download = `${formData.value.code}_qrcode.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

watch(visible, val => {
  if (val) {
    loadMediums();
    loadOrganizations();
    if (props.operateType === 'edit' && props.rowData) {
      formData.value = { ...props.rowData };
      loadQRCode();
    } else {
      resetForm();
    }
  }
});

onMounted(() => {
  loadMediums();
  loadOrganizations();
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" size="600px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="计量点编码" prop="code">
        <ElInput v-model="formData.code" placeholder="请输入计量点编码" :disabled="operateType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="计量点名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入计量点名称" />
      </ElFormItem>
      <ElFormItem label="计量点类型" prop="type">
        <ElSelect v-model="formData.type" placeholder="请选择类型" class="w-full">
          <ElOption v-for="item in meterTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="所属组织" prop="organizationId">
        <ElTreeSelect
          v-model="formData.organizationId"
          :data="organizationTree"
          :props="{ label: 'name', value: 'id' } as any"
          placeholder="请选择所属组织"
          check-strictly
          class="w-full"
        />
      </ElFormItem>
      <ElFormItem label="能源介质" prop="mediumId">
        <ElSelect v-model="formData.mediumId" placeholder="请选择能源介质" class="w-full">
          <ElOption v-for="item in allMediums" :key="item.id" :label="item.mediumName" :value="item.id" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="安装位置">
        <ElInput v-model="formData.location" placeholder="请输入安装位置" />
      </ElFormItem>
      <ElFormItem label="采集频率" prop="frequency">
        <ElSelect v-model="formData.frequency" placeholder="请选择采集频率" class="w-full">
          <ElOption v-for="item in frequencyOptions" :key="item.value" :label="item.label" :value="item.value" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="InfluxDB标签">
        <ElInput v-model="formData.influxTag" placeholder="请输入时序数据库标签" />
      </ElFormItem>
      <ElFormItem label="安装日期">
        <ElDatePicker
          v-model="formData.installDate"
          type="date"
          placeholder="请选择安装日期"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElRadioGroup v-model="formData.status">
          <ElRadio v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label }}</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="描述">
        <ElInput v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
      </ElFormItem>

      <!-- QR Code Section (edit mode only) -->
      <ElFormItem v-if="operateType === 'edit' && qrCodeUrl" label="二维码">
        <div class="flex flex-col items-start gap-2">
          <img :src="`data:image/png;base64,${qrCodeUrl}`" alt="QR Code" class="h-32 w-32 border" />
          <ElButton type="primary" size="small" @click="downloadQRCode">下载二维码</ElButton>
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace>
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>
