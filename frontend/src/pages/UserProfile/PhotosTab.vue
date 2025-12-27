<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UserService } from "@/services";
import type { IUserPhotoResponse } from "@/utils/interfaces";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";

interface Props {
  userId: string;
}

const props = defineProps<Props>();
const photos = ref<IUserPhotoResponse[]>([]);
const loading = ref(true);
const selectedPhoto = ref<IUserPhotoResponse | null>(null);
const selectedIndex = ref(0);

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

const openLightbox = (photo: IUserPhotoResponse, index: number) => {
  selectedPhoto.value = photo;
  selectedIndex.value = index;
};

const closeLightbox = () => {
  selectedPhoto.value = null;
};

const nextPhoto = () => {
  if (selectedIndex.value < photos.value.length - 1) {
    selectedIndex.value++;
    selectedPhoto.value = photos.value[selectedIndex.value] as IUserPhotoResponse;
  }
};

const prevPhoto = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
    selectedPhoto.value = photos.value[selectedIndex.value] as IUserPhotoResponse;
  }
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
        @click="openLightbox(photo, index)"
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

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="selectedPhoto"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          @click.self="closeLightbox"
        >
          <!-- Close Button -->
          <Button
            variant="ghost"
            size="icon"
            class="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full z-10"
            @click="closeLightbox"
          >
            <X class="h-6 w-6" />
          </Button>

          <!-- Navigation -->
          <Button
            v-if="selectedIndex > 0"
            variant="ghost"
            size="icon"
            class="absolute left-4 text-white hover:bg-white/20 rounded-full z-10"
            @click.stop="prevPhoto"
          >
            <ChevronLeft class="h-8 w-8" />
          </Button>

          <Button
            v-if="selectedIndex < photos.length - 1"
            variant="ghost"
            size="icon"
            class="absolute right-4 text-white hover:bg-white/20 rounded-full z-10"
            @click.stop="nextPhoto"
          >
            <ChevronRight class="h-8 w-8" />
          </Button>

          <!-- Image -->
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1, transition: { duration: 300 } }"
            class="max-w-4xl max-h-[80vh] mx-4"
          >
            <img
              :src="selectedPhoto.image_url"
              :alt="`Photo ${selectedIndex + 1}`"
              class="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>

          <!-- Counter -->
          <div
            class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm"
          >
            {{ selectedIndex + 1 }} / {{ photos.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
