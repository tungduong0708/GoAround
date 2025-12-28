<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { ITripListSchema } from "@/utils/interfaces";
import { StarIcon, Compass, ArrowRight, MapPin, Calendar, ShieldCheck } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const props = defineProps<{
  trips: ITripListSchema[];
}>();

const router = useRouter();
const carouselApi = ref<CarouselApi | null>(null);
let autoplayTimer: ReturnType<typeof setInterval> | null = null;
const AUTOPLAY_DELAY = 5000;

const gradients = [
  "from-orange-400 via-amber-500 to-yellow-400",
  "from-rose-400 via-pink-500 to-fuchsia-500",
  "from-violet-400 via-purple-500 to-indigo-500",
  "from-cyan-400 via-teal-500 to-emerald-500",
  "from-blue-400 via-indigo-500 to-purple-500",
  "from-amber-400 via-orange-500 to-red-500",
];

const getGradient = (index: number) => gradients[index % gradients.length];

const formatTripLocation = (trip: ITripListSchema): string => {
  // For trip list view, we don't have detailed location info
  // Return destination count instead
  return trip.stop_count && trip.stop_count > 0 
    ? `${trip.stop_count} destination${trip.stop_count > 1 ? 's' : ''}`
    : 'No destinations yet';
};

const formatTripDateRange = (trip: ITripListSchema) => {
  if (!trip.start_date) return "Dates not set";
  const start = new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (!trip.end_date) return start;
  const end = new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${start} - ${end}`;
};

const formatTripPlaceCount = (trip: ITripListSchema) => {
  const count = trip.stop_count || 0;
  return `${count} ${count === 1 ? 'place' : 'places'}`;
};

const getTripStatus = (trip: ITripListSchema) => {
  const now = new Date();
  const start = trip.start_date ? new Date(trip.start_date) : null;
  const end = trip.end_date ? new Date(trip.end_date) : null;

  if (start && start > now) return "Upcoming";
  if (end && end < now) return "Completed";
  return "In Progress";
};

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

const handlePlanTripClick = () => {
  router.push({ name: 'trip', query: { openAI: 'true' } });
};

const handleViewAllClick = () => {
  router.push({ name: 'trip', hash: '#trips-list' });
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
              @click="handlePlanTripClick"
            >
              Plan trip with AI
              <ArrowRight
                :size="18"
                class="ml-2 transition-transform group-hover:translate-x-1"
              />
            </Button>
            <Button
              variant="link"
              class="text-base font-semibold text-slate-700 dark:text-slate-200 underline-offset-4 hover:text-coral transition-colors"
              @click="handleViewAllClick"
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
            <CarouselContent class="-ml-2 md:-ml-4 py-4">
              <CarouselItem
                v-for="(trip, index) in props.trips"
                :key="trip.id"
                class="pl-2 md:pl-4 basis-full md:basis-[65%] lg:basis-[50%]"
              >
                <Card
                  class="group cursor-pointer overflow-hidden rounded-2xl border border-border/30 bg-card ring-1 ring-black/5 hover:ring-coral/20 hover:border-coral/40 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                  @click="router.push(`/trip/${trip.id}`)"
                >
                  <!-- Cover / Accent -->
                  <div class="relative h-40 overflow-hidden" :class="trip.preview_image_url ? '' : 'bg-gradient-to-br ' + getGradient(index)">
                    <!-- Background image if available -->
                    <img
                      v-if="trip.preview_image_url"
                      :src="trip.preview_image_url"
                      :alt="trip.trip_name"
                      class="absolute inset-0 w-full h-full object-cover"
                      @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                    />
                    <!-- Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10" />
                    <div class="absolute top-4 left-4">
                      <Badge class="rounded-full bg-white/90 dark:bg-slate-800/90 text-foreground px-3 py-1.5 text-xs font-semibold shadow-md">
                        {{ getTripStatus(trip) }}
                      </Badge>
                    </div>
                    <div class="absolute bottom-4 left-4 right-4">
                      <h3 class="text-xl font-bold text-white drop-shadow-lg line-clamp-2">
                        {{ trip.trip_name }}
                      </h3>
                    </div>
                  </div>

                  <CardContent class="space-y-3 p-4 flex-1 flex flex-col justify-between">
                    <div class="space-y-2 text-sm text-muted-foreground">
                      <div class="flex items-center gap-2">
                        <MapPin :size="16" class="text-coral flex-shrink-0" />
                        <span class="truncate">{{ formatTripLocation(trip) }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Calendar :size="16" class="text-coral flex-shrink-0" />
                        <span class="truncate">{{ formatTripDateRange(trip) }}</span>
                      </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2 pt-1">
                      <Badge
                        variant="secondary"
                        class="bg-coral/10 text-coral border-0 px-2.5 py-0.5 text-xs font-medium rounded-md"
                      >
                        {{ formatTripPlaceCount(trip) }}
                      </Badge>
                      <Badge
                        v-if="trip.public"
                        variant="secondary"
                        class="bg-emerald-500/10 text-emerald-600 border-0 px-2.5 py-0.5 text-xs font-medium rounded-md"
                      >
                        Public
                      </Badge>
                      <Badge
                        v-else
                        variant="secondary"
                        class="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-0 px-2.5 py-0.5 text-xs font-medium rounded-md"
                      >
                        Private
                      </Badge>
                      <Badge
                        variant="secondary"
                        class="bg-muted text-muted-foreground border-0 px-2.5 py-0.5 text-xs font-medium rounded-md"
                      >
                        ID: {{ trip.id.slice(0, 6) }}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
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
              class="-left-12 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700 transition-all duration-200"
            />
            <CarouselNext
              class="-right-12 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700 transition-all duration-200"
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
