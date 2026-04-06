<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElButton, ElIcon, ElMessage, ElTabPane, ElTabs } from 'element-plus';
import { Delete, Plus } from '@element-plus/icons-vue';
import {
  fetchCreateVirtualMeter,
  fetchGetAvailableSourceMeters,
  fetchUpdateVirtualMeter,
  fetchValidateFormula
} from '@/service/api/virtual-meter';
import { $t } from '@/locales';
import FormulaVisualEditor from './formula-visual-editor.vue';

defineOptions({ name: 'VirtualMeterOperateDrawer' });

interface Props {
  operateType: UI.TableOperateType;
  rowData?: Api.Energy.VirtualMeter | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const formRef = ref();
const loading = ref(false);
const validating = ref(false);
const sourceMeters = ref<Api.Energy.MeteringPoint[]>([]);
const editorMode = ref<'text' | 'visual'>('text');

interface SourceConfig {
  meterId: number;
  meterName: string;
  meterCode: string;
  coefficient: number;
  order: number;
}

const formData = ref<{
  id: number;
  name: string;
  code: string;
  mediumId: number;
  mediumCode: string;
  calculateType: Api.Energy.VirtualMeter.CalculateType;
  formula: string;
  sourceConfig: SourceConfig[];
  description: string;
  status: number;
}>({
  id: 0,
  name: '',
  code: '',
  mediumId: 0,
  mediumCode: '',
  calculateType: 'sum',
  formula: '',
  sourceConfig: [],
  description: '',
  status: 1
});

const title = computed(() => {
  return props.operateType === 'add' ? '新增虚拟计量点' : '编辑虚拟计量点';
});

const calculateTypeOptions = [
  { label: '求和', value: 'sum', desc: '所有源计量点值乘以系数后相加' },
  { label: '差值', value: 'difference', desc: '第一个源计量点减去其他源计量点' },
  { label: '平均值', value: 'average', desc: '所有源计量点的平均值' },
  { label: '比率', value: 'ratio', desc: '第一个源计量点除以第二个源计量点' },
  { label: '自定义公式', value: 'custom', desc: '使用自定义公式计算' }
];

const rules = {
  name: [{ required: true, message: '请输入虚拟计量点名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入虚拟计量点编码', trigger: 'blur' }],
  calculateType: [{ required: true, message: '请选择计算类型', trigger: 'change' }],
  formula: [{ required: true, message: '请输入计算公式', trigger: 'blur' }]
};

const formulaValid = ref<boolean | null>(null);

// 根据计算类型生成默认公式
function generateFormula() {
  const { calculateType, sourceConfig } = formData.value;

  if (sourceConfig.length === 0) {
    formData.value.formula = '';
    return;
  }

  switch (calculateType) {
    case 'sum':
      formData.value.formula = sourceConfig.map((s, i) => `M${i + 1}`).join(' + ');
      break;
    case 'difference':
      formData.value.formula = sourceConfig.map((s, i) => (i === 0 ? `M${i + 1}` : `- M${i + 1}`)).join(' ');
      break;
    case 'average':
      formData.value.formula = `(${sourceConfig.map((s, i) => `M${i + 1}`).join(' + ')}) / ${sourceConfig.length}`;
      break;
    case 'ratio':
      formData.value.formula = sourceConfig.length >= 2 ? 'M1 / M2' : '';
      break;
    case 'custom':
      // 保持现有公式或生成模板
      if (!formData.value.formula) {
        formData.value.formula = sourceConfig.map((s, i) => `M${i + 1}`).join(' + ');
      }
      break;
  }
}

// 验证公式
async function validateFormula() {
  if (!formData.value.formula) {
    ElMessage.warning('请先输入公式');
    return;
  }

  validating.value = true;
  const { data, error } = await fetchValidateFormula({
    formula: formData.value.formula,
    sourceMeters: formData.value.sourceConfig.map(s => s.meterId)
  });
  validating.value = false;

  if (!error && data) {
    formulaValid.value = data.valid;
    if (data.valid) {
      ElMessage.success('公式验证通过');
    } else {
      ElMessage.error(data.error || '公式验证失败');
    }
  }
}

// 添加源计量点
function addSourceMeter() {
  const order = formData.value.sourceConfig.length + 1;
  formData.value.sourceConfig.push({
    meterId: 0,
    meterName: '',
    meterCode: '',
    coefficient: 1,
    order
  });
}

// 删除源计量点
function removeSourceMeter(index: number) {
  formData.value.sourceConfig.splice(index, 1);
  // 更新顺序
  formData.value.sourceConfig.forEach((s, i) => {
    s.order = i + 1;
  });
  generateFormula();
}

// 选择源计量点
function handleSourceMeterChange(index: number, meterId: number) {
  const meter = sourceMeters.value.find(m => m.id === meterId);
  if (meter) {
    formData.value.sourceConfig[index].meterId = meter.id;
    formData.value.sourceConfig[index].meterName = meter.name;
    formData.value.sourceConfig[index].meterCode = meter.code;

    // 如果是第一个源计量点，设置介质信息
    if (index === 0) {
      formData.value.mediumId = meter.mediumId || 0;
      formData.value.mediumCode = meter.medium?.mediumCode || '';
    }
  }
  generateFormula();
}

// 加载可用源计量点
async function loadSourceMeters() {
  const { data, error } = await fetchGetAvailableSourceMeters();
  if (!error && data) {
    sourceMeters.value = data;
  }
}

function resetForm() {
  formData.value = {
    id: 0,
    name: '',
    code: '',
    mediumId: 0,
    mediumCode: '',
    calculateType: 'sum',
    formula: '',
    sourceConfig: [],
    description: '',
    status: 1
  };
  formulaValid.value = null;
}

async function handleSubmit() {
  await formRef.value?.validate();

  if (formData.value.sourceConfig.length === 0) {
    ElMessage.warning('请至少添加一个源计量点');
    return;
  }

  loading.value = true;
  const isEdit = props.operateType === 'edit';
  const { error } = isEdit
    ? await fetchUpdateVirtualMeter(formData.value)
    : await fetchCreateVirtualMeter(formData.value);

  loading.value = false;

  if (!error) {
    ElMessage.success(isEdit ? '编辑成功' : '新增成功');
    visible.value = false;
    emit('submitted');
  }
}

watch(visible, val => {
  if (val) {
    loadSourceMeters();
    if (props.operateType === 'edit' && props.rowData) {
      formData.value = {
        id: props.rowData.id,
        name: props.rowData.name,
        code: props.rowData.code,
        mediumId: props.rowData.mediumId,
        mediumCode: props.rowData.mediumCode,
        calculateType: props.rowData.calculateType,
        formula: props.rowData.formula,
        sourceConfig: props.rowData.sourceConfig || [],
        description: props.rowData.description || '',
        status: props.rowData.status
      };
    } else {
      resetForm();
    }
  }
});

// 计算类型变化时重新生成公式
watch(
  () => formData.value.calculateType,
  () => {
    generateFormula();
  }
);
</script>

<template>
  <ElDrawer v-model="visible" :title="title" size="600px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="编码" prop="code">
        <ElInput v-model="formData.code" placeholder="请输入虚拟计量点编码" :disabled="operateType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入虚拟计量点名称" />
      </ElFormItem>
      <ElFormItem label="计算类型" prop="calculateType">
        <ElSelect v-model="formData.calculateType" placeholder="请选择计算类型" style="width: 100%">
          <ElOption v-for="item in calculateTypeOptions" :key="item.value" :label="item.label" :value="item.value">
            <div class="flex flex-col">
              <span>{{ item.label }}</span>
              <small class="text-gray-400">{{ item.desc }}</small>
            </div>
          </ElOption>
        </ElSelect>
      </ElFormItem>

      <!-- 源计量点配置 -->
      <ElFormItem label="源计量点">
        <div class="w-full">
          <div class="mb-8px">
            <ElButton type="primary" size="small" @click="addSourceMeter">
              <ElIcon><Plus /></ElIcon>
              添加源计量点
            </ElButton>
          </div>

          <div v-if="formData.sourceConfig.length === 0" class="text-sm text-gray-400">请添加源计量点</div>

          <div v-for="(source, index) in formData.sourceConfig" :key="index" class="source-item">
            <div class="flex items-center gap-8px">
              <span class="source-order">M{{ index + 1 }}</span>
              <ElSelect
                v-model="source.meterId"
                placeholder="选择计量点"
                style="width: 200px"
                @change="handleSourceMeterChange(index, $event)"
              >
                <ElOption v-for="meter in sourceMeters" :key="meter.id" :label="meter.name" :value="meter.id" />
              </ElSelect>
              <ElInputNumber
                v-model="source.coefficient"
                :min="0"
                :step="0.1"
                :precision="2"
                placeholder="系数"
                style="width: 100px"
                @change="generateFormula"
              />
              <ElButton type="danger" size="small" @click="removeSourceMeter(index)">
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </div>
          </div>
        </div>
      </ElFormItem>

      <!-- 计算公式 -->
      <ElFormItem label="计算公式" prop="formula">
        <div class="w-full">
          <ElTabs v-model="editorMode" type="border-card" class="formula-tabs">
            <ElTabPane label="文本编辑" name="text">
              <ElInput
                v-model="formData.formula"
                placeholder="自动生成或手动输入公式"
                :disabled="formData.calculateType !== 'custom'"
              />
              <div class="mt-8px flex gap-8px">
                <ElButton size="small" :disabled="formData.sourceConfig.length === 0" @click="generateFormula">
                  重新生成
                </ElButton>
                <ElButton size="small" type="primary" :loading="validating" @click="validateFormula">验证公式</ElButton>
              </div>
              <div v-if="formulaValid !== null" class="mt-4px">
                <span :class="formulaValid ? 'text-success' : 'text-danger'">
                  {{ formulaValid ? '✓ 公式有效' : '✗ 公式无效' }}
                </span>
              </div>
            </ElTabPane>
            <ElTabPane label="可视化编辑" name="visual">
              <FormulaVisualEditor
                :source-config="formData.sourceConfig"
                :calculate-type="formData.calculateType"
                :formula="formData.formula"
                @update:formula="formData.formula = $event"
              />
            </ElTabPane>
          </ElTabs>
        </div>
      </ElFormItem>

      <ElFormItem label="状态">
        <ElRadioGroup v-model="formData.status">
          <ElRadio :label="1">启用</ElRadio>
          <ElRadio :label="2">停用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="描述">
        <ElInput v-model="formData.description" type="textarea" rows="3" placeholder="请输入描述" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace>
        <ElButton @click="visible = false">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped>
.source-item {
  padding: 8px;
  margin-bottom: 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.source-order {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary);
  color: white;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}

.formula-tabs {
  margin-top: 8px;
}

.formula-tabs :deep(.el-tabs__content) {
  padding: 12px;
}
</style>
