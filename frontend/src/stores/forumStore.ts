import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  IForumPostListItem,
  IForumSearchQuery,
  IPaginationMeta,
  IForumPostCreate,
  IForumReplyUpdate,
} from "@/utils/interfaces";
import ForumService from "@/services/ForumService";

export const useForumStore = defineStore("forum", () => {
  const posts = ref<IForumPostListItem[]>([]);
  const pagination = ref<IPaginationMeta | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPosts = async (query?: IForumSearchQuery) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await ForumService.getPosts(query);
      posts.value = response.data;
      pagination.value = response.meta;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch posts";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createPost = async (payload: IForumPostCreate) => {
    loading.value = true;
    try {
      const newPost = await ForumService.createPost(payload);
      await fetchPosts(); // Reload to get updated list
      return newPost;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create post";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePost = async (id: string, payload: IForumPostCreate) => {
    loading.value = true;
    try {
      const updatedPost = await ForumService.updatePost(id, payload);
      await fetchPosts(); // Reload to get updated list
      return updatedPost;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update post";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getPostById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await ForumService.getPostById(id);
      return response.data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch post";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateReply = async (
    postId: string,
    replyId: string,
    content: string
  ) => {
    try {
      const payload: IForumReplyUpdate = { content };
      const updatedReply = await ForumService.updateReply(
        postId,
        replyId,
        payload
      );
      return updatedReply;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update reply";
      throw err;
    }
  };

  return {
    posts,
    pagination,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    getPostById,
    updateReply,
  };
});
