import { ref, onMounted, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForumStore } from "@/stores";

export function useForumMain() {
  const store = useForumStore();
  const { posts, pagination, loading, error } = storeToRefs(store);

  const searchQuery = ref("");
  const activeSort = ref("Relevance");
  const activeTags = ref<string[]>([]);
  const activeTimeFilter = ref("All Time");
  const currentPage = ref(1);

  const sortOptions = ["Relevance", "Newest", "Popular", "Most Replies"];
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

  const fetchPosts = () => {
    store.fetchPosts({
      q: searchQuery.value,
      sort: activeSort.value,
      page: currentPage.value,
      limit: 5, // 5 per page for easier testing of pagination
      tags: activeTags.value,
    });
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
    activeSort.value = sort;
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
        Math.ceil(pagination.value.totalItems / pagination.value.limit)
    ) {
      setPage(currentPage.value + 1);
    }
  };

  const previousPage = () => {
    if (currentPage.value > 1) {
      setPage(currentPage.value - 1);
    }
  };

  return {
    // State
    searchQuery,
    activeSort,
    activeTags,
    activeTimeFilter,
    currentPage,
    pagination,

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
  };
}
