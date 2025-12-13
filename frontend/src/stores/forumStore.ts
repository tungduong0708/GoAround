import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  IForumPost,
  IForumSearchQuery,
  IPaginationMeta,
} from "@/utils/interfaces";
import ForumService from "@/services/ForumService";

export const useForumStore = defineStore("forum", () => {
  const posts = ref<IForumPost[]>([]);
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

  return {
    posts,
    pagination,
    loading,
    error,
    fetchPosts,
  };
});
