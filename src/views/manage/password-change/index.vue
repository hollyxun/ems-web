<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { fetchGetPasswordStatus, fetchSecurityChangePassword } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'PasswordChange' });

const { routerBack, toLogin } = useRouterPush();
const authStore = useAuthStore();
const { formRef, validate } = useForm();

interface FormModel {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const model = ref<FormModel>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const loading = ref(false);
const passwordStatus = ref<Api.Auth.PasswordStatus | null>(null);
const isForceChange = ref(false);

type RuleRecord = Partial<Record<keyof FormModel, App.Global.FormRule[]>>;

const rules = computed<RuleRecord>(() => {
  const { formRules, createConfirmPwdRule } = useFormRules();

  const baseRules: RuleRecord = {
    newPassword: formRules.pwd,
    confirmPassword: createConfirmPwdRule(model.value.newPassword)
  };

  // 强制修改模式下不需要旧密码
  if (!isForceChange.value) {
    baseRules.oldPassword = [{ required: true, message: '请输入原密码' }];
  }

  return baseRules;
});

// 密码状态提示
const passwordHint = computed(() => {
  if (!passwordStatus.value) return '';

  if (passwordStatus.value.expired) {
    return '您的密码已过期，必须修改后才能继续使用系统。';
  }

  if (passwordStatus.value.warning) {
    return `您的密码将在 ${passwordStatus.value.daysRemaining} 天后过期，建议尽快修改。`;
  }

  return '';
});

// 获取密码状态
async function getPasswordStatus() {
  const { data, error } = await fetchGetPasswordStatus();
  if (!error && data) {
    passwordStatus.value = data;
    isForceChange.value = data.forceChange || data.expired;
  }
}

// 提交修改
async function handleSubmit() {
  await validate();
  loading.value = true;

  try {
    const params: Api.Auth.SecurityChangePasswordParams = {
      newPassword: model.value.newPassword
    };

    // 非强制修改模式下需要旧密码
    if (!isForceChange.value) {
      params.oldPassword = model.value.oldPassword;
    }

    const { error } = await fetchSecurityChangePassword(params);

    if (!error) {
      window.$message?.success('密码修改成功');

      // 强制修改模式下，修改成功后重新登录
      if (isForceChange.value) {
        await authStore.logout();
        ElMessageBox.alert('密码已修改，请使用新密码重新登录', '提示', {
          confirmButtonText: '重新登录',
          callback: () => {
            toLogin();
          }
        });
      } else {
        // 非强制修改，返回上一页
        routerBack();
      }
    }
  } finally {
    loading.value = false;
  }
}

// 返回
function handleBack() {
  routerBack();
}

onMounted(() => {
  getPasswordStatus();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden">
    <ElCard class="card-wrapper">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ isForceChange ? '强制修改密码' : '修改密码' }}</p>
        </div>
      </template>

      <div class="mx-auto max-w-500px pt-20px">
        <!-- 密码状态提示 -->
        <ElAlert
          v-if="passwordHint"
          :title="passwordHint"
          :type="isForceChange ? 'error' : 'warning'"
          class="mb-24px"
          show-icon
          :closable="false"
        />

        <!-- 强制修改提示 -->
        <div v-if="isForceChange" class="mb-24px text-center">
          <div class="i-icon-park-outline:lock mb-12px text-48px text-primary"></div>
          <p class="text-16px text-gray-600">为了账户安全，请修改您的密码</p>
        </div>

        <ElForm
          ref="formRef"
          :model="model"
          :rules="rules"
          size="large"
          :show-label="true"
          label-width="100px"
          label-position="left"
        >
          <!-- 非强制修改时显示旧密码 -->
          <ElFormItem v-if="!isForceChange" prop="oldPassword" label="原密码">
            <ElInput v-model="model.oldPassword" type="password" show-password-on="click" placeholder="请输入原密码" />
          </ElFormItem>

          <ElFormItem prop="newPassword" label="新密码">
            <ElInput
              v-model="model.newPassword"
              type="password"
              show-password-on="click"
              placeholder="请输入新密码（至少8位）"
            />
          </ElFormItem>

          <ElFormItem prop="confirmPassword" label="确认密码">
            <ElInput
              v-model="model.confirmPassword"
              type="password"
              show-password-on="click"
              placeholder="请再次输入新密码"
            />
          </ElFormItem>

          <!-- 密码历史提示 -->
          <div class="mb-24px pl-100px text-12px text-gray-500">
            <p>* 新密码不能与最近5次使用过的密码相同</p>
            <p>* 建议使用字母、数字、特殊字符组合</p>
          </div>

          <ElFormItem class="pl-100px">
            <ElSpace :size="16">
              <ElButton type="primary" :loading="loading" @click="handleSubmit">
                {{ $t('common.confirm') }}
              </ElButton>
              <ElButton v-if="!isForceChange" @click="handleBack">
                {{ $t('common.cancel') }}
              </ElButton>
            </ElSpace>
          </ElFormItem>
        </ElForm>
      </div>
    </ElCard>
  </div>
</template>

<style scoped></style>
