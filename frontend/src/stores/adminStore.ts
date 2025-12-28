import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  IModerationCaseSummary,
  IPaginatedResponse,
  IReportQuery,
  IBusinessVerificationDetail,
} from "@/utils/interfaces";
import { AdminService } from "@/services";

export const useAdminStore = defineStore("admin", () => {
  const cases = ref<IModerationCaseSummary[]>([]);
  const businessVerifications = ref<IBusinessVerificationDetail[]>([]);
  const pagination = ref<IPaginatedResponse<IModerationCaseSummary[]> | null>(
    null
  );
  const verificationPagination = ref<IPaginatedResponse<
    IBusinessVerificationDetail[]
  > | null>(null);

  // Separate loading states for independent operations
  const casesLoading = ref(false);
  const verificationsLoading = ref(false);
  const error = ref<string | null>(null);

  // Dedicated pending counts - these are NOT affected by filter changes
  // They represent the actual count of pending items for display in summary badges
  const pendingCasesCount = ref(0);
  const pendingVerificationsCount = ref(0);

  // Track current filter to know if we should update pending counts
  const currentCasesFilter = ref<string | null>(null);

  const loadModerationCases = async (query?: IReportQuery) => {
    casesLoading.value = true;
    error.value = null;
    currentCasesFilter.value = query?.status_filter || null;
    try {
      const response = await AdminService.getModerationCases(query);
      cases.value = response.data;
      pagination.value = response;

      // Update pending count only when loading pending cases specifically
      if (query?.status_filter === "pending" || !query?.status_filter) {
        // If loading pending or all, and the response has pending items
        if (query?.status_filter === "pending") {
          pendingCasesCount.value = response.meta?.total_items || 0;
        }
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load moderation cases";
      console.error(err);
    } finally {
      casesLoading.value = false;
    }
  };

  // Dedicated function to load pending count without affecting the main cases list
  const loadPendingCasesCount = async () => {
    try {
      const response = await AdminService.getModerationCases({
        status_filter: "pending",
        limit: 1,
      });
      pendingCasesCount.value = response.meta?.total_items || 0;
    } catch (err) {
      console.error("Failed to load pending cases count:", err);
    }
  };

  const loadBusinessVerifications = async (page = 1, limit = 10) => {
    verificationsLoading.value = true;
    error.value = null;
    try {
      const response = await AdminService.getUnverifiedBusinesses(page, limit);
      businessVerifications.value = response.data;
      verificationPagination.value = response;
      // Business verifications list typically shows only pending, so update the count
      pendingVerificationsCount.value = response.meta?.total_items || 0;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load business verifications";
      console.error(err);
    } finally {
      verificationsLoading.value = false;
    }
  };

  const resolveCase = async (
    caseId: string,
    action: "dismiss" | "remove_content" | "ban_user",
    notes?: string,
    banDuration?: number
  ) => {
    // Find the case before removing to check if it was pending
    const resolvedCase = cases.value.find((c) => c.id === caseId);
    const wasPending = resolvedCase?.status === "pending";

    try {
      await AdminService.resolveCase(caseId, {
        action,
        notes,
        ban_duration_days: banDuration,
      });

      // Optimistic update: Remove from list locally
      cases.value = cases.value.filter((c) => c.id !== caseId);

      // Optimistic update: Update pagination counts
      if (pagination.value?.meta?.total_items) {
        pagination.value = {
          ...pagination.value,
          meta: {
            ...pagination.value.meta,
            total_items: pagination.value.meta.total_items - 1,
          },
        };
      }

      // Optimistic update: Decrement pending count if the case was pending
      if (wasPending && pendingCasesCount.value > 0) {
        pendingCasesCount.value--;
      }
    } catch (err) {
      // On error, we could potentially revert the optimistic update
      // For now, just throw to let the UI handle it
      error.value =
        err instanceof Error ? err.message : "Failed to resolve case";
      throw err;
    }
  };

  const verifyBusiness = async (
    id: string,
    action: "approve" | "reject",
    notes?: string
  ) => {
    // Find the verification before removing to check if it was pending
    const verification = businessVerifications.value.find(
      (b) => b.verification_id === id
    );
    const wasPending = verification?.status === "pending";

    try {
      await AdminService.verifyBusiness(id, { action, notes });

      // Optimistic update: Remove from list locally
      businessVerifications.value = businessVerifications.value.filter(
        (b) => b.verification_id !== id
      );

      // Optimistic update: Update pagination counts
      if (verificationPagination.value?.meta?.total_items) {
        verificationPagination.value = {
          ...verificationPagination.value,
          meta: {
            ...verificationPagination.value.meta,
            total_items: verificationPagination.value.meta.total_items - 1,
          },
        };
      }

      // Optimistic update: Decrement pending count if the verification was pending
      if (wasPending && pendingVerificationsCount.value > 0) {
        pendingVerificationsCount.value--;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to verify business";
      throw err;
    }
  };

  return {
    cases,
    businessVerifications,
    pagination,
    verificationPagination,
    casesLoading,
    verificationsLoading,
    // Keep 'loading' as a computed or alias for backward compatibility if needed
    get loading() {
      return casesLoading.value || verificationsLoading.value;
    },
    error,
    // Pending counts
    pendingCasesCount,
    pendingVerificationsCount,
    // Actions
    loadModerationCases,
    loadBusinessVerifications,
    loadPendingCasesCount,
    resolveCase,
    verifyBusiness,
  };
});
