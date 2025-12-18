<script setup lang="ts">
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { HomeIcon, MapIcon, CompassIcon, SearchIcon } from "lucide-vue-next";

const router = useRouter();

const backToHome = () => {
  router.push({ name: "home" });
};

const goToForums = () => {
  router.push({ name: "forums-home" });
};

const goToSearch = () => {
  router.push({ name: "search" });
};
</script>

<template>
  <div
    class="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-8"
  >
    <div class="mx-auto w-full max-w-2xl text-center space-y-4">
      <!-- Animated Icon -->
      <div class="relative inline-block">
        <div class="compass-container">
          <CompassIcon class="size-32 text-orange-500 compass-icon" />
        </div>
      </div>

      <!-- 404 Text -->
      <div v-motion-pop-visible-once class="space-y-2">
        <h1
          class="text-8xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
        >
          404
        </h1>
        <h2 class="text-3xl font-bold tracking-tight">
          Oops! You've wandered off the map
        </h2>
        <p class="text-lg text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track!
        </p>
      </div>

      <!-- Action Buttons -->
      <div
        class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
      >
        <Button
          size="lg"
          @click="backToHome"
          class="h-14 rounded-2xl bg-orange-500 px-8 text-lg font-semibold text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
        >
          <HomeIcon class="mr-2 size-5" />
          Back to Home
        </Button>
        <Button
          size="lg"
          variant="outline"
          @click="goToSearch"
          class="h-14 rounded-2xl px-8 text-lg font-semibold border-2 border-border/50 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-300"
        >
          <SearchIcon class="mr-2 size-5" />
          Search
        </Button>
      </div>

      <!-- Quick Links -->
      <div class="pt-6">
        <p class="text-sm text-muted-foreground mb-4">
          Or try these popular destinations:
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="ghost"
            @click="goToForums"
            class="rounded-xl text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-all duration-200"
          >
            <MapIcon class="mr-2 size-4" />
            Travel Forums
          </Button>
          <span class="text-muted-foreground/50">•</span>
          <Button
            variant="ghost"
            @click="backToHome"
            class="rounded-xl text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-all duration-200"
          >
            <CompassIcon class="mr-2 size-4" />
            Explore Destinations
          </Button>
        </div>
      </div>

      <!-- Decorative Elements -->
      <div
        class="fixed top-20 left-10 size-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"
      ></div>
      <div
        class="fixed bottom-20 right-10 size-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.compass-container {
  animation: float 3s ease-in-out infinite;
}

.compass-icon {
  animation: spin-slow 8s linear infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes spin-slow {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(15deg);
  }
  50% {
    transform: rotate(0deg);
  }
  75% {
    transform: rotate(-15deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
