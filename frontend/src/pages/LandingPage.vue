<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Globe, Users } from "lucide-vue-next";
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Hero Section -->
    <section
      class="relative flex flex-col items-center justify-center px-4 py-24 text-center overflow-hidden lg:py-32"
    >
      <!-- Background Gradients -->
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none"
      >
        <div
          class="absolute top-20 left-10 w-72 h-72 bg-orange-400/20 rounded-full blur-[100px]"
        />
        <div
          class="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px]"
        />
      </div>

      <div class="relative z-10 max-w-4xl mx-auto space-y-8">
        <div v-motion-slide-visible-once-top>
          <span
            class="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-orange-600 uppercase bg-orange-100 dark:bg-orange-500/10 rounded-full"
          >
            Explore the World
          </span>
        </div>

        <h1
          v-motion-slide-visible-once-bottom
          :delay="200"
          class="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl"
        >
          Discover your next
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600"
          >
            Adventure
          </span>
        </h1>

        <p
          v-motion-slide-visible-once-bottom
          :delay="300"
          class="max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl"
        >
          Join our community of travelers. Plan your trips, share your
          experiences, and find hidden gems around the globe.
        </p>

        <div
          v-motion-slide-visible-once-bottom
          :delay="400"
          class="flex flex-wrap justify-center gap-4"
        >
          <Button size="lg" class="h-12 px-8 text-lg rounded-full" as-child>
            <RouterLink to="/signup">
              Get Started
              <ArrowRight class="ml-2 size-5" />
            </RouterLink>
          </Button>
          <Button
            variant="outline"
            size="lg"
            class="h-12 px-8 text-lg rounded-full"
            as-child
          >
            <RouterLink to="/search"> Explore Places </RouterLink>
          </Button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-muted/30">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-12 md:grid-cols-3">
          <!-- Feature 1 -->
          <div
            v-motion-slide-visible-once-bottom
            :delay="200"
            class="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-3xl shadow-sm border hover:shadow-md transition-shadow"
          >
            <div
              class="flex items-center justify-center size-16 text-orange-600 bg-orange-100 rounded-2xl dark:bg-orange-900/20"
            >
              <Globe class="size-8" />
            </div>
            <h3 class="text-xl font-bold">Global Destinations</h3>
            <p class="text-muted-foreground">
              Access a vast database of locations, landmarks, and hidden gems
              from every corner of the world.
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            v-motion-slide-visible-once-bottom
            :delay="300"
            class="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-3xl shadow-sm border hover:shadow-md transition-shadow"
          >
            <div
              class="flex items-center justify-center size-16 text-blue-600 bg-blue-100 rounded-2xl dark:bg-blue-900/20"
            >
              <MapPin class="size-8" />
            </div>
            <h3 class="text-xl font-bold">Smart Trip Planning</h3>
            <p class="text-muted-foreground">
              Create detailed itineraries, manage your stops, and optimize your
              travel routes effortlessly.
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            v-motion-slide-visible-once-bottom
            :delay="400"
            class="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-3xl shadow-sm border hover:shadow-md transition-shadow"
          >
            <div
              class="flex items-center justify-center size-16 text-green-600 bg-green-100 rounded-2xl dark:bg-green-900/20"
            >
              <Users class="size-8" />
            </div>
            <h3 class="text-xl font-bold">Community Forums</h3>
            <p class="text-muted-foreground">
              Connect with fellow travelers, ask questions, and share your
              travel stories and photos.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
