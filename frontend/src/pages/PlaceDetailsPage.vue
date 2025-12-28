<script setup lang="ts">
import { usePlaceDetails } from "@/composables";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import GoogleMap from "@/components/common/GoogleMap.vue";
import BookmarkButton from "@/components/common/BookmarkButton.vue";
import WriteReviewModal from "@/components/common/WriteReviewModal.vue";
import ReviewCard from "@/components/common/ReviewCard.vue";
import Lightbox from "@/components/common/Lightbox.vue";
import { PlacesService } from "@/services";
import type { IReviewSchema } from "@/utils/interfaces";
import {
  MapPinIcon,
  StarIcon,
  ClockIcon,
  TicketIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
} from "lucide-vue-next";
import { onMounted, ref, computed, watch } from "vue";

const {
  place,
  loading,
  error,
  heroImage,
  galleryImages,
  locationLabel,
  coordinates,
  tags,
  priceLabel,
  openHoursLabel,
  openingHours,
} = usePlaceDetails();

const showAllHours = ref(false);
const showWriteReviewModal = ref(false);
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);
const reviews = ref<IReviewSchema[]>([]);
const reviewsLoading = ref(false);
const reviewsError = ref<string | null>(null);
const totalReviews = ref(0);

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.value.length).toFixed(1);
});

const allImages = computed(() => {
  const images: string[] = [];
  
  // Add main image first
  if (place.value?.main_image_url || heroImage.value) {
    images.push((place.value?.main_image_url || heroImage.value) as string);
  }
  
  // Add gallery images
  if (galleryImages.value.length > 0) {
    images.push(...galleryImages.value);
  }
  
  return images;
});

const openLightbox = (index: number) => {
  lightboxIndex.value = index;
  lightboxOpen.value = true;
};

const fetchReviews = async () => {
  if (!place.value?.id) return;
  
  reviewsLoading.value = true;
  reviewsError.value = null;
  
  try {
    const response = await PlacesService.getReviewsForPlace(place.value.id, {
      page: 1,
      limit: 10,
    });
    console.log("Reviews response:", response);
    console.log("Reviews data:", response.data);
    if (response.data.length > 0) {
      console.log("First review:", response.data[0]);
    }
    reviews.value = response.data;
    totalReviews.value = response.meta?.total_items || response.data.length;
  } catch (error: any) {
    console.error("Failed to fetch reviews:", error);
    reviewsError.value = "Failed to load reviews";
  } finally {
    reviewsLoading.value = false;
  }
};

const handleReviewSubmitted = async () => {
  // Refresh reviews after a new review is submitted
  showWriteReviewModal.value = false;
  await fetchReviews();
};

// Watch for place to be loaded, then fetch reviews
watch(() => place.value?.id, (newId) => {
  if (newId) {
    fetchReviews();
  }
}, { immediate: true });

onMounted(() => {
  console.log(place.value?.opening_hours);
});
</script>

<template>
  <div>
    <div class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-8">
      <Skeleton class="h-[400px] w-full rounded-3xl" />
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="space-y-4 lg:col-span-2">
          <Skeleton class="h-12 w-3/4" />
          <Skeleton class="h-6 w-1/2" />
          <Skeleton class="h-32 w-full" />
        </div>
        <div class="lg:col-span-1">
          <Skeleton class="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex h-64 flex-col items-center justify-center text-center"
    >
      <p class="text-lg font-semibold text-destructive">{{ error }}</p>
      <Button variant="outline" class="mt-4" @click="$router.go(0)"
        >Try Again</Button
      >
    </div>

    <!-- Content -->
    <div v-else-if="place" class="space-y-8">
      <!-- Image Gallery -->
      <div
        v-motion-slide-visible-once-top
        class="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 h-[400px] md:h-[500px]"
      >
        <div
          class="relative col-span-1 md:col-span-4 md:row-span-2 overflow-hidden rounded-3xl cursor-pointer group"
          @click="openLightbox(0)"
        >
          <img
            v-if="place?.main_image_url || heroImage" 
            :src="place?.main_image_url || heroImage"
            :alt="place?.name"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div class="absolute right-4 top-4 z-10">
            <BookmarkButton v-if="place && place.average_rating !== undefined" :place="place as any" variant="icon" size="lg" />
          </div>
          <!-- Overlay on hover -->
          <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"
          ></div>
        </div>
      </div>

      <!-- Additional Images Row -->
      <div v-if="galleryImages.length > 0" class="grid grid-cols-4 gap-4">
        <div
          v-for="(img, index) in galleryImages.slice(0, 4)"
          :key="index"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
          class="aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer hover:opacity-80 transition-all duration-300 group relative"
          @click="openLightbox(index + 1)"
        >
          <img
            :src="img"
            :alt="place?.name"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <!-- Show "+X more" overlay on last image if there are more images -->
          <div
            v-if="index === 3 && galleryImages.length > 4"
            class="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <span class="text-white text-2xl font-semibold">
              +{{ galleryImages.length - 4 }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-10">
          <!-- Header -->
          <div v-motion-slide-visible-once-left class="space-y-2">
            <h1 class="text-4xl font-bold tracking-tight text-foreground">
              {{ place.name }}
            </h1>
            <div class="flex items-center gap-4 text-muted-foreground">
              <div class="flex items-center gap-1 text-yellow-500">
                <StarIcon class="size-5 fill-current" />
                <span class="font-semibold text-foreground">
                  {{ totalReviews > 0 ? averageRating : 'N/A' }}
                </span>
                <span class="text-muted-foreground"
                  >({{ totalReviews }} review{{ totalReviews !== 1 ? 's' : '' }})</span
                >
              </div>
              <div class="flex items-center gap-1">
                <MapPinIcon class="size-5" />
                <span>{{ locationLabel }}</span>
              </div>
            </div>
          </div>

          <!-- About -->
          <section
            v-motion-slide-visible-once-left
            :delay="100"
            class="space-y-4"
          >
            <h2 class="text-2xl font-semibold">About this place</h2>
            <p class="leading-relaxed text-muted-foreground">
              {{ place.description }}
            </p>
          </section>

          <!-- Highlights -->
          <section
            v-motion-slide-visible-once-left
            :delay="200"
            class="space-y-4"
          >
            <h2 class="text-2xl font-semibold">Highlight</h2>
            <div class="flex flex-wrap gap-3">
              <Badge
                v-for="tag in tags"
                :key="tag"
                variant="secondary"
                class="px-4 py-2 text-sm font-normal rounded-full bg-secondary/50 hover:bg-secondary/70"
              >
                <span class="mr-2 text-primary">•</span>
                {{ tag }}
              </Badge>
              <p v-if="!tags.length" class="text-sm text-muted-foreground">
                No highlights listed
              </p>
            </div>
          </section>

          <!-- Location Map -->
          <section
            v-motion-slide-visible-once-left
            :delay="300"
            class="space-y-4"
          >
            <h2 class="text-2xl font-semibold">Location map</h2>
            <div class="h-80 w-full rounded-3xl shadow-sm overflow-hidden">
              <GoogleMap
                v-if="coordinates"
                :lat="coordinates.lat"
                :lng="coordinates.lng"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground"
              >
                Location not available
              </div>
            </div>
          </section>

          <!-- Reviews -->
          <section
            v-motion-slide-visible-once-left
            :delay="400"
            class="space-y-6"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-semibold">Reviews</h2>
              <Button
                variant="default"
                class="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                @click="showWriteReviewModal = true"
                >Write a Review</Button
              >
            </div>
            <!-- Loading State -->
            <div v-if="reviewsLoading" class="flex items-center justify-center py-8">
              <Loader2 class="h-8 w-8 animate-spin text-coral" />
            </div>

            <!-- Error State -->
            <div
              v-else-if="reviewsError"
              class="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-destructive"
            >
              <p class="font-medium">{{ reviewsError }}</p>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="reviews.length === 0"
              class="rounded-2xl border border-dashed border-border/60 p-6 text-muted-foreground"
            >
              <p class="font-medium text-foreground">No reviews yet</p>
              <p class="text-sm">
                Be the first to share your experience at
                {{ place.name }}.
              </p>
            </div>

            <!-- Reviews List -->
            <div v-else class="space-y-6">
              <ReviewCard
                v-for="review in reviews"
                :key="review.id"
                :review="review"
              />
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 space-y-6">
            <Card
              class="overflow-hidden rounded-3xl border-none bg-secondary/30 shadow-none"
            >
              <CardContent class="p-6 space-y-6">
                <div class="space-y-4">
                  <div class="space-y-3">
                    <div class="flex items-center gap-3">
                      <div class="rounded-full bg-background p-2 shadow-sm">
                        <ClockIcon class="size-5 text-foreground" />
                      </div>
                      <p class="text-sm font-medium text-muted-foreground">
                        Opening Hours
                      </p>
                    </div>

                    <div
                      v-if="openingHours && openingHours.length > 0"
                      class="space-y-2"
                    >
                      <!-- Today's hours highlighted -->
                      <div
                        v-for="(hour, index) in openingHours"
                        :key="index"
                        v-show="showAllHours || hour.isToday"
                        :class="[
                          'flex items-center justify-between text-sm rounded-lg px-3 py-2 transition-colors',
                          hour.isToday
                            ? 'bg-orange-500/10 border border-orange-500/20'
                            : 'bg-background/50',
                        ]"
                      >
                        <span
                          :class="[
                            'font-medium',
                            hour.isToday
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-foreground',
                          ]"
                        >
                          {{ hour.day }}
                          <span v-if="hour.isToday" class="text-xs ml-1">
                            (Today)
                          </span>
                        </span>
                        <span
                          :class="[
                            'font-semibold',
                            hour.isClosed
                              ? 'text-muted-foreground'
                              : hour.isToday
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-foreground',
                          ]"
                        >
                          {{ hour.time }}
                        </span>
                      </div>

                      <!-- Show/Hide All Button -->
                      <Button
                        variant="ghost"
                        size="sm"
                        class="w-full text-xs text-muted-foreground hover:text-foreground"
                        @click="showAllHours = !showAllHours"
                      >
                        <span class="flex items-center gap-1">
                          {{ showAllHours ? "Show less" : "Show all hours" }}
                          <ChevronDownIcon
                            v-if="!showAllHours"
                            class="size-3"
                          />
                          <ChevronUpIcon v-else class="size-3" />
                        </span>
                      </Button>
                    </div>

                    <p v-else class="text-sm text-muted-foreground ml-11">
                      {{ openHoursLabel }}
                    </p>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="rounded-full bg-background p-2 shadow-sm">
                      <TicketIcon class="size-5 text-foreground" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">
                        Price
                      </p>
                      <p class="font-semibold">
                        {{ priceLabel }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="rounded-full bg-background p-2 shadow-sm">
                      <TagIcon class="size-5 text-foreground" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">
                        Place Type
                      </p>
                      <p class="font-semibold">
                        {{ place.place_type }}
                      </p>
                    </div>
                  </div>
                </div>

                <!--
                <Button
                  class="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 text-lg shadow-lg shadow-orange-500/20"
                >
                  Book Now
                </Button>
                -->
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Write Review Modal -->
    <WriteReviewModal
      v-if="place"
      v-model:open="showWriteReviewModal"
      :place-id="place.id"
      :place-name="place.name"
      @success="handleReviewSubmitted"
    />

    <!-- Image Lightbox -->
    <Lightbox
      v-model:open="lightboxOpen"
      v-model:current-index="lightboxIndex"
      :images="allImages"
    />
  </div>
</template>

<style scoped></style>
