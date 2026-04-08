<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { loginModuleRecord } from '@/constants/app';
import { SecurityErrorCode } from '@/constants/security-errors';
import { fetchGetCaptcha } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'PwdLogin' });

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useForm();

interface FormModel {
  userName: string;
  password: string;
  captcha: string;
}

const model = ref<FormModel>({
  userName: 'admin',
  password: '12345678',
  captcha: ''
});

// 登录错误状态
const loginError = ref('');
const isLocked = ref(false);
const isPasswordError = ref(false);
const lockRemainingMinutes = ref(0);
const remainingAttempts = ref(0);

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();

  return {
    userName: formRules.userName,
    password: formRules.pwd,
    captcha: [{ required: true, message: $t('page.login.common.captchaPlaceholder') }]
  };
});

// 验证码相关
const captchaId = ref('');
const captchaImage = ref('');
const captchaLoading = ref(false);

async function getCaptcha() {
  captchaLoading.value = true;
  try {
    const { data, error } = await fetchGetCaptcha();
    if (!error && data) {
      captchaId.value = data.captchaId;
      captchaImage.value = data.captchaImage;
    }
  } finally {
    captchaLoading.value = false;
  }
}

async function handleSubmit() {
  await validate();
  clearErrorState();

  const result = await authStore.login(
    model.value.userName,
    model.value.password,
    model.value.captcha,
    captchaId.value
  );

  // 登录失败时根据错误码处理
  if (result) {
    model.value.captcha = '';
    handleLoginError(result.code, result.message, result.data);
    await getCaptcha();
  }
}

/**
 * 根据错误码处理登录错误
 */
function handleLoginError(code: number, message: string, data?: Record<string, unknown>) {
  switch (code) {
    case SecurityErrorCode.USER_LOCKED:
      isLocked.value = true;
      lockRemainingMinutes.value = (data?.remainingMinutes as number) ?? 30;
      loginError.value = message;
      break;

    case SecurityErrorCode.PASSWORD_INCORRECT:
      isPasswordError.value = true;
      remainingAttempts.value = (data?.remainingAttempts as number) ?? 0;
      loginError.value = remainingAttempts.value > 0 ? `密码错误，还剩 ${remainingAttempts.value} 次尝试机会` : message;
      break;

    case SecurityErrorCode.PASSWORD_EXPIRED:
      // 密码过期由 authStore 处理跳转
      loginError.value = message;
      break;

    case SecurityErrorCode.USER_DISABLED:
      loginError.value = '您的账户已被禁用，请联系管理员';
      break;

    case SecurityErrorCode.CAPTCHA_INVALID:
    case SecurityErrorCode.CAPTCHA_EXPIRED:
      loginError.value = '验证码错误或已过期';
      break;

    case SecurityErrorCode.USER_NOT_FOUND:
      loginError.value = '用户不存在';
      break;

    default:
      loginError.value = message || '登录失败';
  }
}

function clearErrorState() {
  loginError.value = '';
  isLocked.value = false;
  isPasswordError.value = false;
  lockRemainingMinutes.value = 0;
  remainingAttempts.value = 0;
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha();
});
</script>

<template>
  <ElForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <!-- 密码错误提示 -->
    <ElAlert
      v-if="isPasswordError && loginError"
      :title="loginError"
      type="error"
      class="mb-16px"
      show-icon
      :closable="true"
      @close="loginError = ''"
    />

    <!-- 账户锁定提示 -->
    <ElAlert v-if="isLocked" type="warning" class="mb-16px" :closable="false" show-icon>
      <template #title>
        <span class="font-bold">账户已被锁定</span>
      </template>
      <template #default>
        <p>您的账户因登录失败次数过多已被锁定。</p>
        <p class="mt-4px">
          请等待
          <span class="text-primary font-bold">{{ lockRemainingMinutes }}</span>
          分钟后重试，或联系管理员解锁。
        </p>
      </template>
    </ElAlert>

    <!-- 其他错误提示 -->
    <ElAlert
      v-if="loginError && !isLocked && !isPasswordError"
      :title="loginError"
      type="error"
      class="mb-16px"
      show-icon
      :closable="true"
      @close="loginError = ''"
    />

    <ElFormItem prop="userName">
      <ElInput v-model="model.userName" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </ElFormItem>
    <ElFormItem prop="password">
      <ElInput
        v-model="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </ElFormItem>
    <ElFormItem prop="captcha">
      <div class="w-full flex-y-center gap-12px">
        <ElInput v-model="model.captcha" :placeholder="$t('page.login.common.captchaPlaceholder')" class="flex-1" />
        <div class="h-36px w-100px flex-center cursor-pointer overflow-hidden rd-4px bg-#f5f5f5" @click="getCaptcha">
          <img v-if="captchaImage" :src="captchaImage" alt="captcha" class="h-full w-full object-contain" />
          <span v-else-if="captchaLoading">Loading...</span>
        </div>
      </div>
    </ElFormItem>
    <ElSpace direction="vertical" :size="24" class="w-full" fill>
      <div class="flex-y-center justify-between">
        <ElCheckbox>{{ $t('page.login.pwdLogin.rememberMe') }}</ElCheckbox>
        <ElButton text @click="toggleLoginModule('reset-pwd')">
          {{ $t('page.login.pwdLogin.forgetPassword') }}
        </ElButton>
      </div>
      <ElButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </ElButton>
      <div class="flex-y-center justify-between gap-12px">
        <ElButton class="flex-1" size="default" @click="toggleLoginModule('code-login')">
          {{ $t(loginModuleRecord['code-login']) }}
        </ElButton>
        <ElButton class="flex-1" size="default" @click="toggleLoginModule('register')">
          {{ $t(loginModuleRecord.register) }}
        </ElButton>
      </div>
    </ElSpace>
  </ElForm>
</template>

<style scoped></style>
