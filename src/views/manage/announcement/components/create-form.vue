<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { ElMessage, ElUpload } from 'element-plus';
import type { UploadFile } from 'element-plus';
import WangEditor from 'wangeditor';
import {
  fetchCreateAnnouncement,
  fetchGetAllAnnouncementCategories,
  fetchPreviewTargetCount,
  fetchPublishAnnouncement,
  fetchUploadAnnouncementAttachment
} from '@/service/api/announcement';
import { fetchGetAllRoles, fetchGetUserList } from '@/service/api/system-manage';
import { fetchOrganizationList } from '@/service/api/organization';
import AnnouncementPreviewDialog from './preview-dialog.vue';

defineOptions({ name: 'AnnouncementCreateForm' });

const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

const loading = ref(false);
const editor = ref<WangEditor>();
const editorDomRef = ref<HTMLElement>();

// 预览弹窗状态
const showPreview = ref(false);
const targetUserCount = ref(0);

// 表单数据
const form = ref({
  title: '',
  content: '',
  priority: 1 as Api.Announcement.Priority,
  category_id: null as number | null,
  target_type: 1 as Api.Announcement.TargetType,
  target_ids: [] as number[],
  expire_at: ''
});

// 分类列表
const categories = ref<Api.Announcement.Category[]>([]);

// 目标选择相关
const roles = ref<{ id: number; name: string }[]>([]);
const organizations = ref<{ id: number; name: string }[]>([]);
const users = ref<{ id: number; name: string }[]>([]);

// 附件列表（暂存）
const pendingFiles = ref<UploadFile[]>([]);
const announcementId = ref<number>(0);

// 优先级选项
const priorityOptions = [
  { value: 1, label: '普通' },
  { value: 2, label: '重要' },
  { value: 3, label: '紧急' }
];

// 发送目标类型选项
const targetTypeOptions = [
  { value: 1, label: '全员' },
  { value: 2, label: '指定角色' },
  { value: 3, label: '指定用户' },
  { value: 4, label: '指定组织' }
];

// 计算分类名称
const categoryName = computed(() => {
  if (!form.value.category_id) return '';
  const cat = categories.value.find(c => c.id === form.value.category_id);
  return cat?.name || '';
});

// 打开预览
async function handlePreview() {
  if (!form.value.title) {
    ElMessage.warning('请输入公告标题');
    return;
  }
  if (!form.value.content) {
    ElMessage.warning('请输入公告内容');
    return;
  }

  // 从后端获取真实的目标用户数量
  if (form.value.target_type !== 1) {
    const targetIdsJson = JSON.stringify(form.value.target_ids);
    const { data, error } = await fetchPreviewTargetCount(form.value.target_type, targetIdsJson);
    if (!error && data) {
      targetUserCount.value = data.count;
    } else {
      targetUserCount.value = form.value.target_ids.length;
    }
  } else {
    // 全员发送，从后端获取用户总数
    const { data, error } = await fetchPreviewTargetCount(1, '');
    if (!error && data) {
      targetUserCount.value = data.count;
    } else {
      targetUserCount.value = users.value.length;
    }
  }

  showPreview.value = true;
}

// 关闭预览
function handlePreviewClose() {
  showPreview.value = false;
}

// 预览确认后发布
async function handlePreviewConfirm() {
  showPreview.value = false;
  await handleSaveAndPublish();
}

// 监听目标类型变化，清空已选目标
watch(
  () => form.value.target_type,
  () => {
    form.value.target_ids = [];
  }
);

// 初始化编辑器
function initEditor() {
  if (!editorDomRef.value) return;

  editor.value = new WangEditor(editorDomRef.value);

  // 配置编辑器
  editor.value.config.zIndex = 100;
  editor.value.config.height = 300;

  // 自定义菜单
  editor.value.config.menus = [
    'head',
    'bold',
    'italic',
    'underline',
    'strikeThrough',
    'fontSize',
    'fontName',
    'foreColor',
    'backColor',
    'link',
    'list',
    'justify',
    'quote',
    'emoticon',
    'image',
    'table',
    'code',
    'undo',
    'redo'
  ];

  // 图片上传配置
  editor.value.config.uploadImgServer = '/api/v1/file/upload';
  editor.value.config.uploadImgHeaders = {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  };
  editor.value.config.uploadFileName = 'file';
  editor.value.config.uploadImgMaxSize = 5 * 1024 * 1024; // 5MB

  // 内容变化回调
  editor.value.config.onchange = (html: string) => {
    form.value.content = html;
  };

  // XSS 过滤
  editor.value.config.pasteFilterStyle = true;

  editor.value.create();
}

// 文件选择处理
function handleFileChange(file: UploadFile, fileList: UploadFile[]) {
  pendingFiles.value = fileList;
}

// 文件移除处理
function handleFileRemove(file: UploadFile, fileList: UploadFile[]) {
  pendingFiles.value = fileList;
}

// 文件大小限制检查
function beforeUpload(file: File): boolean {
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB');
    return false;
  }
  return true;
}

// 上传附件到公告
async function uploadAttachments(id: number) {
  const uploadPromises = pendingFiles.value
    .filter(file => file.raw)
    .map(file => fetchUploadAnnouncementAttachment(id, file.raw!));

  const results = await Promise.allSettled(uploadPromises);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const file = pendingFiles.value.filter(f => f.raw)[index];
      ElMessage.warning(`附件 ${file?.name} 上传失败`);
    }
  });
}

// 保存草稿
async function handleSaveDraft() {
  if (!form.value.title) {
    ElMessage.warning('请输入公告标题');
    return;
  }

  loading.value = true;
  const targetIdsJson = form.value.target_type === 1 ? '' : JSON.stringify(form.value.target_ids);
  const { data, error } = await fetchCreateAnnouncement({
    title: form.value.title,
    content: form.value.content,
    priority: form.value.priority,
    category_id: form.value.category_id,
    target_type: form.value.target_type,
    target_ids: targetIdsJson,
    expire_at: form.value.expire_at || undefined
  });

  if (!error && data) {
    announcementId.value = data.id;
    // 上传附件
    await uploadAttachments(data.id);
    ElMessage.success('保存草稿成功');
    loading.value = false;
    emit('success');
  } else {
    loading.value = false;
    ElMessage.error('创建失败');
  }
}

// 保存并发布
async function handleSaveAndPublish() {
  if (!form.value.title) {
    ElMessage.warning('请输入公告标题');
    return;
  }
  if (!form.value.content) {
    ElMessage.warning('请输入公告内容');
    return;
  }

  loading.value = true;

  // 先创建
  const targetIdsJson = form.value.target_type === 1 ? '' : JSON.stringify(form.value.target_ids);
  const { data: createData, error: createError } = await fetchCreateAnnouncement({
    title: form.value.title,
    content: form.value.content,
    priority: form.value.priority,
    category_id: form.value.category_id,
    target_type: form.value.target_type,
    target_ids: targetIdsJson,
    expire_at: form.value.expire_at || undefined
  });

  if (createError || !createData) {
    loading.value = false;
    ElMessage.error('创建失败');
    return;
  }

  announcementId.value = createData.id;

  // 上传附件
  await uploadAttachments(createData.id);

  // 再发布
  const { error: publishError } = await fetchPublishAnnouncement(createData.id);
  loading.value = false;

  if (!publishError) {
    ElMessage.success('发布成功');
    emit('success');
  }
}

// 取消
function handleCancel() {
  emit('cancel');
}

// 加载分类列表
async function loadCategories() {
  const { data, error } = await fetchGetAllAnnouncementCategories();
  if (!error && data) {
    categories.value = data;
  }
}

// 加载角色列表
async function loadRoles() {
  const { data, error } = await fetchGetAllRoles();
  if (!error && data) {
    roles.value = data.map(r => ({ id: r.id, name: r.roleName || r.authorityName || '' }));
  }
}

// 加载组织列表
async function loadOrganizations() {
  const { data, error } = await fetchOrganizationList({ page: 1, pageSize: 1000 });
  if (!error && data) {
    organizations.value = (data.list || []).map(o => ({ id: o.id, name: o.name }));
  }
}

// 加载用户列表
async function loadUsers() {
  const { data, error } = await fetchGetUserList({ page: 1, pageSize: 1000 });
  if (!error && data) {
    users.value = (data.list || []).map(u => ({ id: u.id, name: u.nickName || u.username || '' }));
  }
}

onMounted(() => {
  initEditor();
  loadCategories();
  loadRoles();
  loadOrganizations();
  loadUsers();
});

onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 表单 -->
    <ElForm label-width="80px">
      <ElFormItem label="公告标题" required>
        <ElInput v-model="form.title" placeholder="请输入公告标题（最多200字）" maxlength="200" show-word-limit />
      </ElFormItem>
      <ElFormItem label="优先级">
        <ElRadioGroup v-model="form.priority">
          <ElRadio v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="分类">
        <ElSelect v-model="form.category_id" placeholder="选择分类" clearable class="w-full">
          <ElOption v-for="cat in categories" :key="cat.id" :value="cat.id" :label="cat.name" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="发送范围">
        <ElRadioGroup v-model="form.target_type">
          <ElRadio v-for="opt in targetTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem v-if="form.target_type === 2" label="选择角色">
        <ElSelect v-model="form.target_ids" multiple placeholder="选择角色" class="w-full">
          <ElOption v-for="role in roles" :key="role.id" :value="role.id" :label="role.name" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem v-if="form.target_type === 4" label="选择组织">
        <ElSelect v-model="form.target_ids" multiple placeholder="选择组织" class="w-full">
          <ElOption v-for="org in organizations" :key="org.id" :value="org.id" :label="org.name" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem v-if="form.target_type === 3" label="选择用户">
        <ElSelect v-model="form.target_ids" multiple filterable placeholder="搜索并选择用户" class="w-full">
          <ElOption v-for="user in users" :key="user.id" :value="user.id" :label="user.name" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="过期时间">
        <ElDatePicker
          v-model="form.expire_at"
          type="datetime"
          placeholder="选择过期时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </ElFormItem>
      <ElFormItem label="公告内容">
        <div ref="editorDomRef" class="w-full bg-white"></div>
      </ElFormItem>
      <ElFormItem label="附件">
        <ElUpload
          v-model:file-list="pendingFiles"
          :auto-upload="false"
          :before-upload="beforeUpload"
          multiple
          :limit="5"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp"
          @change="handleFileChange"
          @remove="handleFileRemove"
        >
          <ElButton type="primary">选择文件</ElButton>
          <template #tip>
            <div class="el-upload__tip">
              支持 PDF、Word、Excel、PPT、TXT、ZIP、RAR、图片格式，单个文件不超过 10MB，最多 5 个文件
            </div>
          </template>
        </ElUpload>
      </ElFormItem>
    </ElForm>

    <!-- 操作按钮 -->
    <div class="flex gap-4">
      <ElButton @click="handleCancel">取消</ElButton>
      <ElButton type="info" :loading="loading" @click="handleSaveDraft">保存草稿</ElButton>
      <ElButton type="warning" :loading="loading" @click="handlePreview">预览</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSaveAndPublish">保存并发布</ElButton>
    </div>

    <!-- 预览弹窗 -->
    <AnnouncementPreviewDialog
      :visible="showPreview"
      :title="form.title"
      :content="form.content"
      :priority="form.priority"
      :category-id="form.category_id"
      :category-name="categoryName"
      :target-type="form.target_type"
      :target-ids="form.target_ids"
      :expire-at="form.expire_at"
      :pending-files="pendingFiles"
      :target-user-count="targetUserCount"
      @close="handlePreviewClose"
      @confirm="handlePreviewConfirm"
    />
  </div>
</template>

<style scoped>
:deep(.w-e-toolbar) {
  background: inherit !important;
  border-color: var(--el-border-color) !important;
}
:deep(.w-e-text-container) {
  background: inherit;
  border-color: var(--el-border-color) !important;
}
</style>
