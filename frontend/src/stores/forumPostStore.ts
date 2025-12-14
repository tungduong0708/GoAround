import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  IForumPost,
  IForumReply,
  IPaginationMeta,
} from "@/utils/interfaces";
import ForumService from "@/services/ForumService";

export const useForumPostStore = defineStore("forumPost", () => {
  // State
  const post = ref<IForumPost | null>(null);
  const replies = ref<IForumReply[]>([]);
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
      if (!response) {
        error.value = "Post not found";
        post.value = null;
        return false;
      }
      post.value = response.data;
      // Increment view count in background
      ForumService.incrementViewCount(postId);
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

  const fetchReplies = async (
    postId: string,
    page: number = 1,
    limit: number = 5
  ) => {
    repliesLoading.value = true;
    try {
      const response = await ForumService.getReplies(postId, page, limit);
      if (page === 1) {
        replies.value = response.data;
      } else {
        // Append for "load more" pagination
        replies.value = [...replies.value, ...response.data];
      }
      replyPagination.value = response.meta;
    } catch (err) {
      console.error("Failed to fetch replies:", err);
    } finally {
      repliesLoading.value = false;
    }
  };

  const addReply = async (
    postId: string,
    content: string,
    parentReplyId?: string
  ) => {
    try {
      const newReply = await ForumService.replyToPost(postId, {
        content,
        parentReplyId,
      });
      // Prepend new reply to the list
      replies.value = [newReply, ...replies.value];
      // Update reply count on the post
      if (post.value) {
        post.value = {
          ...post.value,
          replyCount: (post.value.replyCount || 0) + 1,
        };
      }
      return newReply;
    } catch (err) {
      console.error("Failed to add reply:", err);
      throw err;
    }
  };

  const reportContent = async (
    targetType: "post" | "comment" | "review",
    targetId: string,
    reason: string,
    details?: string
  ) => {
    try {
      const result = await ForumService.reportContent({
        targetType,
        targetId,
        reason,
        details,
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
    reportContent,
    clearPost,
  };
});
