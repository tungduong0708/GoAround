import { storeToRefs } from "pinia";
import { useAdminStore } from "@/stores/adminStore";
import { computed } from "vue";

export function useAdmin() {
  const store = useAdminStore();
  const {
    cases,
    businessVerifications,
    pagination,
    verificationPagination,
    casesLoading,
    verificationsLoading,
    error,
    // Use the dedicated pending counts from the store
    pendingCasesCount,
    pendingVerificationsCount,
  } = storeToRefs(store);

  // Backward-compatible loading computed that combines both loading states
  const loading = computed(
    () => casesLoading.value || verificationsLoading.value
  );

  // Actions
  const {
    loadModerationCases,
    loadBusinessVerifications,
    loadPendingCasesCount,
    resolveCase,
    verifyBusiness,
  } = store;

  return {
    // State
    cases,
    businessVerifications,
    pagination,
    verificationPagination,
    loading,
    casesLoading,
    verificationsLoading,
    error,

    // Pending counts - these are refs from the store, updated optimistically
    pendingCasesCount,
    pendingVerificationsCount,

    // Actions
    loadModerationCases,
    loadBusinessVerifications,
    loadPendingCasesCount,
    resolveCase,
    verifyBusiness,
  };
}
