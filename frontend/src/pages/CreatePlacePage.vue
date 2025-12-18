<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { HammerIcon, ArrowLeft } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center bg-background"
  >
    <div v-motion-pop-visible-once class="relative mb-8">
      <div
        class="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full"
      ></div>
      <div
        class="relative flex items-center justify-center size-32 bg-yellow-100 dark:bg-yellow-900/30 rounded-3xl"
      >
        <HammerIcon class="size-16 text-yellow-600 dark:text-yellow-400" />
      </div>
    </div>

    <h1
      v-motion-slide-visible-once-bottom
      class="text-4xl font-bold tracking-tight mb-4"
    >
      We're Building Something Great
    </h1>

    <p
      v-motion-slide-visible-once-bottom
      :delay="100"
      class="max-w-md mb-8 text-lg text-muted-foreground"
    >
      The "Create Place" feature is currently under construction. Check back
      soon for updates!
    </p>

    <div v-motion-slide-visible-once-bottom :delay="200">
      <Button size="lg" @click="router.back()">
        <ArrowLeft class="mr-2 size-4" />
        Go Back
      </Button>
    </div>
  </div>
</template>

<style scoped></style>
