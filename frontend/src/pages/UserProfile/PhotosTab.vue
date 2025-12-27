<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { UserService } from "@/services";
import type { IUserPhotoResponse } from "@/utils/interfaces";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Camera } from "lucide-vue-next";
import Lightbox from "@/components/common/Lightbox.vue";

interface Props {
  userId: string;
}

const props = defineProps<Props>();
const photos = ref<IUserPhotoResponse[]>([]);
const loading = ref(true);
const lightboxOpen = ref(false);
const selectedIndex = ref(0);

const imageUrls = computed(() => photos.value.map(photo => photo.image_url));

onMounted(async () => {
  try {
    const response = await UserService.getUserPhotos(props.userId, {
      page: 1,
      limit: 12,
    });
    photos.value = response.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const openLightbox = (index: number) => {
  selectedIndex.value = index;
  lightboxOpen.value = true;
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
        <div class="p-2 rounded-full bg-purple-500/10">
          <ImageIcon class="h-5 w-5 text-purple-500" />
        </div>
        Photos
        <Badge
          v-if="photos.length"
          variant="secondary"
          class="ml-1 bg-secondary/80 text-muted-foreground font-normal"
        >
          {{ photos.length }}
        </Badge>
      </h3>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
    >
      <Skeleton
        v-for="i in 8"
        :key="i"
        class="aspect-square w-full rounded-2xl"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="photos.length === 0"
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
      class="flex flex-col items-center justify-center py-16 text-center rounded-3xl bg-secondary/20 border border-dashed border-border/60"
    >
      <div class="p-4 rounded-full bg-secondary/50 mb-4">
        <Camera class="h-8 w-8 text-muted-foreground" />
      </div>
      <p class="font-medium text-foreground mb-1">No photos yet</p>
      <p class="text-sm text-muted-foreground">
        Photos uploaded to reviews and posts will appear here.
      </p>
    </div>

    <!-- Photos Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="(photo, index) in photos"
        :key="photo.id"
        v-motion
        :initial="{ opacity: 0, scale: 0.9 }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: { delay: index * 50, duration: 400 },
        }"
        class="relative group aspect-square overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
        @click="openLightbox(index)"
      >
        <img
          :src="photo.image_url"
          alt="User photo"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div class="absolute bottom-3 left-3 right-3">
            <div class="flex items-center gap-2 text-white text-sm">
              <ImageIcon class="h-4 w-4" />
              <span class="font-medium">View</span>
            </div>
          </div>
        </div>

        <!-- Ring on hover -->
        <div
          class="absolute inset-0 rounded-2xl ring-2 ring-orange-500 ring-offset-2 ring-offset-background opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>
      </div>
    </div>

    <!-- Lightbox -->
    <Lightbox
      v-model:open="lightboxOpen"
      v-model:current-index="selectedIndex"
      :images="imageUrls"
    />
  </div>
</template>
