<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCreatePolicy, fetchUpdatePolicy } from '@/service/api';

defineOptions({ name: 'PolicyOperateDrawer' });

interface Props {
  operateType: 'add' | 'edit';
  rowData?: Api.Casbin.PolicyItem | null;
}

interface Emits {
  (e: 'submitted'): void;
  (e: 'update:visible', visible: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { required: true });

const formModel = reactive<
  Api.Casbin.CreatePolicyRequest & {
    oldSub?: string;
    oldObj?: string;
    oldAct?: string;
    oldEffect?: string;
    oldCtx?: string;
  }
>({
  sub: '',
  obj: '',
  act: '',
  effect: 'allow',
  ctx: ''
});

const rules = {
  sub: [{ required: true, message: '请输入角色ID', trigger: 'blur' }],
  obj: [{ required: true, message: '请输入资源', trigger: 'blur' }],
  act: [{ required: true, message: '请输入操作', trigger: 'blur' }]
};

const title = computed(() => {
  return props.operateType === 'add' ? '新增策略' : '编辑策略';
});

const loading = ref(false);

// 监听 rowData 变化，填充表单
watch(
  () => props.rowData,
  newData => {
    if (newData) {
      formModel.sub = newData.sub;
      formModel.obj = newData.obj;
      formModel.act = newData.act;
      formModel.effect = newData.effect || 'allow';
      formModel.ctx = newData.ctx || '';
      // 保存旧值用于更新
      formModel.oldSub = newData.sub;
      formModel.oldObj = newData.obj;
      formModel.oldAct = newData.act;
      formModel.oldEffect = newData.effect;
      formModel.oldCtx = newData.ctx;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  formModel.sub = '';
  formModel.obj = '';
  formModel.act = '';
  formModel.effect = 'allow';
  formModel.ctx = '';
  formModel.oldSub = '';
  formModel.oldObj = '';
  formModel.oldAct = '';
  formModel.oldEffect = '';
  formModel.oldCtx = '';
}

async function handleSubmit() {
  loading.value = true;
  try {
    let error: any;
    if (props.operateType === 'add') {
      const result = await fetchCreatePolicy({
        sub: formModel.sub,
        obj: formModel.obj,
        act: formModel.act,
        effect: formModel.effect,
        ctx: formModel.ctx || undefined
      });
      error = result.error;
    } else {
      const result = await fetchUpdatePolicy({
        oldSub: formModel.oldSub || '',
        oldObj: formModel.oldObj || '',
        oldAct: formModel.oldAct || '',
        oldEffect: formModel.oldEffect,
        oldCtx: formModel.oldCtx,
        newSub: formModel.sub,
        newObj: formModel.obj,
        newAct: formModel.act,
        newEffect: formModel.effect,
        newCtx: formModel.ctx || undefined
      });
      error = result.error;
    }

    if (!error) {
      ElMessage.success(props.operateType === 'add' ? '新增成功' : '更新成功');
      visible.value = false;
      emit('submitted');
    }
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  visible.value = false;
}
</script>

<template>
  <ElDrawer v-model="visible" :title="title" :size="500" @close="handleClose">
    <ElForm :model="formModel" :rules="rules" label-width="80" label-placement="left">
      <ElFormItem label="角色ID" prop="sub">
        <ElInput v-model="formModel.sub" placeholder="请输入角色ID，如 1、2" />
      </ElFormItem>
      <ElFormItem label="资源" prop="obj">
        <ElInput v-model="formModel.obj" placeholder="请输入资源路径，如 /api/v1/user" />
      </ElFormItem>
      <ElFormItem label="操作" prop="act">
        <ElInput v-model="formModel.act" placeholder="请输入操作，如 GET、POST、*" />
      </ElFormItem>
      <ElFormItem label="效果" prop="effect">
        <ElSelect v-model="formModel.effect" placeholder="请选择效果">
          <ElOption label="允许 (allow)" value="allow" />
          <ElOption label="拒绝 (deny)" value="deny" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="上下文" prop="ctx">
        <ElInput
          v-model="formModel.ctx"
          type="textarea"
          :rows="4"
          placeholder='JSON 格式的扩展权限，如 {&#10; "factoryIds": [1, 2],&#10; "shiftScope": "all"&#10;}'
        />
        <div class="mt-4 text-12px text-gray-500">
          可选字段：factoryIds（工厂ID列表）、shiftScope（班次范围）、operations（操作列表）
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace>
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
