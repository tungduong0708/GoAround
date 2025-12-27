<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UserService } from "@/services";
import type { ITripListSchema } from "@/utils/interfaces";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Map,
  ChevronRight,
  Compass,
  Route,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

interface Props {
  userId: string;
}

const props = defineProps<Props>();
const trips = ref<ITripListSchema[]>([]);
const loading = ref(true);
const router = useRouter();

onMounted(async () => {
  try {
    const response = await UserService.getUserTrips(props.userId, {
      page: 1,
      limit: 10,
    });
    trips.value = response.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const navigateToTrip = (tripId: string) => {
  router.push(`/trips/${tripId}`);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Generate a gradient based on index for visual variety
const gradients = [
  "from-orange-400 via-amber-500 to-yellow-400",
  "from-rose-400 via-pink-500 to-fuchsia-500",
  "from-violet-400 via-purple-500 to-indigo-500",
  "from-cyan-400 via-teal-500 to-emerald-500",
  "from-blue-400 via-indigo-500 to-purple-500",
  "from-amber-400 via-orange-500 to-red-500",
];

const getGradient = (index: number) => gradients[index % gradients.length];
</script>

<template>
  <div class="space-y-6">
    <!-- Section Header -->
    <div
      v-motion-slide-visible-once-left
      class="flex items-center justify-between"
    >
      <h3 class="text-xl font-semibold tracking-tight flex items-center gap-2">
        <div class="p-2 rounded-full bg-emerald-500/10">
          <Map class="h-5 w-5 text-emerald-500" />
        </div>
        Trips
        <Badge
          v-if="trips.length"
          variant="secondary"
          class="ml-1 bg-secondary/80 text-muted-foreground font-normal"
        >
          {{ trips.length }}
        </Badge>
      </h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="i in 2"
        :key="i"
        class="rounded-3xl border border-border/40 overflow-hidden"
      >
        <Skeleton class="h-48 w-full" />
        <div class="p-6 space-y-4">
          <Skeleton class="h-7 w-3/4" />
          <div class="flex gap-4">
            <Skeleton class="h-5 w-24" />
            <Skeleton class="h-5 w-20" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="trips.length === 0"
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
      class="flex flex-col items-center justify-center py-16 text-center rounded-3xl bg-secondary/20 border border-dashed border-border/60"
    >
      <div class="p-4 rounded-full bg-secondary/50 mb-4">
        <Compass class="h-8 w-8 text-muted-foreground" />
      </div>
      <p class="font-medium text-foreground mb-1">No public trips yet</p>
      <p class="text-sm text-muted-foreground">
        Published trips will be showcased here.
      </p>
    </div>

    <!-- Trips Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="(trip, index) in trips"
        :key="trip.id"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { delay: index * 100, duration: 500 },
        }"
        class="group relative overflow-hidden rounded-3xl border border-border/40 bg-card hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 cursor-pointer"
        @click="navigateToTrip(trip.id)"
      >
        <!-- Cover with Animated Gradient -->
        <div
          class="h-48 relative overflow-hidden"
          :class="`bg-gradient-to-br ${getGradient(index)}`"
        >
          <!-- Decorative Elements -->
          <div class="absolute inset-0">
            <div
              class="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl"
            ></div>
            <div
              class="absolute bottom-8 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"
            ></div>
          </div>

          <!-- Animated Map Pattern -->
          <div class="absolute inset-0 flex items-center justify-center">
            <Route
              class="h-32 w-32 text-white/10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12"
            />
          </div>

          <!-- Map Pin Icon -->
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 group-hover:scale-110"
          >
            <div class="relative">
              <div
                class="absolute -inset-3 bg-white/20 rounded-full blur-md animate-pulse"
              ></div>
              <MapPin class="relative h-12 w-12 text-white drop-shadow-lg" />
            </div>
          </div>

          <!-- View Badge -->
          <div
            class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
          >
            <Badge
              class="bg-white/90 text-gray-800 shadow-lg font-medium px-3 py-1 gap-1"
            >
              View Trip
              <ChevronRight class="h-4 w-4" />
            </Badge>
          </div>
        </div>

        <!-- Trip Info -->
        <div class="p-6 space-y-4">
          <h4
            class="text-xl font-bold text-foreground group-hover:text-orange-600 transition-colors flex items-center gap-2"
          >
            {{ trip.trip_name }}
            <ChevronRight
              class="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
            />
          </h4>

          <div
            class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
          >
            <!-- Date -->
            <div
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50"
            >
              <Calendar class="h-4 w-4" />
              <span>
                {{ formatDate(trip.start_date || new Date().toISOString()) }}
              </span>
            </div>

            <!-- Stops Count -->
            <div
              v-if="trip.stop_count"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium"
            >
              <MapPin class="h-4 w-4" />
              <span>{{ trip.stop_count }} stops</span>
            </div>
          </div>
        </div>

        <!-- Hover Border Effect -->
        <div
          class="absolute inset-0 rounded-3xl ring-2 ring-orange-500/0 group-hover:ring-orange-500/50 transition-all duration-300 pointer-events-none"
        ></div>
      </div>
    </div>
  </div>
</template>
