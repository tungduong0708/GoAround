<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-vue-next";
import Lightbox from "@/components/common/Lightbox.vue";
import type { IReviewSchema } from "@/utils/interfaces";

const props = defineProps<{
  review: IReviewSchema;
}>();

const formattedDate = computed(() => {
  const date = new Date(props.review.created_at);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const userInitials = computed(() => {
  const username = props.review.user?.username || "Anonymous";
  return username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const displayName = computed(() => {
  return props.review.user?.username || "Anonymous User";
});

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);

const reviewImages = computed(() => {
  if (!props.review.images || props.review.images.length === 0) return [];
  
  // Handle both IReviewImageSchema[] and string[] formats
  return props.review.images.map((img, index) => {
    if (typeof img === 'string') {
      return { id: `img-${index}`, image_url: img };
    }
    return img;
  });
});

const imageUrls = computed(() => {
  return reviewImages.value.map(img => img.image_url);
});

const openLightbox = (index: number) => {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
};

onMounted(() => {
  console.log('ReviewCard mounted with review:', props.review); 
});
</script>

<template>
  <div class="border-b border-border pb-6 last:border-0">
    <div class="flex gap-4">
      <!-- Avatar -->
      <Avatar class="h-12 w-12">
        <AvatarImage :src="review.user?.avatar_url || ''" :alt="displayName" />
        <AvatarFallback class="bg-coral/10 text-coral">
          {{ userInitials }}
        </AvatarFallback>
      </Avatar>

      <!-- Review Content -->
      <div class="flex-1 space-y-3">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4">
          <div>
            <h4 class="font-semibold">{{ displayName }}</h4>
            <p class="text-sm text-muted-foreground">{{ formattedDate }}</p>
          </div>

          <!-- Rating -->
          <div class="flex items-center gap-1">
            <Star
              v-for="star in 5"
              :key="star"
              :size="16"
              :class="[
                star <= review.rating
                  ? 'fill-orange-500 text-orange-500'
                  : 'text-gray-300',
              ]"
            />
          </div>
        </div>

        <!-- Review Text -->
        <p v-if="review.review_text" class="text-foreground leading-relaxed">
          {{ review.review_text }}
        </p>

        <!-- Review Images -->
        <div
          v-if="reviewImages.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
        >
          <div
            v-for="(image, index) in reviewImages"
            :key="image.id"
            class="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group relative"
            @click="openLightbox(index)"
          >
            <img
              :src="image.image_url"
              :alt="`Review image ${index + 1}`"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Lightbox -->
  <Lightbox
    v-model:open="lightboxOpen"
    v-model:current-index="lightboxIndex"
    :images="imageUrls"
  />
</template>
