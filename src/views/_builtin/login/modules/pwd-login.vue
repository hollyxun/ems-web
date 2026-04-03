<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { loginModuleRecord } from '@/constants/app';
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

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  // inside computed to make locale ref, if not apply i18n, you can define it without computed
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
  await authStore.login(model.value.userName, model.value.password, model.value.captcha, captchaId.value);
  // 登录失败时（token不存在）自动刷新验证码
  if (!authStore.token) {
    model.value.captcha = '';
    await getCaptcha();
  }
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha();
});
</script>

<template>
  <ElForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
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
