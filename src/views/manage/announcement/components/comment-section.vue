<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ElButton, ElInput, ElMessage, ElMessageBox } from 'element-plus';
import { fetchCreateComment, fetchDeleteComment, fetchGetCommentList } from '@/service/api/announcement';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'AnnouncementCommentSection' });

const props = defineProps<{
  announcementId: number;
  published: boolean; // 仅已发布公告可评论
}>();

const authStore = useAuthStore();
const currentUserId = authStore.userInfo?.id;

const comments = ref<Api.Announcement.Comment[]>([]);
const total = ref(0);
const loading = ref(false);

// 新评论输入
const newComment = ref('');
const replyTo = ref<Api.Announcement.Comment | null>(null);
const replyContent = ref('');

// 加载评论
async function loadComments() {
  if (!props.announcementId) return;
  loading.value = true;
  const { data } = await fetchGetCommentList({
    announcementId: props.announcementId,
    page: 1,
    pageSize: 100
  });
  if (data) {
    comments.value = data.list || [];
    total.value = data.total || 0;
  }
  loading.value = false;
}

// 发送新评论
async function handleSubmitComment() {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }
  if (!props.published) {
    ElMessage.warning('只能评论已发布的公告');
    return;
  }

  const { data, error } = await fetchCreateComment({
    announcementId: props.announcementId,
    content: newComment.value.trim()
  });

  if (!error && data) {
    ElMessage.success('评论成功');
    newComment.value = '';
    loadComments();
  } else {
    ElMessage.error('评论失败');
  }
}

// 回复评论
function handleReply(comment: Api.Announcement.Comment) {
  replyTo.value = comment;
  replyContent.value = '';
}

// 取消回复
function cancelReply() {
  replyTo.value = null;
  replyContent.value = '';
}

// 发送回复
async function handleSubmitReply() {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容');
    return;
  }
  if (!replyTo.value) return;

  const { data, error } = await fetchCreateComment({
    announcementId: props.announcementId,
    content: replyContent.value.trim(),
    parentId: replyTo.value.id,
    replyToUserId: replyTo.value.userId
  });

  if (!error && data) {
    ElMessage.success('回复成功');
    cancelReply();
    loadComments();
  } else {
    ElMessage.error('回复失败');
  }
}

// 删除评论
async function handleDelete(comment: Api.Announcement.Comment) {
  try {
    await ElMessageBox.confirm('确认删除此评论？', '提示', { type: 'warning' });
    const { error } = await fetchDeleteComment(comment.id);
    if (!error) {
      ElMessage.success('删除成功');
      loadComments();
    } else {
      ElMessage.error('删除失败');
    }
  } catch {
    // 取消操作
  }
}

// 格式化时间
function formatTime(time: string): string {
  if (!time) return '';
  return time.replace('T', ' ').substring(0, 16);
}

// 判断是否为自己的评论
const isMyComment = (comment: Api.Announcement.Comment) => currentUserId && comment.userId === currentUserId;

watch(
  () => props.announcementId,
  () => {
    loadComments();
  }
);

onMounted(() => {
  loadComments();
});
</script>

<template>
  <ElCard header="评论区">
    <!-- 评论输入 -->
    <div v-if="published" class="mb-4">
      <ElInput
        v-model="newComment"
        type="textarea"
        :rows="3"
        placeholder="发表评论..."
        maxlength="500"
        show-word-limit
      />
      <div class="mt-2 flex justify-end">
        <ElButton type="primary" :disabled="!newComment.trim()" @click="handleSubmitComment">发表评论</ElButton>
      </div>
    </div>
    <div v-else class="mb-4 text-sm text-gray-400">仅已发布公告可评论</div>

    <!-- 评论列表 -->
    <div v-loading="loading" class="flex flex-col gap-4">
      <template v-if="comments.length > 0">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <!-- 主评论 -->
          <div class="flex gap-3">
            <div class="avatar-wrapper">
              <div class="avatar">{{ comment.nickname?.charAt(0) || '?' }}</div>
            </div>
            <div class="flex-1">
              <div class="mb-1 flex items-center gap-2">
                <span class="font-medium">{{ comment.nickname }}</span>
                <span class="text-xs text-gray-400">{{ formatTime(comment.created_at) }}</span>
              </div>
              <div class="mb-2 text-sm">{{ comment.content }}</div>
              <div class="flex items-center gap-2">
                <ElButton v-if="published" size="small" link @click="handleReply(comment)">回复</ElButton>
                <ElButton v-if="isMyComment(comment)" size="small" link type="danger" @click="handleDelete(comment)">
                  删除
                </ElButton>
              </div>

              <!-- 回复输入框 -->
              <div v-if="replyTo?.id === comment.id" class="ml-4 mt-3">
                <ElInput
                  v-model="replyContent"
                  type="textarea"
                  :rows="2"
                  :placeholder="`回复 ${comment.nickname}...`"
                  maxlength="500"
                  show-word-limit
                />
                <div class="mt-2 flex gap-2">
                  <ElButton size="small" @click="cancelReply">取消</ElButton>
                  <ElButton size="small" type="primary" :disabled="!replyContent.trim()" @click="handleSubmitReply">
                    发送
                  </ElButton>
                </div>
              </div>

              <!-- 子评论（回复） -->
              <div v-if="comment.children && comment.children.length > 0" class="ml-4 mt-3 flex flex-col gap-3">
                <div v-for="child in comment.children" :key="child.id" class="reply-item">
                  <div class="mb-1 flex items-center gap-2">
                    <span class="font-medium">{{ child.nickname }}</span>
                    <span v-if="child.replyToName" class="text-xs text-gray-400">回复 {{ child.replyToName }}</span>
                    <span class="text-xs text-gray-400">{{ formatTime(child.created_at) }}</span>
                  </div>
                  <div class="mb-2 text-sm">{{ child.content }}</div>
                  <div class="flex items-center gap-2">
                    <ElButton v-if="published" size="small" link @click="handleReply(child)">回复</ElButton>
                    <ElButton v-if="isMyComment(child)" size="small" link type="danger" @click="handleDelete(child)">
                      删除
                    </ElButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="py-8 text-center text-gray-400">暂无评论</div>
    </div>
  </ElCard>
</template>

<style scoped>
.avatar-wrapper {
  width: 36px;
  height: 36px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--el-color-primary-light-5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  font-weight: 600;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.comment-item:last-child {
  border-bottom: none;
}

.reply-item {
  padding: 8px 0;
  border-left: 2px solid var(--el-border-color-lighter);
  padding-left: 12px;
}
</style>
