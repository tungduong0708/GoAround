import { onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAdminStore } from "@/stores/adminStore";
import type { IReportQuery } from "@/utils/interfaces";

export function useReportedContent() {
  const store = useAdminStore();
  const { cases, pagination, casesLoading, error } = storeToRefs(store);

  // Local state for filters/pagination if needed in the UI to drive the query
  const currentPage = ref(1);
  const pageSize = ref(10);
  const statusFilter = ref<"pending" | "approved" | "rejected">("pending");

  const fetchCases = () => {
    const query: IReportQuery = {
      page: currentPage.value,
      limit: pageSize.value,
      status_filter: statusFilter.value,
    };
    store.loadModerationCases(query);
  };

  onMounted(() => {
    fetchCases();
  });

  watch([currentPage, pageSize, statusFilter], () => {
    fetchCases();
  });

  return {
    cases,
    pagination,
    loading: casesLoading, // Alias for backward compatibility
    casesLoading,
    error,
    currentPage,
    pageSize,
    statusFilter,
    fetchCases,
  };
}
