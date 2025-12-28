<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAdmin } from "@/composables/useAdmin";
import ModerationCaseCard from "@/components/admin/ModerationCaseCard.vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "vue-sonner";
import { AdminService } from "@/services";
import type { IModerationCaseDetail, IReportQuery } from "@/utils/interfaces";

const { loadModerationCases, cases, casesLoading, resolveCase } = useAdmin();
// const { toast } = useToast();

const filterStatus = ref<"all" | "pending" | "resolved">("pending"); // Default to pending as per usual workflow
const selectedCaseId = ref<string | null>(null);
const selectedCaseDetail = ref<IModerationCaseDetail | null>(null);
const detailLoading = ref(false);

// Dialog State
const isDialogOpen = ref(false);
const resolveAction = ref<"dismiss" | "remove_content" | "ban_user">("dismiss");
const resolveNote = ref("");
const resolving = ref(false);

const loadCases = () => {
  const query: IReportQuery = {};
  if (filterStatus.value !== "all") {
    if (filterStatus.value === "pending") query.status_filter = "pending";
    else if (filterStatus.value === "resolved")
      query.status_filter = "approved";
  }
  loadModerationCases(query);
};

// Handle Filter Change
const setFilter = (status: "all" | "pending" | "resolved") => {
  filterStatus.value = status;
  loadCases();
};

onMounted(() => {
  loadCases();
});

// Case Detail Handling
const openCaseDetail = async (id: string) => {
  selectedCaseId.value = id;
  isDialogOpen.value = true;
  detailLoading.value = true;
  selectedCaseDetail.value = null; // Reset
  try {
    const res = await AdminService.getCaseDetail(id);
    selectedCaseDetail.value = res.data;
  } catch (error) {
    toast.error("Error", {
      description: "Failed to load case details",
    });
    isDialogOpen.value = false;
  } finally {
    detailLoading.value = false;
  }
};

const handleResolve = async () => {
  if (!selectedCaseId.value) return;
  resolving.value = true;
  try {
    await resolveCase(
      selectedCaseId.value,
      resolveAction.value,
      resolveNote.value
    );
    toast.success("Success", {
      description: "Case resolved successfully",
    });
    isDialogOpen.value = false;
    // Refresh list? resolveCase already removes it from local list in store
  } catch (error) {
    toast.error("Error", {
      description: "Failed to resolve case",
    });
  } finally {
    resolving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div v-motion-slide-visible-once-left class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        :class="[
          'rounded-xl transition-all duration-300',
          filterStatus === 'all'
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 border-transparent'
            : 'hover:bg-muted',
        ]"
        @click="setFilter('all')"
      >
        All
      </Button>
      <Button
        variant="outline"
        size="sm"
        :class="[
          'rounded-xl transition-all duration-300',
          filterStatus === 'pending'
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 border-transparent'
            : 'hover:bg-muted',
        ]"
        @click="setFilter('pending')"
      >
        <span
          class="w-2 h-2 rounded-full mr-2"
          :class="
            filterStatus === 'pending'
              ? 'bg-white'
              : 'bg-orange-500 animate-pulse'
          "
        />
        Pending
      </Button>
      <Button
        variant="outline"
        size="sm"
        :class="[
          'rounded-xl transition-all duration-300',
          filterStatus === 'resolved'
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-emerald-600 border-transparent'
            : 'hover:bg-muted',
        ]"
        @click="setFilter('resolved')"
      >
        Approved
      </Button>
    </div>

    <!-- Content Grid -->
    <div
      v-if="casesLoading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="h-40 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse"
      />
    </div>

    <div
      v-else-if="cases.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <ModerationCaseCard
        v-for="(caseItem, index) in cases"
        :key="caseItem.id"
        :caseItem="caseItem"
        @click="openCaseDetail(caseItem.id)"
        v-motion
        :initial="{ opacity: 0, y: 30, scale: 0.95 }"
        :enter="{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { delay: index * 50, duration: 300 },
        }"
      />
    </div>

    <div
      v-else
      v-motion-pop-visible-once
      class="text-center py-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-3xl border border-dashed border-border/50"
    >
      <div class="inline-flex p-4 rounded-full bg-muted/50 mb-4">
        <svg
          class="h-8 w-8 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-semibold mb-2">No cases found</h3>
      <p class="text-muted-foreground">
        All clear! No reported content matching your filters.
      </p>
    </div>

    <!-- Detail Modal -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Case Details</DialogTitle>
          <DialogDescription
            >Review the reported content and take action.</DialogDescription
          >
        </DialogHeader>

        <div v-if="detailLoading" class="space-y-4 py-4">
          <div class="h-4 w-1/3 bg-muted animate-pulse rounded" />
          <div class="h-32 w-full bg-muted animate-pulse rounded" />
        </div>

        <div v-else-if="selectedCaseDetail" class="space-y-6 py-4">
          <!-- Content Preview -->
          <div class="bg-muted/30 p-4 rounded-lg border space-y-3">
            <div class="flex justify-between">
              <Badge variant="outline">{{
                selectedCaseDetail.target_type
              }}</Badge>
              <span class="text-xs text-muted-foreground">{{
                new Date(selectedCaseDetail.created_at).toLocaleString()
              }}</span>
            </div>

            <div v-if="selectedCaseDetail.content_snapshot">
              <h3
                v-if="'title' in selectedCaseDetail.content_snapshot"
                class="font-bold text-lg"
              >
                {{ (selectedCaseDetail.content_snapshot as any).title }}
              </h3>
              <p class="text-sm mt-2 whitespace-pre-wrap">
                {{
                  (selectedCaseDetail.content_snapshot as any).content ||
                  (selectedCaseDetail.content_snapshot as any).text
                }}
              </p>
              <!-- Images if any -->
              <div
                v-if="(selectedCaseDetail.content_snapshot as any).images?.length"
                class="flex gap-2 mt-3 overflow-x-auto pb-2"
              >
                <img
                  v-for="(img, idx) in (selectedCaseDetail.content_snapshot as any).images"
                  :key="idx"
                  :src="img.image_url || img"
                  class="h-32 w-auto rounded-md object-cover border"
                />
              </div>
            </div>
            <div v-else class="text-sm italic text-muted-foreground">
              Content snapshot unavailable (might be deleted).
            </div>
          </div>

          <!-- Reports List -->
          <div>
            <h4 class="font-semibold mb-2">
              Reports ({{ selectedCaseDetail.report_count }})
            </h4>
            <div class="space-y-2 max-h-40 overflow-y-auto pr-2">
              <div
                v-for="report in selectedCaseDetail.reports"
                :key="report.id"
                class="text-sm border p-3 rounded-md bg-white"
              >
                <div class="flex justify-between mb-1">
                  <span class="font-medium text-foreground"
                    >Reason: {{ report.reason }}</span
                  >
                  <span class="text-xs text-muted-foreground">{{
                    new Date(report.created_at).toLocaleDateString()
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Resolution Actions -->
          <div class="border-t pt-4">
            <h4 class="font-semibold mb-3">Resolution</h4>
            <RadioGroup
              v-model="resolveAction"
              class="grid grid-cols-3 gap-4 mb-4"
            >
              <div>
                <RadioGroupItem
                  value="dismiss"
                  id="r-dismiss"
                  class="peer sr-only"
                />
                <Label
                  for="r-dismiss"
                  class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span>Dismiss</span>
                  <span
                    class="text-xs text-muted-foreground font-normal mt-1 text-center"
                    >Ignore reports and keep content</span
                  >
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="remove_content"
                  id="r-remove"
                  class="peer sr-only"
                />
                <Label
                  for="r-remove"
                  class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive [&:has([data-state=checked])]:border-destructive cursor-pointer"
                >
                  <span class="text-destructive font-medium">Remove</span>
                  <span
                    class="text-xs text-muted-foreground font-normal mt-1 text-center"
                    >Delete content immediately</span
                  >
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="ban_user"
                  id="r-ban"
                  class="peer sr-only"
                />
                <Label
                  for="r-ban"
                  class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive [&:has([data-state=checked])]:border-destructive cursor-pointer"
                >
                  <span class="text-destructive font-medium">Ban User</span>
                  <span
                    class="text-xs text-muted-foreground font-normal mt-1 text-center"
                    >Remove content & ban author</span
                  >
                </Label>
              </div>
            </RadioGroup>

            <div class="space-y-2">
              <Label>Resolution Note (Optional)</Label>
              <Textarea
                v-model="resolveNote"
                placeholder="Add internal note..."
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isDialogOpen = false"
            >Cancel</Button
          >
          <Button
            :variant="resolveAction === 'dismiss' ? 'default' : 'destructive'"
            @click="handleResolve"
            :disabled="resolving"
          >
            {{ resolving ? "Processing..." : "Confirm Resolution" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
