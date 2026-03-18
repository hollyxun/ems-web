<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchGetUserInfo, fetchUpdateUserInfo } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';

defineOptions({ name: 'ProfileInfo' });

const authStore = useAuthStore();
const loading = ref(false);
const saveLoading = ref(false);
const formRef = ref();

// 用户信息表单
const userForm = ref({
  id: 0,
  uuid: '',
  username: '',
  nickName: '',
  headerImg: '',
  phone: '',
  email: '',
  department: null as any,
  roles: [] as any[]
});

// 获取用户信息
async function getUserInfo() {
  loading.value = true;
  try {
    const { data, error } = await fetchGetUserInfo();
    if (!error && data) {
      userForm.value = { ...data } as any;
    }
  } finally {
    loading.value = false;
  }
}

// 保存用户信息
async function saveUserInfo() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  saveLoading.value = true;
  try {
    const { error } = await fetchUpdateUserInfo({
      nickName: userForm.value.nickName,
      headerImg: userForm.value.headerImg,
      phone: userForm.value.phone,
      email: userForm.value.email
    });

    if (!error) {
      ElMessage.success($t('common.modifySuccess'));
      // 更新store中的用户信息
      authStore.userInfo.nickName = userForm.value.nickName;
      authStore.userInfo.headerImg = userForm.value.headerImg;
    } else {
      ElMessage.error($t('common.error'));
    }
  } finally {
    saveLoading.value = false;
  }
}

// 头像上传
function handleAvatarUpload() {
  ElMessageBox.prompt($t('page.profile.info.changeAvatar'), $t('common.modify'), {
    confirmButtonText: $t('common.confirm'),
    cancelButtonText: $t('common.cancel'),
    inputValue: userForm.value.headerImg || ''
  })
    .then(({ value }) => {
      if (value) {
        userForm.value.headerImg = value;
        ElMessage.success($t('common.modifySuccess'));
      }
    })
    .catch(() => {});
}

// 表单校验规则
const rules = {
  nickName: [{ required: true, message: () => $t('form.required'), trigger: 'blur' }]
};

onMounted(() => {
  getUserInfo();
});
</script>

<template>
  <div class="h-full overflow-auto p-4">
    <ElCard class="mx-auto max-w-5xl" shadow="hover">
      <template #header>
        <div class="flex items-center gap-2">
          <SvgIcon icon="carbon:user-profile" class="text-xl text-primary" />
          <span class="text-lg font-medium">{{ $t('page.profile.info.title') }}</span>
        </div>
      </template>

      <ElSkeleton :loading="loading" animated :rows="8">
        <ElForm ref="formRef" :model="userForm" :rules="rules" label-width="100px" class="p-4">
          <!-- 顶部区域：头像和基本信息 -->
          <div class="mb-6 flex flex-col gap-8 lg:flex-row">
            <!-- 头像区域 -->
            <div class="flex flex-col items-center gap-3 px-8">
              <ElAvatar
                :src="userForm.headerImg || 'https://picsum.photos/200'"
                :size="120"
                class="border-4 border-gray-100 shadow-md"
              />
              <ElButton type="primary" link size="small" @click="handleAvatarUpload">
                <SvgIcon icon="carbon:camera" class="mr-1" />
                {{ $t('page.profile.info.changeAvatar') }}
              </ElButton>
            </div>

            <!-- 基本信息区域 -->
            <div class="flex-1">
              <div class="mb-4 flex items-center gap-2 text-base text-gray-700 font-medium dark:text-gray-300">
                <SvgIcon icon="carbon:information" />
                <span>{{ $t('page.profile.info.basicInfo') }}</span>
              </div>
              <ElRow :gutter="20">
                <ElCol :xs="24" :sm="12" :md="12" :lg="12">
                  <ElFormItem :label="$t('page.profile.info.userId')">
                    <ElInput v-model="userForm.uuid" disabled>
                      <template #prefix>
                        <SvgIcon icon="carbon:fingerprint-recognition" class="text-gray-400" />
                      </template>
                    </ElInput>
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :sm="12" :md="12" :lg="12">
                  <ElFormItem :label="$t('page.profile.info.username')">
                    <ElInput v-model="userForm.username" disabled>
                      <template #prefix>
                        <SvgIcon icon="carbon:user" class="text-gray-400" />
                      </template>
                    </ElInput>
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :sm="12" :md="12" :lg="12">
                  <ElFormItem :label="$t('page.profile.info.department')">
                    <ElInput :value="userForm.department?.name || $t('page.profile.info.noDepartment')" disabled>
                      <template #prefix>
                        <SvgIcon icon="carbon:building" class="text-gray-400" />
                      </template>
                    </ElInput>
                  </ElFormItem>
                </ElCol>
                <ElCol :xs="24" :sm="12" :md="12" :lg="12">
                  <ElFormItem :label="$t('page.profile.info.roles')">
                    <ElInput
                      :value="userForm.roles?.map(r => r.authorityName).join(', ') || $t('page.profile.info.noRole')"
                      disabled
                    >
                      <template #prefix>
                        <SvgIcon icon="carbon:user-role" class="text-gray-400" />
                      </template>
                    </ElInput>
                  </ElFormItem>
                </ElCol>
              </ElRow>
            </div>
          </div>

          <!-- 分割线 -->
          <ElDivider>
            <div class="flex items-center gap-2 text-gray-500">
              <SvgIcon icon="carbon:edit" />
              <span>{{ $t('page.profile.info.editableInfo') }}</span>
            </div>
          </ElDivider>

          <!-- 可编辑信息区域 -->
          <div class="mt-6">
            <ElRow :gutter="20">
              <ElCol :xs="24" :sm="12" :md="12" :lg="12">
                <ElFormItem :label="$t('page.profile.info.nickName')" prop="nickName" required>
                  <ElInput
                    v-model="userForm.nickName"
                    :placeholder="$t('page.profile.info.nickNamePlaceholder')"
                    maxlength="64"
                    show-word-limit
                  >
                    <template #prefix>
                      <SvgIcon icon="carbon:user-avatar" class="text-gray-400" />
                    </template>
                  </ElInput>
                </ElFormItem>
              </ElCol>
              <ElCol :xs="24" :sm="12" :md="12" :lg="12">
                <ElFormItem :label="$t('page.profile.info.phone')">
                  <ElInput
                    v-model="userForm.phone"
                    :placeholder="$t('page.profile.info.phonePlaceholder')"
                    maxlength="11"
                  >
                    <template #prefix>
                      <SvgIcon icon="carbon:phone" class="text-gray-400" />
                    </template>
                  </ElInput>
                </ElFormItem>
              </ElCol>
              <ElCol :xs="24" :sm="24" :md="24" :lg="24">
                <ElFormItem :label="$t('page.profile.info.email')">
                  <ElInput
                    v-model="userForm.email"
                    :placeholder="$t('page.profile.info.emailPlaceholder')"
                    maxlength="64"
                  >
                    <template #prefix>
                      <SvgIcon icon="carbon:email" class="text-gray-400" />
                    </template>
                  </ElInput>
                </ElFormItem>
              </ElCol>
            </ElRow>
          </div>

          <!-- 操作按钮 -->
          <div class="mt-8 flex justify-center border-t border-gray-100 pt-4 dark:border-gray-700">
            <ElButton type="primary" size="large" :loading="saveLoading" @click="saveUserInfo">
              <template #icon>
                <SvgIcon icon="carbon:save" />
              </template>
              {{ $t('common.save') }}
            </ElButton>
          </div>
        </ElForm>
      </ElSkeleton>
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
