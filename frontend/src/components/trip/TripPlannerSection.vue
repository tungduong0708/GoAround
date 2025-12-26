<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { IPlacePublic } from "@/utils/interfaces";
import { StarIcon, Compass, ArrowRight } from "lucide-vue-next";

const props = defineProps<{
  trips: IPlacePublic[];
}>();

const carouselApi = ref<CarouselApi | null>(null);
let autoplayTimer: ReturnType<typeof setInterval> | null = null;
const AUTOPLAY_DELAY = 5000;

const roundedRating = (trip: IPlacePublic) =>
  Math.max(0, Math.min(5, Math.round(trip.average_rating ?? 0)));
const priceLabel = (trip: IPlacePublic) => {
  if (typeof trip.price_range === "number")
    return `€${trip.price_range}/Day`;
  return "From €—";
};
const locationLabel = (trip: IPlacePublic) =>
  [trip.city, trip.country].filter(Boolean).join(", ");

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
};

const startAutoplay = () => {
  stopAutoplay();
  if (!carouselApi.value || props.trips.length <= 1) return;
  autoplayTimer = setInterval(() => {
    if (!carouselApi.value) return;
    if (carouselApi.value.canScrollNext()) {
      carouselApi.value.scrollNext();
    } else {
      carouselApi.value.scrollTo(0);
    }
  }, AUTOPLAY_DELAY);
};

const handleInitApi = (api: CarouselApi) => {
  carouselApi.value = api;
  startAutoplay();
};

watch(
  () => props.trips.length,
  () => startAutoplay()
);
onBeforeUnmount(stopAutoplay);
</script>

<template>
  <section
    class="relative px-4 py-16 sm:px-6 lg:px-8 overflow-hidden bg-[radial-gradient(120%_120%_at_10%_10%,_#fef2ef_0%,_transparent_45%),radial-gradient(90%_90%_at_90%_0%,_#e2e8f0_0%,_transparent_55%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_65%)] dark:bg-[radial-gradient(120%_120%_at_10%_10%,_rgba(244,121,96,0.15)_0%,_transparent_45%),radial-gradient(90%_90%_at_90%_0%,_rgba(100,116,139,0.2)_0%,_transparent_55%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--background))_100%)]"
  >
    <!-- Main Container -->
    <div
      class="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 p-8 sm:p-12 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl"
    >
      <!-- Decorative blurs -->
      <div
        class="absolute -top-32 -left-16 w-72 h-72 rounded-full bg-coral/30 blur-[60px] opacity-40"
        aria-hidden="true"
      />
      <div
        class="absolute -bottom-32 -right-12 w-60 h-60 rounded-full bg-indigo-400/20 blur-[50px] opacity-30"
        aria-hidden="true"
      />

      <!-- Inner glow -->
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_rgba(244,121,96,0.08),_transparent_45%),radial-gradient(circle_at_80%_70%,_rgba(79,70,229,0.06),_transparent_40%)] pointer-events-none"
        aria-hidden="true"
      />

      <div
        class="relative grid gap-10 lg:grid-cols-[1.1fr_minmax(320px,480px)] lg:items-center"
      >
        <!-- Left Content -->
        <div v-motion-slide-visible-once-left class="space-y-8">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 text-coral"
          >
            <Compass :size="16" />
            <span class="text-xs font-bold uppercase tracking-[0.25em]"
              >Trip Planners</span
            >
          </div>

          <div class="space-y-5">
            <h2
              class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-slate-900 dark:text-white tracking-tight"
            >
              20 years from now you will be more disappointed by the things that
              <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-coral to-coral-darker"
                >you didn't do.</span
              >
            </h2>
            <div
              class="h-1.5 w-28 rounded-full bg-gradient-to-r from-coral via-coral-dark to-coral-darker"
            />
            <p
              class="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300"
            >
              Stop regretting and start travelling—throw off the bowlines,
              explore bold places, and let us handle the plan.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <Button
              class="group rounded-full bg-coral px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-coral/30 hover:-translate-y-0.5 hover:bg-coral-dark hover:shadow-xl hover:shadow-coral/35 transition-all duration-200"
            >
              Plan your trip
              <ArrowRight
                :size="18"
                class="ml-2 transition-transform group-hover:translate-x-1"
              />
            </Button>
            <Button
              variant="link"
              class="text-base font-semibold text-slate-700 dark:text-slate-200 underline-offset-4 hover:text-coral transition-colors"
            >
              View all trip plans
            </Button>
          </div>
        </div>

        <!-- Right Carousel -->
        <div v-motion-slide-visible-once-right class="relative px-4">
          <Carousel
            :opts="{ align: 'center', loop: true }"
            class="w-full"
            @init-api="handleInitApi"
            @pointerenter="stopAutoplay"
            @pointerleave="startAutoplay"
          >
            <CarouselContent class="-ml-2 md:-ml-4">
              <CarouselItem
                v-for="trip in props.trips"
                :key="trip.id"
                class="pl-2 md:pl-4 basis-[95%] sm:basis-[85%]"
              >
                <article
                  class="group overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-200/60 dark:ring-slate-700/50 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                >
                  <!-- Image -->
                  <div class="relative h-[300px] sm:h-[360px] overflow-hidden">
                    <img
                      v-if="trip.main_image_url!=null"  
                      :src="trip.main_image_url"
                      :alt="trip.name"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <!-- Gradient overlay -->
                    <div
                      class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                    />
                    <!-- Price badge -->
                    <div
                      class="absolute top-4 right-4 px-4 py-2 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg"
                    >
                      <span
                        class="text-sm font-bold text-slate-900 dark:text-white"
                        >{{ priceLabel(trip) }}</span
                      >
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="p-6 space-y-4">
                    <div class="flex items-center justify-between">
                      <span
                        class="text-xs font-bold uppercase tracking-[0.2em] text-coral"
                      >
                        {{ trip.place_type?.toUpperCase() }}
                      </span>
                    </div>
                    <h3
                      class="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-coral transition-colors"
                    >
                      {{ trip.name }}
                    </h3>
                    <div
                      class="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <span class="flex items-center gap-1">
                        <StarIcon
                          v-for="n in 5"
                          :key="`${trip.id}-star-${n}`"
                          class="size-4"
                          :class="
                            n <= roundedRating(trip)
                              ? 'fill-amber text-amber'
                              : 'fill-slate-200 dark:fill-slate-600 text-slate-300 dark:text-slate-500'
                          "
                        />
                      </span>
                      <span class="w-1 h-1 rounded-full bg-slate-400" />
                      <span>{{ locationLabel(trip) }}</span>
                    </div>
                  </div>
                </article>
              </CarouselItem>

              <!-- Empty state -->
              <div
                v-if="!props.trips.length"
                class="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-200/80 dark:border-slate-700 bg-white/70 dark:bg-slate-800/50 text-sm text-slate-500"
              >
                <div class="text-center space-y-3">
                  <Compass :size="32" class="mx-auto text-slate-400" />
                  <p>Add trips to show them here.</p>
                </div>
              </div>
            </CarouselContent>

            <!-- Navigation buttons -->
            <CarouselPrevious
              class="absolute left-0 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700 transition-all duration-200"
            />
            <CarouselNext
              class="absolute right-0 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700 transition-all duration-200"
            />
          </Carousel>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Minimal additional styles for complex gradients */
</style>
