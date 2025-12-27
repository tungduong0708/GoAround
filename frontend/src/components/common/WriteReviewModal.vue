<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-vue-next";
import { ReviewsService } from "@/services";
import type { IReviewCreate } from "@/utils/interfaces";
import ImageUpload from "@/components/common/ImageUpload.vue";

const props = defineProps<{
  open: boolean;
  placeId: string;
  placeName?: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  success: [];
}>();

const rating = ref(0);
const hoverRating = ref(0);
const reviewText = ref("");
const images = ref<string[]>([]);
const submitting = ref(false);
const errorMessage = ref<string | null>(null);

const isValid = computed(() => rating.value > 0);

const handleOpenChange = (open: boolean) => {
  emit("update:open", open);
  if (!open) {
    // Reset form when closing
    rating.value = 0;
    hoverRating.value = 0;
    reviewText.value = "";
    images.value = [];
    errorMessage.value = null;
  }
};

const setRating = (value: number) => {
  rating.value = value;
};

const handleImagesUpdate = (urls: string | string[]) => {
  console.log('Images updated:', urls);
  images.value = Array.isArray(urls) ? urls : (urls ? [urls] : []);
};

const handleSubmit = async () => {
  if (!isValid.value || submitting.value) return;

  submitting.value = true;
  errorMessage.value = null;

  try {
    console.log('Submitting review with data:', {
      place_id: props.placeId,
      rating: rating.value,
      review_text: reviewText.value,
      images: images.value,
    });
    const reviewData: IReviewCreate = {
      place_id: props.placeId,
      rating: rating.value,
      review_text: reviewText.value.trim() || null,
      images: images.value.length > 0 ? images.value : undefined,
    };

    await ReviewsService.createReview(reviewData);
    emit("success");
    emit("update:open", false);
  } catch (error: any) {
    console.error("Failed to submit review:", error);
    errorMessage.value = error?.response?.data?.detail || "Failed to submit review. Please try again.";
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="text-2xl">Share your experience</DialogTitle>
        <DialogDescription v-if="placeName">
          How was your visit to <strong>{{ placeName }}</strong>?
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 py-4">
        <!-- Rating -->
        <div class="space-y-3">
          <label class="text-sm font-medium">Rating</label>
          <div class="flex gap-2">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="transition-transform hover:scale-110 focus:outline-none"
              @click="setRating(star)"
              @mouseenter="hoverRating = star"
              @mouseleave="hoverRating = 0"
            >
              <Star
                :size="32"
                :class="[
                  'transition-colors',
                  (hoverRating || rating) >= star
                    ? 'fill-orange-500 text-orange-500'
                    : 'text-gray-300',
                ]"
              />
            </button>
          </div>
          <p v-if="rating > 0" class="text-sm text-muted-foreground">
            {{ rating }} star{{ rating > 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Review Text -->
        <div class="space-y-3">
          <label class="text-sm font-medium">Your Review</label>
          <Textarea
            v-model="reviewText"
            placeholder="Share your thoughts about this place..."
            class="min-h-[120px] resize-none"
            :disabled="submitting"
          />
        </div>

        <!-- Image Upload -->
        <div class="space-y-3">
          <label class="text-sm font-medium">Add Photos (Optional)</label>
          <ImageUpload
            v-model="images"
            upload-type="review"
            :multiple="true"
            :max-files="5"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            :max-size-in-m-b="5"
            :disabled="submitting"
            @update:model-value="handleImagesUpdate"
          />
          <p class="text-xs text-muted-foreground">
            Upload up to 5 photos (JPG, PNG, max 5MB each)
          </p>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm"
        >
          {{ errorMessage }}
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end">
        <Button
          variant="outline"
          @click="handleOpenChange(false)"
          :disabled="submitting"
        >
          Cancel
        </Button>
        <Button
          class="bg-orange-500 hover:bg-orange-600 text-white"
          @click="handleSubmit"
          :disabled="!isValid || submitting"
        >
          <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
          Submit Review
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
