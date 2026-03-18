---
description: "页面开发完整流程：从 API 封装到页面实现的步骤"
triggers:
  - "页面开发"
  - "新建页面"
  - "开发流程"
  - "页面实现"
---

# 页面开发完整流程

## 概述

开发新页面的标准流程，确保代码质量和一致性。

---

## 开发步骤

### Step 1: API 封装

创建 `src/api/[module].ts` 文件，定义所有接口。

```typescript
// api/system/user.ts
import request from '@/service/request'

// 类型定义
export interface UserInfo {
  id: number
  username: string
  nickName: string
  email: string
  status: number
}

export interface UserSearchParams {
  page?: number
  pageSize?: number
  username?: string
  status?: number
}

// API 接口
export function getUserList(params?: UserSearchParams) {
  return request.post<PageResult<UserInfo>>('/user/getUserList', params)
}

export function getUserById(id: number) {
  return request.get<UserInfo>('/user/getUserById', { params: { id } })
}

export function createUser(data: Partial<UserInfo>) {
  return request.post<UserInfo>('/user/createUser', data)
}

export function updateUser(data: Partial<UserInfo>) {
  return request.put<UserInfo>('/user/updateUser', data)
}

export function deleteUser(id: number) {
  return request.delete('/user/deleteUser', { params: { id } })
}
```

---

### Step 2: 创建组合式函数（可选）

如果逻辑较复杂，创建组合式函数。

```typescript
// views/system/user/hooks/useUserTable.ts
import { ref, reactive } from 'vue'
import { getUserList, deleteUser, type UserInfo, type UserSearchParams } from '@/api/system/user'

export function useUserTable() {
  // 状态
  const loading = ref(false)
  const list = ref<UserInfo[]>([])
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })
  const searchForm = reactive<UserSearchParams>({
    username: '',
    status: undefined
  })

  // 方法
  const fetchData = async () => {
    loading.value = true
    try {
      const res = await getUserList({
        ...searchForm,
        page: pagination.page,
        pageSize: pagination.pageSize
      })
      list.value = res.list
      pagination.total = res.total
    } finally {
      loading.value = false
    }
  }

  const handleDelete = async (id: number) => {
    await deleteUser(id)
    ElMessage.success('删除成功')
    fetchData()
  }

  const handleSearch = () => {
    pagination.page = 1
    fetchData()
  }

  const handleReset = () => {
    searchForm.username = ''
    searchForm.status = undefined
    handleSearch()
  }

  return {
    loading,
    list,
    pagination,
    searchForm,
    fetchData,
    handleDelete,
    handleSearch,
    handleReset
  }
}
```

---

### Step 3: 页面组件

创建 `src/views/[page]/index.vue` 文件。

```vue
<template>
  <div class="h-full flex flex-col">
    <!-- 搜索表单 -->
    <el-card class="mb-4">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <template #icon><i class="i-carbon-search" /></template>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <el-button type="primary" @click="handleCreate">
          <template #icon><i class="i-carbon-add" /></template>
          新增用户
        </el-button>
        <el-button @click="fetchData">
          <template #icon><i class="i-carbon-refresh" /></template>
          刷新
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="flex-1">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        border
        highlight-current-row
      >
        <el-table-column type="index" width="50" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickName" label="昵称" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @change="fetchData"
        />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <UserFormDialog
      v-model:visible="dialogVisible"
      :data="currentRow"
      @success="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserTable } from './hooks/useUserTable'
import UserFormDialog from './components/UserFormDialog.vue'

// 表格逻辑
const {
  loading,
  list,
  pagination,
  searchForm,
  fetchData,
  handleDelete,
  handleSearch,
  handleReset
} = useUserTable()

// 弹窗控制
const dialogVisible = ref(false)
const currentRow = ref<UserInfo | undefined>(undefined)

// 创建
const handleCreate = () => {
  currentRow.value = undefined
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: UserInfo) => {
  currentRow.value = row
  dialogVisible.value = true
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>
```

---

### Step 4: 子组件（如需要）

创建 `src/views/[page]/components/` 目录。

```vue
<!-- views/system/user/components/UserFormDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="form.nickName" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="2">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { createUser, updateUser, type UserInfo } from '@/api/system/user'

interface Props {
  visible: boolean
  data?: UserInfo
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEdit = computed(() => !!props.data)

// 表单
const formRef = ref<FormInstance>()
const form = ref<Partial<UserInfo>>({
  username: '',
  nickName: '',
  email: '',
  status: 1
})

// 监听数据变化
watch(() => props.data, (val) => {
  if (val) {
    form.value = { ...val }
  } else {
    form.value = { username: '', nickName: '', email: '', status: 1 }
  }
}, { immediate: true })

// 表单规则
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

// 提交
const submitting = ref(false)
const handleSubmit = async () => {
  await formRef.value?.validate()

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateUser(form.value)
    } else {
      await createUser(form.value)
    }
    ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
    visible.value = false
    emit('success')
  } finally {
    submitting.value = false
  }
}

const handleClosed = () => {
  formRef.value?.resetFields()
}
</script>
```

---

### Step 5: 路由配置

在 `src/router/routes/` 中添加路由。

```typescript
// router/routes/modules/system.ts
import type { RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw[] = [
  {
    path: 'user',
    name: 'User',
    component: () => import('@/views/system/user/index.vue'),
    meta: {
      title: '用户管理',
      icon: 'i-carbon-user',
      keepAlive: true
    }
  }
]

export default systemRoutes
```

---

## 检查清单

开发页面时检查：

- [ ] API 封装完整，类型定义清晰
- [ ] 使用组合式函数提取可复用逻辑
- [ ] 页面组件使用 `<script setup lang="ts">`
- [ ] Props/Emits 使用类型化定义
- [ ] 样式优先使用 UnoCSS
- [ ] 表单有验证规则
- [ ] 操作有确认提示
- [ ] 路由配置正确

---

**最后更新**: 2026-03-18
