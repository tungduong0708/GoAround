<script setup lang="ts">
defineProps<{
  images: string[];
}>();

// Simple lightbox state (could be expanded for full gallery)
</script>

<template>
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
      <div class="relative overflow-hidden h-full min-h-[120px]">
        <img
          :src="images[1]"
          alt="Post image 2"
          class="absolute inset-0 size-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
        />
      </div>

      <div
        v-if="images.length >= 3"
        class="relative overflow-hidden h-full min-h-[120px]"
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
</template>
