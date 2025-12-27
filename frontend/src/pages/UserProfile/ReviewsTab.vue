<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UserService } from "@/services";
import type { IUserReviewResponse } from "@/utils/interfaces";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, ChevronRight, Quote } from "lucide-vue-next";
import { useRouter } from "vue-router";

interface Props {
  userId: string;
}

const props = defineProps<Props>();
const reviews = ref<IUserReviewResponse[]>([]);
const loading = ref(true);
const router = useRouter();

onMounted(async () => {
  try {
    const response = await UserService.getUserReviews(props.userId, {
      page: 1,
      limit: 10,
    });
    reviews.value = response.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const navigateToPlace = (placeId: string) => {
  router.push(`/places/${placeId}`);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Section Header -->
    <div
      v-motion-slide-visible-once-left
      class="flex items-center justify-between"
    >
      <h3 class="text-xl font-semibold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-full bg-yellow-500/10">
          <Star class="h-5 w-5 text-yellow-500 fill-yellow-500" />
        </div>
        Reviews
        <Badge
          v-if="reviews.length"
          variant="secondary"
          class="ml-1 bg-secondary/80 text-muted-foreground font-normal"
        >
          {{ reviews.length }}
        </Badge>
      </h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <div
        v-for="i in 3"
        :key="i"
        class="flex gap-6 p-6 rounded-2xl border border-border/40 bg-secondary/20"
      >
        <Skeleton class="h-32 w-32 rounded-2xl shrink-0" />
        <div class="space-y-3 flex-1">
          <Skeleton class="h-7 w-2/3" />
          <div class="flex gap-1">
            <Skeleton v-for="j in 5" :key="j" class="h-5 w-5" />
          </div>
          <Skeleton class="h-16 w-full" />
          <Skeleton class="h-4 w-24" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="reviews.length === 0"
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
      class="flex flex-col items-center justify-center py-16 text-center rounded-3xl bg-secondary/20 border border-dashed border-border/60"
    >
      <div class="p-4 rounded-full bg-secondary/50 mb-4">
        <Star class="h-8 w-8 text-muted-foreground" />
      </div>
      <p class="font-medium text-foreground mb-1">No reviews yet</p>
      <p class="text-sm text-muted-foreground">
        Reviews of places visited will appear here.
      </p>
    </div>

    <!-- Reviews List -->
    <div v-else class="space-y-6">
      <div
        v-for="(review, index) in reviews"
        :key="review.id"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { delay: index * 100, duration: 400 },
        }"
        class="group relative flex flex-col md:flex-row gap-6 p-6 bg-card rounded-3xl border border-border/40 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden cursor-pointer"
        @click="navigateToPlace(review.place.id)"
      >
        <!-- Decorative Quote -->
        <Quote
          class="absolute top-4 right-4 h-16 w-16 text-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        <!-- Place Image -->
        <div class="shrink-0">
          <div class="relative overflow-hidden rounded-2xl">
            <img
              v-if="review.place?.main_image_url"
              :src="review.place.main_image_url"
              :alt="review.place.name"
              class="h-32 w-32 md:h-40 md:w-40 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
              v-else
              class="h-32 w-32 md:h-40 md:w-40 bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl flex items-center justify-center text-muted-foreground"
            >
              <MapPin class="h-8 w-8" />
            </div>

            <!-- Rating Badge Overlay -->
            <div
              class="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm flex items-center gap-1"
            >
              <Star class="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
              <span class="text-sm font-semibold text-white">{{
                review.rating
              }}</span>
            </div>
          </div>
        </div>

        <!-- Review Content -->
        <div class="space-y-3 flex-1 min-w-0">
          <div
            class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
          >
            <div>
              <h4
                class="font-bold text-xl text-foreground group-hover:text-orange-600 transition-colors flex items-center gap-2"
              >
                {{ review.place.name }}
                <ChevronRight
                  class="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                />
              </h4>

              <!-- Star Rating -->
              <div class="flex items-center gap-1 mt-2">
                <Star
                  v-for="i in 5"
                  :key="i"
                  class="h-5 w-5 transition-transform duration-200"
                  :class="[
                    i <= review.rating
                      ? 'fill-orange-400 text-orange-400'
                      : 'text-gray-300 dark:text-gray-600',
                    'hover:scale-110',
                  ]"
                />
                <span class="text-sm font-semibold ml-2 text-foreground">
                  {{ review.rating }}.0
                </span>
              </div>
            </div>

            <div
              class="flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <Clock class="h-4 w-4" />
              <span>{{ formatDate(review.created_at) }}</span>
            </div>
          </div>

          <!-- Review Text -->
          <p class="text-muted-foreground leading-relaxed line-clamp-3">
            {{ review.review_text }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
