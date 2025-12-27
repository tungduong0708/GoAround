import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useForumStore, useAuthStore } from "@/stores";
import ForumService from "@/services/ForumService";

export function useForumMain() {
  const store = useForumStore();
  const authStore = useAuthStore();
  const { posts, pagination, loading, error } = storeToRefs(store);
  const { isAuthenticated } = storeToRefs(authStore);

  const searchQuery = ref("");
  const activeSort = ref<("newest" | "popular" | "oldest")>("newest");
  const activeTags = ref<string[]>([]);
  const activeTimeFilter = ref("All Time");
  const currentPage = ref(1);
  
  // Like functionality
  const likedPosts = ref<Set<string>>(new Set());
  const pendingLikes = ref<Map<string, { timeout: ReturnType<typeof setTimeout> }>>(new Map());

  const sortOptions = ["newest", "popular", "oldest"];
  const tagOptions = [
    "Paris",
    "Japan",
    "Food",
    "Budget",
    "Family",
    "Nature",
    "Vietnam",
    "Iceland",
  ];
  const timeOptions = ["All Time", "Last 7 Days", "Last 30 Days"];

  const fetchPosts = async () => {
    await store.fetchPosts({
      q: searchQuery.value,
      sort: activeSort.value,
      page: currentPage.value,
      limit: 5, // 5 per page for easier testing of pagination
      tags: activeTags.value,
    });
    
    // Initialize likedPosts from the is_liked field in posts
    if (isAuthenticated.value) {
      likedPosts.value.clear();
      posts.value.forEach(post => {
        if ((post as any).is_liked) {
          likedPosts.value.add(post.id);
        }
      });
    }
  };

  // Initial fetch
  onMounted(() => {
    fetchPosts();
  });

  // Refetch when filters change (reset page to 1)
  watch([searchQuery, activeSort, activeTags, activeTimeFilter], () => {
    currentPage.value = 1;
    fetchPosts();
  });

  // Refetch when page changes
  watch(currentPage, () => {
    fetchPosts();
  });

  // Removed client-side filtering logic as Service now handles it via mock
  const displayedPosts = computed(() => posts.value);

  const toggleTag = (tag: string) => {
    if (activeTags.value.includes(tag)) {
      activeTags.value = activeTags.value.filter((t) => t !== tag);
    } else {
      activeTags.value.push(tag);
    }
  };

  const setTimeFilter = (time: string) => {
    activeTimeFilter.value = time;
  };

  const setSort = (sort: string) => {
    activeSort.value = sort as "newest" | "popular" | "oldest";
  };

  const setPage = (page: number) => {
    if (page > 0) {
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const nextPage = () => {
    if (
      pagination.value &&
      currentPage.value <
        Math.ceil(pagination.value.total_items / pagination.value.limit)
    ) {
      setPage(currentPage.value + 1);
    }
  };

  const previousPage = () => {
    if (currentPage.value > 1) {
      setPage(currentPage.value - 1);
    }
  };

  // Like functionality
  const sendLikeRequest = async (postId: string) => {
    try {
      const result = await ForumService.likePost(postId);
      
      // Update the post's like count and liked status
      const post = posts.value.find(p => p.id === postId);
      if (post) {
        post.like_count = result.like_count;
      }
      
      // Update liked posts set
      if (result.is_liked) {
        likedPosts.value.add(postId);
      } else {
        likedPosts.value.delete(postId);
      }
    } catch (error) {
      console.error(`Error toggling like for post:`, error);
    }
  };

  const toggleLike = (postId: string) => {
    if (!isAuthenticated.value) return;

    // Find the post and update UI immediately
    const post = posts.value.find(p => p.id === postId);
    if (!post) return;

    const isCurrentlyLiked = likedPosts.value.has(postId);

    // Update UI optimistically
    if (isCurrentlyLiked) {
      likedPosts.value.delete(postId);
      post.like_count = Math.max(0, (post.like_count || 0) - 1);
    } else {
      likedPosts.value.add(postId);
      post.like_count = (post.like_count || 0) + 1;
    }

    // Clear existing timeout if any
    const existing = pendingLikes.value.get(postId);
    if (existing) {
      clearTimeout(existing.timeout);
    }

    // Schedule API call after 5 seconds
    const timeout = setTimeout(() => {
      sendLikeRequest(postId);
      pendingLikes.value.delete(postId);
    }, 5000);

    pendingLikes.value.set(postId, { timeout });
  };

  // Send all pending likes before unmounting
  const flushPendingLikes = async () => {
    const promises: Promise<void>[] = [];
    pendingLikes.value.forEach(({ timeout }, postId) => {
      clearTimeout(timeout);
      promises.push(sendLikeRequest(postId));
    });
    pendingLikes.value.clear();
    await Promise.all(promises);
  };

  onUnmounted(() => {
    flushPendingLikes();
  });

  // Watch for route changes and flush pending likes
  watch([searchQuery, activeSort, activeTags, activeTimeFilter, currentPage], () => {
    flushPendingLikes();
  });

  return {
    // State
    searchQuery,
    activeSort,
    activeTags,
    activeTimeFilter,
    currentPage,
    pagination,
    isAuthenticated,
    likedPosts,

    // Data
    posts: displayedPosts,
    loading,
    error,

    // Options
    sortOptions,
    tagOptions,
    timeOptions,

    // Actions
    fetchPosts,
    toggleTag,
    setTimeFilter,
    setSort,
    setPage,
    nextPage,
    previousPage,
    toggleLike,
    flushPendingLikes,
  };
}
