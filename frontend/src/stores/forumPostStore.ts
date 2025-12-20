import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  IForumPostDetail,
  IForumCommentSchema,
  IPaginationMeta,
  IForumReplyCreate,
} from "@/utils/interfaces";
import ForumService from "@/services/ForumService";

export const useForumPostStore = defineStore("forumPost", () => {
  // State
  const post = ref<IForumPostDetail | null>(null);
  const replies = ref<IForumCommentSchema[]>([]);
  const replyPagination = ref<IPaginationMeta | null>(null);
  const loading = ref(false);
  const repliesLoading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchPost = async (postId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await ForumService.getPostById(postId);
      if (!response || !response.data) {
        error.value = "Post not found";
        post.value = null;
        return false;
      }
      post.value = response.data;
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to fetch post";
      post.value = null;
      console.error(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchReplies = async (postId: string) => {
    repliesLoading.value = true;
    try {
      // Replies are part of the post detail, so refetch the post
      const response = await ForumService.getPostById(postId);
      if (response && response.data) {
        replies.value = response.data.replies || [];
      }
    } catch (err) {
      console.error("Failed to fetch replies:", err);
    } finally {
      repliesLoading.value = false;
    }
  };

  const addReply = async (
    postId: string,
    content: string,
    parent_reply_id?: string
  ) => {
    try {
      const input: IForumReplyCreate = {
        content,
        parent_reply_id,
      };
      const newReply = await ForumService.createReply(postId, input);
      // Prepend new reply to the list
      replies.value = [newReply, ...replies.value];
      return newReply;
    } catch (err) {
      console.error("Failed to add reply:", err);
      throw err;
    }
  };

  const reportPost = async (
    postId: string,
    reason: string,
  ) => {
    try {
      const result = await ForumService.reportPost(postId, {
        reason,
      });
      return result;
    } catch (err) {
      console.error("Failed to submit report:", err);
      throw err;
    }
  };

  const reportReply = async (
    postId: string,
    replyId: string,
    reason: string,
  ) => {
    try {
      const result = await ForumService.reportReply(postId, replyId, {
        reason,
      });
      return result;
    } catch (err) {
      console.error("Failed to submit report:", err);
      throw err;
    }
  };

  const clearPost = () => {
    post.value = null;
    replies.value = [];
    replyPagination.value = null;
    error.value = null;
  };

  return {
    // State
    post,
    replies,
    replyPagination,
    loading,
    repliesLoading,
    error,
    // Actions
    fetchPost,
    fetchReplies,
    addReply,
    reportPost,
    reportReply,
    clearPost,
  };
});
