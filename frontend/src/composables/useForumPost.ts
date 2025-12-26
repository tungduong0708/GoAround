import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useForumPostStore, useAuthStore } from "@/stores";

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
      await postStore.fetchReplies(postId.value);
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

  // Lifecycle
  onMounted(() => {
    fetchPostData();
  });

  onUnmounted(() => {
    postStore.clearPost();
  });

  // Watch for route changes (navigating between posts)
  watch(
    () => route.params.postId,
    (newId, oldId) => {
      if (newId && newId !== oldId) {
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
  };
}
