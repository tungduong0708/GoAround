import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useForumPostStore, useAuthStore } from "@/stores";
import ForumService from "@/services/ForumService";

export function useForumPost() {
  const route = useRoute();
  const router = useRouter();
  const postStore = useForumPostStore();
  const authStore = useAuthStore();

  const { post, replies, replyPagination, loading, repliesLoading, error } =
    storeToRefs(postStore);
  const { isAuthenticated, user } = storeToRefs(authStore);

  // Local state
  const currentReplyPage = ref(1);
  const repliesPerPage = 5;
  const isReplyEditorOpen = ref(false);
  const isReportDialogOpen = ref(false);
  const reportTarget = ref<{ type: "post" | "comment"; id: string } | null>(
    null
  );
  const lastReplyTime = ref<number>(0);
  const replyRateLimitSeconds = 15;
  const isLiked = ref(false);
  const isLiking = ref(false);
  let likeTimeout: ReturnType<typeof setTimeout> | null = null;
  let pendingLikeAction: { postId: string; originalCount: number; originalLiked: boolean } | null = null;
  
  // Editing state
  const editingReplyId = ref<string | null>(null);
  const editReplyContent = ref<string>("");

  // Computed
  const postId = computed(() => route.params.postId as string);

  const isAuthor = computed(() => {
    if (!isAuthenticated.value || !post.value || !user.value) return false;
    return post.value.author.id === user.value.id;
  });

  const hasMoreReplies = computed(() => {
    if (!replyPagination.value) return false;
    const totalPages = Math.ceil(
      replyPagination.value.total_items / replyPagination.value.limit
    );
    return currentReplyPage.value < totalPages;
  });

  const canReply = computed(() => {
    const now = Date.now();
    const timeSinceLastReply = (now - lastReplyTime.value) / 1000;
    return timeSinceLastReply >= replyRateLimitSeconds;
  });

  const timeUntilCanReply = computed(() => {
    if (canReply.value) return 0;
    const elapsed = (Date.now() - lastReplyTime.value) / 1000;
    return Math.ceil(replyRateLimitSeconds - elapsed);
  });

  // Reply form with VeeValidate
  const replySchema = toTypedSchema(
    z.object({
      content: z
        .string()
        .min(1, "Reply cannot be empty")
        .max(2000, "Reply is too long"),
    })
  );

  const {
    handleSubmit: handleReplySubmit,
    resetForm: resetReplyForm,
    meta: replyFormMeta,
  } = useForm({
    validationSchema: replySchema,
    initialValues: {
      content: "",
    },
  });

  const { value: replyContent, errorMessage: replyError } =
    useField<string>("content");

  // Report form with VeeValidate
  const reportSchema = toTypedSchema(
    z.object({
      reason: z.string().min(1, "Please select a reason"),
      details: z.string().max(500, "Details are too long").optional(),
    })
  );

  const {
    handleSubmit: handleReportSubmit,
    resetForm: resetReportForm,
    meta: reportFormMeta,
  } = useForm({
    validationSchema: reportSchema,
    initialValues: {
      reason: "",
      details: "",
    },
  });

  const { value: reportReason, errorMessage: reportReasonError } =
    useField<string>("reason");
  const { value: reportDetails, errorMessage: reportDetailsError } =
    useField<string>("details");

  const reportReasons = [
    "Spam",
    "Harassment",
    "Inappropriate Language",
    "Misinformation",
    "Off-topic",
    "Other",
  ];

  // Actions
  const fetchPostData = async () => {
    const success = await postStore.fetchPost(postId.value);
    if (success) {
      currentReplyPage.value = 1;
      // Sync isLiked from the API response
      if (post.value) {
        isLiked.value = post.value.is_liked || false;
      }
      // Replies are already populated by fetchPost
    }
  };

  const loadMoreReplies = async () => {
    if (!hasMoreReplies.value || repliesLoading.value) return;
    currentReplyPage.value++;
    await postStore.fetchReplies(postId.value);
  };

  const openReplyEditor = () => {
    if (!isAuthenticated.value) {
      // Redirect to login or show login modal
      router.push({ path: "/login", query: { redirect: route.fullPath } });
      return;
    }
    isReplyEditorOpen.value = true;
  };

  const closeReplyEditor = () => {
    if (replyContent.value && replyContent.value.trim()) {
      // Could show confirmation dialog here
      const confirmed = window.confirm("Discard unsaved reply?");
      if (!confirmed) return;
    }
    isReplyEditorOpen.value = false;
    resetReplyForm();
  };

  const submitReply = handleReplySubmit(async (values) => {
    if (!canReply.value) {
      alert(
        `Please wait ${timeUntilCanReply.value} seconds before posting again.`
      );
      return;
    }

    try {
      await postStore.addReply(postId.value, values.content);
      lastReplyTime.value = Date.now();
      isReplyEditorOpen.value = false;
      resetReplyForm();
    } catch (err) {
      console.error("Failed to submit reply:", err);
      alert("Failed to submit reply. Please try again.");
    }
  });

  const openReportDialog = (
    targetType: "post" | "comment",
    targetId: string
  ) => {
    if (!isAuthenticated.value) {
      router.push({ path: "/login", query: { redirect: route.fullPath } });
      return;
    }
    reportTarget.value = { type: targetType, id: targetId };
    isReportDialogOpen.value = true;
  };

  const closeReportDialog = () => {
    isReportDialogOpen.value = false;
    reportTarget.value = null;
    resetReportForm();
  };

  const submitReport = handleReportSubmit(async (values) => {
    if (!reportTarget.value) return;

    try {
      if (reportTarget.value.type === "comment") {
        await postStore.reportReply(
          postId.value,
          reportTarget.value.id,
          values.reason
        );
      } else {
        await postStore.reportPost(
          reportTarget.value.id,
          values.reason
        );
      }
      closeReportDialog();
      alert("Thank you for your report. Our team will review it shortly.");
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("Failed to submit report. Please try again.");
    }
  });

  const goBack = () => {
    router.push("/forums");
  };

  const startEditingReply = (replyId: string) => {
    const reply = replies.value.find(r => r.id === replyId);
    if (reply) {
      editingReplyId.value = replyId;
      editReplyContent.value = reply.content;
    }
  };

  const cancelEditingReply = () => {
    editingReplyId.value = null;
    editReplyContent.value = "";
  };

  const saveEditReply = async () => {
    if (!editingReplyId.value || !editReplyContent.value.trim()) return;
    
    try {
      await postStore.updateReply(
        postId.value,
        editingReplyId.value,
        editReplyContent.value
      );
      editingReplyId.value = null;
      editReplyContent.value = "";
    } catch (err) {
      console.error("Failed to update reply:", err);
      alert("Failed to update reply. Please try again.");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid date";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
      }
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      }).format(date);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  // Like/Unlike actions with server-side state
  const sendPendingLikeRequest = async () => {
    if (!pendingLikeAction) return;

    const { postId } = pendingLikeAction;
    try {
      console.log(`Sending like toggle request for post ${postId}`);
      const result = await ForumService.likePost(postId);
      
      // Update with server response
      if (post.value) {
        post.value.like_count = result.like_count;
      }
      isLiked.value = result.is_liked;
      
      console.log(`Like toggle completed: count=${result.like_count}, liked=${result.is_liked}`);
    } catch (error) {
      console.error(`Error toggling like:`, error);
      // Revert optimistic update on error
      if (post.value && pendingLikeAction.originalCount !== undefined) {
        post.value.like_count = pendingLikeAction.originalCount;
        isLiked.value = pendingLikeAction.originalLiked;
      }
    } finally {
      pendingLikeAction = null;
    }
  };

  const toggleLike = () => {
    if (!isAuthenticated.value || !post.value) return;

    // Clear any existing timeout
    if (likeTimeout) {
      clearTimeout(likeTimeout);
    }

    // Store original values for potential rollback
    const originalCount = post.value.like_count || 0;
    const originalLiked = isLiked.value;
    
    // Update UI immediately (optimistic update)
    isLiked.value = !isLiked.value;
    
    if (post.value) {
      post.value.like_count = isLiked.value 
        ? (post.value.like_count || 0) + 1 
        : Math.max(0, (post.value.like_count || 0) - 1);
    }

    // Store the pending action
    pendingLikeAction = { 
      postId: postId.value,
      originalCount,
      originalLiked
    };

    // Schedule API call after 5 seconds
    likeTimeout = setTimeout(() => {
      sendPendingLikeRequest();
    }, 5000);
  };

  // Reply like functionality
  const likedReplies = ref<Set<string>>(new Set());
  const pendingReplyLikes = ref<Map<string, { timeout: ReturnType<typeof setTimeout>; originalCount: number; originalLiked: boolean }>>(new Map());

  const sendReplyLikeRequest = async (replyId: string) => {
    const pending = pendingReplyLikes.value.get(replyId);
    if (!pending || !postId.value) return;

    try {
      const result = await ForumService.likeReply(postId.value, replyId);
      
      // Update the reply's like count and liked status
      const reply = replies.value.find(r => r.id === replyId);
      if (reply) {
        reply.like_count = result.like_count;
        reply.is_liked = result.is_liked;
      }
      
      // Update liked replies set
      if (result.is_liked) {
        likedReplies.value.add(replyId);
      } else {
        likedReplies.value.delete(replyId);
      }
    } catch (error) {
      console.error('Error toggling reply like:', error);
      // Revert optimistic update on error
      const reply = replies.value.find(r => r.id === replyId);
      if (reply && pending) {
        reply.like_count = pending.originalCount;
        reply.is_liked = pending.originalLiked;
        if (pending.originalLiked) {
          likedReplies.value.add(replyId);
        } else {
          likedReplies.value.delete(replyId);
        }
      }
    } finally {
      pendingReplyLikes.value.delete(replyId);
    }
  };

  const toggleReplyLike = (replyId: string) => {
    if (!isAuthenticated.value) return;

    const reply = replies.value.find(r => r.id === replyId);
    if (!reply) return;

    // Use reply.is_liked as the source of truth (from API)
    const isCurrentlyLiked = reply.is_liked || likedReplies.value.has(replyId);
    const originalCount = reply.like_count || 0;
    const originalLiked = isCurrentlyLiked;

    // Update UI optimistically
    if (isCurrentlyLiked) {
      likedReplies.value.delete(replyId);
      reply.like_count = Math.max(0, (reply.like_count || 0) - 1);
      reply.is_liked = false;
    } else {
      likedReplies.value.add(replyId);
      reply.like_count = (reply.like_count || 0) + 1;
      reply.is_liked = true;
    }

    // Clear existing timeout if any
    const existing = pendingReplyLikes.value.get(replyId);
    if (existing) {
      clearTimeout(existing.timeout);
    }

    // Schedule API call after 5 seconds
    const timeout = setTimeout(() => {
      sendReplyLikeRequest(replyId);
    }, 5000);

    pendingReplyLikes.value.set(replyId, { timeout, originalCount, originalLiked });
  };

  const flushPendingReplyLikes = async () => {
    const promises: Promise<void>[] = [];
    pendingReplyLikes.value.forEach(({ timeout }, replyId) => {
      clearTimeout(timeout);
      promises.push(sendReplyLikeRequest(replyId));
    });
    pendingReplyLikes.value.clear();
    await Promise.all(promises);
  };

  // Initialize and sync liked replies from API data
  watch(replies, (newReplies) => {
    if (newReplies && newReplies.length > 0) {
      // Sync likedReplies Set with API response
      newReplies.forEach(reply => {
        if (reply.is_liked) {
          likedReplies.value.add(reply.id);
        } else {
          likedReplies.value.delete(reply.id);
        }
      });
    }
  }, { immediate: true, deep: true });

  // Lifecycle
  onMounted(() => {
    fetchPostData();
  });

  onUnmounted(() => {
    // Send any pending like request before unmounting
    if (likeTimeout) {
      clearTimeout(likeTimeout);
      sendPendingLikeRequest();
    }
    flushPendingReplyLikes();
    postStore.clearPost();
  });

  // Watch for route changes (navigating between posts)
  watch(
    () => route.params.postId,
    (newId, oldId) => {
      if (newId && newId !== oldId) {
        // Send pending like request before navigating away
        if (likeTimeout) {
          clearTimeout(likeTimeout);
          sendPendingLikeRequest();
        }
        flushPendingReplyLikes();
        fetchPostData();
      }
    }
  );

  return {
    // State
    post,
    replies,
    replyPagination,
    loading,
    repliesLoading,
    error,
    isAuthenticated,
    isAuthor,
    hasMoreReplies,
    canReply,
    timeUntilCanReply,
    isLiked,
    isLiking,
    user,

    // Reply editor
    isReplyEditorOpen,
    replyContent,
    replyError,
    replyFormMeta,
    openReplyEditor,
    closeReplyEditor,
    submitReply,

    // Report dialog
    isReportDialogOpen,
    reportTarget,
    reportReason,
    reportReasonError,
    reportDetails,
    reportDetailsError,
    reportReasons,
    reportFormMeta,
    openReportDialog,
    closeReportDialog,
    submitReport,

    // Actions
    loadMoreReplies,
    goBack,
    formatDate,
    formatNumber,
    toggleLike,
    toggleReplyLike,
    likedReplies,
    
    // Edit reply
    editingReplyId,
    editReplyContent,
    startEditingReply,
    cancelEditingReply,
    saveEditReply,
    
    // Flush functions for navigation guards
    flushPendingLikes: async () => {
      if (likeTimeout) {
        clearTimeout(likeTimeout);
        await sendPendingLikeRequest();
      }
      await flushPendingReplyLikes();
    },
  };
}
