<script setup lang="ts">
import { computed } from "vue";
import { X, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

interface LightboxImage {
  url: string;
  alt?: string;
}

interface Props {
  open: boolean;
  images: LightboxImage[] | string[];
  currentIndex?: number;
  showCounter?: boolean;
  showNavigation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentIndex: 0,
  showCounter: true,
  showNavigation: true,
});

const emit = defineEmits<{
  "update:open": [value: boolean];
  "update:currentIndex": [value: number];
  close: [];
  next: [];
  prev: [];
}>();

const normalizedImages = computed(() => {
  return props.images.map((img, index) => {
    if (typeof img === "string") {
      return { url: img, alt: `Image ${index + 1}` };
    }
    return img;
  });
});

const currentImage = computed(() => {
  return normalizedImages.value[props.currentIndex];
});

const canGoPrev = computed(() => props.currentIndex > 0);
const canGoNext = computed(() => props.currentIndex < props.images.length - 1);

const close = () => {
  emit("update:open", false);
  emit("close");
};

const next = () => {
  if (canGoNext.value) {
    const newIndex = props.currentIndex + 1;
    emit("update:currentIndex", newIndex);
    emit("next");
  }
};

const prev = () => {
  if (canGoPrev.value) {
    const newIndex = props.currentIndex - 1;
    emit("update:currentIndex", newIndex);
    emit("prev");
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.open) return;
  
  switch (e.key) {
    case "Escape":
      close();
      break;
    case "ArrowLeft":
      prev();
      break;
    case "ArrowRight":
      next();
      break;
  }
};

// Add keyboard event listener
if (typeof window !== "undefined") {
  window.addEventListener("keydown", handleKeydown);
}
</script>

<template>
  <div>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        @click.self="close"
      >
        <!-- Close Button -->
        <Button
          variant="ghost"
          size="icon"
          class="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full z-10"
          @click="close"
        >
          <X class="h-6 w-6" />
        </Button>

        <!-- Navigation -->
        <template v-if="showNavigation && images.length > 1">
          <Button
            v-if="canGoPrev"
            variant="ghost"
            size="icon"
            class="absolute left-4 text-white hover:bg-white/20 rounded-full z-10"
            @click.stop="prev"
          >
            <ChevronLeft class="h-8 w-8" />
          </Button>

          <Button
            v-if="canGoNext"
            variant="ghost"
            size="icon"
            class="absolute right-4 text-white hover:bg-white/20 rounded-full z-10"
            @click.stop="next"
          >
            <ChevronRight class="h-8 w-8" />
          </Button>
        </template>

        <!-- Image -->
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 300 } }"
          class="max-w-4xl max-h-[80vh] mx-4"
        >
          <img
            v-if="currentImage"
            :src="currentImage.url"
            :alt="currentImage.alt"
            class="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>

        <!-- Counter -->
        <div
          v-if="showCounter && images.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm"
        >
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </Transition>
  </Teleport>
  </div>
</template>
