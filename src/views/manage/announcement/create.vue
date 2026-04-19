<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import WangEditor from 'wangeditor';
import {
  fetchCreateAnnouncement,
  fetchGetAnnouncementDetail,
  fetchPublishAnnouncement,
  fetchWithdrawAnnouncement
} from '@/service/api/announcement';
import { useRouterPush } from '@/hooks/common/router';

defineOptions({ name: 'AnnouncementCreate' });

const { routerPushByKey, routerBack } = useRouterPush();

const loading = ref(false);
const isEdit = ref(false);
const announcementId = ref(0);
const editor = ref<WangEditor>();
const editorDomRef = ref<HTMLElement>();

// 表单数据
const form = ref({
  title: '',
  content: '',
  priority: 1 as Api.Announcement.Priority,
  expire_at: ''
});

// 优先级选项
const priorityOptions = [
  { value: 1, label: '普通' },
  { value: 2, label: '重要' },
  { value: 3, label: '紧急' }
];

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

  // 图片上传配置（使用项目现有的上传接口）
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

  // 如果是编辑模式，设置内容
  if (isEdit.value && form.value.content) {
    editor.value.txt.html(form.value.content);
  }
}

// 加载公告详情（编辑模式）
async function loadDetail() {
  if (!announcementId.value) return;

  loading.value = true;
  const { data } = await fetchGetAnnouncementDetail(announcementId.value);
  if (data) {
    form.value.title = data.announcement.title;
    form.value.content = data.announcement.content;
    form.value.priority = data.announcement.priority;
    form.value.expire_at = data.announcement.expire_at || '';

    // 设置编辑器内容
    if (editor.value && form.value.content) {
      editor.value.txt.html(form.value.content);
    }
  }
  loading.value = false;
}

// 保存草稿
async function handleSaveDraft() {
  if (!form.value.title) {
    ElMessage.warning('请输入公告标题');
    return;
  }

  loading.value = true;
  const { error } = await fetchCreateAnnouncement({
    title: form.value.title,
    content: form.value.content,
    priority: form.value.priority,
    expire_at: form.value.expire_at || undefined
  });
  loading.value = false;

  if (!error) {
    ElMessage.success('保存草稿成功');
    routerPushByKey('manage_announcement');
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
  const { data: createData, error: createError } = await fetchCreateAnnouncement({
    title: form.value.title,
    content: form.value.content,
    priority: form.value.priority,
    expire_at: form.value.expire_at || undefined
  });

  if (createError || !createData) {
    loading.value = false;
    ElMessage.error('创建失败');
    return;
  }

  // 再发布
  const { error: publishError } = await fetchPublishAnnouncement(createData.id);
  loading.value = false;

  if (!publishError) {
    ElMessage.success('发布成功');
    routerPushByKey('manage_announcement');
  }
}

// 返回列表
function handleBack() {
  routerBack();
}

// 检查是否是编辑模式
function checkEditMode() {
  const idParam = new URLSearchParams(window.location.search).get('id');
  if (idParam) {
    isEdit.value = true;
    announcementId.value = Number(idParam);
  }
}

onMounted(() => {
  checkEditMode();
  initEditor();
  if (isEdit.value) {
    loadDetail();
  }
});

onUnmounted(() => {
  // 销毁编辑器
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<template>
  <div class="h-full flex flex-col gap-4 p-4">
    <!-- 标题区 -->
    <ElCard>
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
        <ElFormItem label="过期时间">
          <ElDatePicker
            v-model="form.expire_at"
            type="datetime"
            placeholder="选择过期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 内容编辑区 -->
    <ElCard header="公告内容">
      <div ref="editorDomRef" class="bg-white"></div>
    </ElCard>

    <!-- 操作区 -->
    <ElCard>
      <ElSpace>
        <ElButton @click="handleBack">返回</ElButton>
        <ElButton type="info" :loading="loading" @click="handleSaveDraft">保存草稿</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSaveAndPublish">保存并发布</ElButton>
      </ElSpace>
    </ElCard>
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
