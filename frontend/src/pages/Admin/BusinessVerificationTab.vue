<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAdmin } from "@/composables/useAdmin";
import BusinessVerificationCard from "@/components/admin/BusinessVerificationCard.vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "vue-sonner";
import type { IBusinessVerificationDetail } from "@/utils/interfaces";

const {
  loadBusinessVerifications,
  businessVerifications,
  verificationsLoading,
  verifyBusiness,
} = useAdmin();

const selectedVerification = ref<IBusinessVerificationDetail | null>(null);
const isDialogOpen = ref(false);
const processing = ref(false);
const reviewNote = ref("");
const showRejectInput = ref(false); // To toggle reject specific input if needed, or just use common one

onMounted(() => {
  loadBusinessVerifications();
});

const openDetail = (verification: IBusinessVerificationDetail) => {
  selectedVerification.value = verification;
  reviewNote.value = "";
  showRejectInput.value = false;
  isDialogOpen.value = true;
};

const handleApprove = async () => {
  if (!selectedVerification.value) return;
  processing.value = true;
  try {
    await verifyBusiness(
      selectedVerification.value.verification_id,
      "approve",
      reviewNote.value
    );
    toast.success("Verified", {
      description: "Business account has been verified successfully.",
    });
    isDialogOpen.value = false;
  } catch (error) {
    toast.error("Error", {
      description: "Failed to verify business",
    });
  } finally {
    processing.value = false;
  }
};

const handleRejectClick = () => {
  // If note is empty, maybe focus it or require it?
  // Prompt says "optional note", so just clicking reject is fine.
  // But maybe we want to confirm rejection logic.
  // Let's simpler: If they click Reject, we verify, if note is there we send it.
  // To minimize clicks, just one click if optional.
  // For better UX, maybe a confirmation or just direct action.
  // Let's assume direct action but showing the note field is always there.
  handleReject();
};

const handleReject = async () => {
  if (!selectedVerification.value) return;
  processing.value = true;
  try {
    await verifyBusiness(
      selectedVerification.value.verification_id,
      "reject",
      reviewNote.value
    );
    toast.success("Rejected", {
      description: "Business verification request has been rejected.",
    });
    isDialogOpen.value = false;
  } catch (error) {
    toast.error("Error", {
      description: "Failed to reject request",
    });
  } finally {
    processing.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div
      v-if="verificationsLoading && businessVerifications.length === 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="h-44 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse"
      />
    </div>

    <!-- Verification Cards -->
    <div
      v-else-if="businessVerifications.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <BusinessVerificationCard
        v-for="(verification, index) in businessVerifications"
        :key="verification.verification_id"
        :verification="verification"
        @click="openDetail(verification)"
        v-motion
        :initial="{ opacity: 0, y: 30, scale: 0.95 }"
        :enter="{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { delay: index * 75, duration: 300 },
        }"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      v-motion-pop-visible-once
      class="text-center py-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-3xl border border-dashed border-border/50"
    >
      <div
        class="inline-flex p-4 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 mb-4"
      >
        <svg
          class="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-semibold mb-2">All caught up!</h3>
      <p class="text-muted-foreground">
        No pending business verifications at the moment.
      </p>
    </div>

    <!-- Detail Modal -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verification Request</DialogTitle>
          <DialogDescription
            >Review business documentation and details.</DialogDescription
          >
        </DialogHeader>

        <div v-if="selectedVerification" class="space-y-6 py-4">
          <!-- Header Info -->
          <div class="flex items-start gap-4">
            <div
              class="h-16 w-16 rounded-full bg-muted overflow-hidden flex-shrink-0"
            >
              <img
                v-if="selectedVerification.user.avatar_url"
                :src="selectedVerification.user.avatar_url"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="h-full w-full flex items-center justify-center text-xl font-bold bg-primary/10 text-primary"
              >
                {{
                  selectedVerification.user.username
                    .substring(0, 2)
                    .toUpperCase()
                }}
              </div>
            </div>
            <div>
              <h3 class="text-2xl font-bold">
                {{ selectedVerification.user.username }}
              </h3>
              <!-- Assuming business name might be same as username or not separate field in interface -->
              <div class="text-muted-foreground text-sm">
                Email: {{ (selectedVerification.user as any).email || "N/A" }}
              </div>
              <div class="text-muted-foreground text-sm">
                Username: @{{ selectedVerification.user.username }}
              </div>
            </div>
          </div>

          <!-- License Image -->
          <div class="space-y-2">
            <Label>Business License / Documentation</Label>
            <div
              class="rounded-lg border bg-muted/20 p-2 overflow-hidden bg-black/5"
            >
              <img
                :src="selectedVerification.business_image_url"
                alt="Business License"
                class="w-full h-auto max-h-[400px] object-contain rounded"
              />
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <Label>Business Description</Label>
            <div
              class="p-4 rounded-lg bg-muted/30 border text-sm leading-relaxed"
            >
              {{ selectedVerification.business_description }}
            </div>
          </div>

          <!-- Action Area -->
          <div class="border-t pt-4 space-y-4">
            <div class="space-y-2">
              <Label>Review Note (Optional)</Label>
              <Textarea
                v-model="reviewNote"
                placeholder="Add a reason for rejection or an internal note..."
              />
            </div>
          </div>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button
            variant="destructive"
            @click="handleRejectClick"
            :disabled="processing"
          >
            Reject
          </Button>
          <Button
            class="bg-green-600 hover:bg-green-700 text-white"
            @click="handleApprove"
            :disabled="processing"
          >
            Approve & Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
