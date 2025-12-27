<script setup lang="ts">
import { ref } from 'vue';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';

defineProps<{
  images: string[];
}>();

// Lightbox state
const isLightboxOpen = ref(false);
const currentImageIndex = ref(0);

const openLightbox = (index: number) => {
  currentImageIndex.value = index;
  isLightboxOpen.value = true;
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
};

const closeLightbox = () => {
  isLightboxOpen.value = false;
  document.body.style.overflow = ''; // Restore scrolling
};

const nextImage = (images: string[]) => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.length;
};

const prevImage = (images: string[]) => {
  currentImageIndex.value = (currentImageIndex.value - 1 + images.length) % images.length;
};

const handleKeydown = (event: KeyboardEvent, images: string[]) => {
  if (!isLightboxOpen.value) return;
  
  if (event.key === 'Escape') {
    closeLightbox();
  } else if (event.key === 'ArrowRight') {
    nextImage(images);
  } else if (event.key === 'ArrowLeft') {
    prevImage(images);
  }
};
</script>

<template>
  <div>
    <!-- Image Grid -->
    <div
      v-if="images && images.length"
      v-motion-fade-visible-once
      class="grid gap-2 rounded-2xl overflow-hidden"
      :class="{
        'grid-cols-1': images.length === 1,
        'grid-cols-2': images.length >= 2,
      }"
      style="max-height: 400px"
    >
      <!-- First Image (Always visible, takes more space if single) -->
      <div
        class="relative overflow-hidden"
        :class="{
          'col-span-2 row-span-2': images.length === 1,
          'row-span-2': images.length >= 2,
        }"
        :style="{ height: images.length === 1 ? '400px' : '100%' }"
        @click="openLightbox(0)"
      >
        <img
          :src="images[0]"
          alt="Post image 1"
          class="absolute inset-0 size-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
        />
      </div>

      <!-- Second and Third Images (Side column) -->
      <div
        v-if="images.length >= 2"
        class="grid gap-2"
        :class="{
          'grid-rows-1': images.length === 2,
          'grid-rows-2': images.length >= 3,
        }"
      >
        <div 
          class="relative overflow-hidden h-full min-h-[120px]"
          @click="openLightbox(1)"
        >
          <img
            :src="images[1]"
            alt="Post image 2"
            class="absolute inset-0 size-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
          />
        </div>

        <div
          v-if="images.length >= 3"
          class="relative overflow-hidden h-full min-h-[120px]"
          @click="openLightbox(2)"
        >
          <img
            :src="images[2]"
            alt="Post image 3"
            class="absolute inset-0 size-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
          />

          <!-- More images overlay -->
          <div
            v-if="images.length > 3"
            class="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors"
          >
            <span class="text-white text-xl font-bold">
              +{{ images.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Full-Screen Lightbox -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isLightboxOpen"
          class="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          @click.self="closeLightbox"
          @keydown="(e) => handleKeydown(e, images)"
          tabindex="0"
        >
          <!-- Close Button -->
          <button
            class="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            @click="closeLightbox"
            aria-label="Close lightbox"
          >
            <XIcon class="size-6" />
          </button>

          <!-- Image Counter -->
          <div
            class="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm"
          >
            {{ currentImageIndex + 1 }} / {{ images.length }}
          </div>

          <!-- Previous Button -->
          <button
            v-if="images.length > 1"
            class="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            @click="prevImage(images)"
            aria-label="Previous image"
          >
            <ChevronLeftIcon class="size-6" />
          </button>

          <!-- Current Image -->
          <div class="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <img
              :src="images[currentImageIndex]"
              :alt="`Image ${currentImageIndex + 1}`"
              class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          <!-- Next Button -->
          <button
            v-if="images.length > 1"
            class="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            @click="nextImage(images)"
            aria-label="Next image"
          >
            <ChevronRightIcon class="size-6" />
          </button>

          <!-- Thumbnail Strip (bottom) -->
          <div
            v-if="images.length > 1"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-2xl bg-white/10 backdrop-blur-sm max-w-[90vw] overflow-x-auto"
          >
            <button
              v-for="(image, index) in images"
              :key="index"
              class="relative size-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all"
              :class="
                index === currentImageIndex
                  ? 'border-orange-500 scale-110'
                  : 'border-white/30 hover:border-white/60'
              "
              @click="currentImageIndex = index"
            >
              <img
                :src="image"
                :alt="`Thumbnail ${index + 1}`"
                class="size-full object-cover"
              />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
