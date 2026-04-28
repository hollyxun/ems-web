<script setup lang="ts">
import { computed } from 'vue';
import { ElButton, ElDialog, ElIcon, ElTag } from 'element-plus';
import type { UploadFile } from 'element-plus';
import { Document as ElIconDocument } from '@element-plus/icons-vue';

defineOptions({ name: 'AnnouncementPreviewDialog' });

const props = defineProps<{
  visible: boolean;
  title: string;
  content: string;
  priority: Api.Announcement.Priority;
  categoryName: string;
  targetType: Api.Announcement.TargetType;
  expireAt: string;
  pendingFiles: UploadFile[];
  targetUserCount: number;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

// 优先级映射
const priorityMap: Record<number, { type: 'info' | 'warning' | 'danger'; label: string }> = {
  1: { type: 'info', label: '普通' },
  2: { type: 'warning', label: '重要' },
  3: { type: 'danger', label: '紧急' }
};

// 发送范围映射
const targetTypeMap: Record<number, string> = {
  1: '全员',
  2: '指定角色',
  3: '指定用户',
  4: '指定组织'
};

function getPriorityInfo(priority: Api.Announcement.Priority) {
  return priorityMap[priority] || { type: 'info' as const, label: '普通' };
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 关闭弹窗
function handleClose() {
  emit('close');
}

// 确认发布
function handleConfirm() {
  emit('confirm');
}

// 计算发送范围描述
const targetDescription = computed(() => {
  if (props.targetType === 1) {
    return '将发送给全体员工';
  }
  return `将发送给 ${props.targetUserCount} 人`;
});
</script>

<template>
  <ElDialog :model-value="visible" title="发布预览" width="800px" :close-on-click-modal="false" @close="handleClose">
    <div class="preview-container flex gap-6">
      <!-- 左侧：公告信息摘要 -->
      <div class="info-section w-1/3 flex flex-col gap-4">
        <div class="info-item">
          <div class="label mb-1 text-sm text-gray-500">公告标题</div>
          <div class="value font-medium">{{ title || '（未填写）' }}</div>
        </div>

        <div class="info-item">
          <div class="label mb-1 text-sm text-gray-500">优先级</div>
          <ElTag :type="getPriorityInfo(priority).type" size="small">
            {{ getPriorityInfo(priority).label }}
          </ElTag>
        </div>

        <div class="info-item">
          <div class="label mb-1 text-sm text-gray-500">分类</div>
          <div class="value">{{ categoryName || '未选择分类' }}</div>
        </div>

        <div class="info-item">
          <div class="label mb-1 text-sm text-gray-500">发送范围</div>
          <div class="value">
            <div class="mb-1">{{ targetTypeMap[targetType] }}</div>
            <div v-if="targetType !== 1" class="text-sm text-primary">
              {{ targetDescription }}
            </div>
            <div v-else class="text-sm text-gray-500">{{ targetDescription }}</div>
          </div>
        </div>

        <div class="info-item">
          <div class="label mb-1 text-sm text-gray-500">过期时间</div>
          <div class="value">{{ expireAt || '不设置过期时间' }}</div>
        </div>

        <div v-if="pendingFiles.length > 0" class="info-item">
          <div class="label mb-1 text-sm text-gray-500">附件（{{ pendingFiles.length }}个）</div>
          <div class="attachments-list flex flex-col gap-2">
            <div v-for="file in pendingFiles" :key="file.uid" class="attachment-item flex items-center gap-2 text-sm">
              <ElIcon size="16"><ElIconDocument /></ElIcon>
              <span class="truncate">{{ file.name }}</span>
              <span v-if="file.size" class="text-gray-400">{{ formatFileSize(file.size) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：富文本内容预览 -->
      <div class="content-section w-2/3 border-l border-gray-200 pl-6">
        <div class="label mb-2 text-sm text-gray-500">公告内容预览</div>
        <div class="preview-content prose max-h-400px max-w-none overflow-auto">
          <div v-if="content" class="announcement-content" v-html="content"></div>
          <div v-else class="text-gray-400 italic">（未填写内容）</div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" @click="handleConfirm">确认发布</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.preview-container {
  min-height: 300px;
}

.info-item {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-item:last-child {
  border-bottom: none;
}

.preview-content {
  background: var(--el-fill-color-lighter);
  padding: 16px;
  border-radius: 8px;
  min-height: 200px;
}

/* WangEditor 富文本样式（与详情页一致） */
.announcement-content :deep(h1) {
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0 8px;
}

.announcement-content :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  margin: 14px 0 6px;
}

.announcement-content :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 4px;
}

.announcement-content :deep(p) {
  margin: 8px 0;
}

.announcement-content :deep(ul),
.announcement-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.announcement-content :deep(li) {
  margin: 4px 0;
}

.announcement-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.announcement-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.announcement-content :deep(th),
.announcement-content :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 8px 12px;
}

.announcement-content :deep(th) {
  background: var(--el-fill-color-light);
  font-weight: 600;
}

.announcement-content :deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

.announcement-content :deep(a:hover) {
  text-decoration: underline;
}

.announcement-content :deep(code) {
  background: var(--el-fill-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.announcement-content :deep(pre) {
  background: var(--el-fill-color);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.announcement-content :deep(blockquote) {
  border-left: 4px solid var(--el-border-color);
  padding-left: 16px;
  margin: 12px 0;
  color: var(--el-text-color-secondary);
}
</style>
