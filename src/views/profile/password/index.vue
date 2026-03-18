<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchChangePassword } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';

defineOptions({ name: 'ProfilePassword' });

const authStore = useAuthStore();
const passwordLoading = ref(false);
const passwordFormRef = ref();

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单校验规则
const passwordRules = {
  oldPassword: [{ required: true, message: () => $t('form.pwd.required'), trigger: 'blur' }],
  newPassword: [
    { required: true, message: () => $t('form.pwd.required'), trigger: 'blur' },
    { min: 6, message: () => $t('form.pwd.invalid'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: () => $t('form.confirmPwd.required'), trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error($t('form.confirmPwd.invalid')));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 修改密码
async function changePassword() {
  const valid = await passwordFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  passwordLoading.value = true;
  try {
    const { error } = await fetchChangePassword(passwordForm.oldPassword, passwordForm.newPassword);

    if (!error) {
      ElMessage.success($t('page.profile.password.success'));
      // 重置表单
      passwordForm.oldPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
      passwordFormRef.value?.resetFields();

      // 延迟登出
      setTimeout(() => {
        authStore.resetStore();
      }, 1500);
    } else {
      ElMessage.error($t('page.profile.password.error'));
    }
  } finally {
    passwordLoading.value = false;
  }
}
</script>

<template>
  <div class="h-full overflow-auto p-4">
    <ElCard class="mx-auto max-w-2xl" shadow="hover">
      <template #header>
        <div class="flex items-center gap-2">
          <SvgIcon icon="carbon:locked" class="text-xl text-primary" />
          <span class="text-lg font-medium">{{ $t('page.profile.password.title') }}</span>
        </div>
      </template>

      <div class="p-4">
        <ElAlert
          :title="$t('page.profile.password.securityTip')"
          type="warning"
          :description="$t('page.profile.password.securityDesc')"
          show-icon
          :closable="false"
          class="mb-6"
        />

        <ElForm
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="100px"
          class="mx-auto max-w-md"
        >
          <ElFormItem :label="$t('page.profile.password.oldPassword')" prop="oldPassword">
            <ElInput
              v-model="passwordForm.oldPassword"
              type="password"
              :placeholder="$t('page.profile.password.oldPasswordPlaceholder')"
              show-password
            >
              <template #prefix>
                <SvgIcon icon="carbon:password" class="text-gray-400" />
              </template>
            </ElInput>
          </ElFormItem>

          <ElFormItem :label="$t('page.profile.password.newPassword')" prop="newPassword">
            <ElInput
              v-model="passwordForm.newPassword"
              type="password"
              :placeholder="$t('page.profile.password.newPasswordPlaceholder')"
              show-password
            >
              <template #prefix>
                <SvgIcon icon="carbon:new-password" class="text-gray-400" />
              </template>
            </ElInput>
          </ElFormItem>

          <ElFormItem :label="$t('page.profile.password.confirmPassword')" prop="confirmPassword">
            <ElInput
              v-model="passwordForm.confirmPassword"
              type="password"
              :placeholder="$t('page.profile.password.confirmPasswordPlaceholder')"
              show-password
              @keyup.enter="changePassword"
            >
              <template #prefix>
                <SvgIcon icon="carbon:checkmark-outline" class="text-gray-400" />
              </template>
            </ElInput>
          </ElFormItem>

          <div class="mt-8 flex justify-center border-t border-gray-100 pt-4 dark:border-gray-700">
            <ElButton type="primary" size="large" :loading="passwordLoading" @click="changePassword">
              <template #icon>
                <SvgIcon icon="carbon:password" />
              </template>
              {{ $t('page.profile.password.change') }}
            </ElButton>
          </div>
        </ElForm>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

:deep(.el-input__wrapper) {
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}
</style>
