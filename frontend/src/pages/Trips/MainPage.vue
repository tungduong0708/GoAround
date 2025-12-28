<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import type { ITripListSchema } from "@/utils/interfaces";
import { useTrips, usePlanTrip, useGenerateTrip } from "@/composables";
import { useAuthGuard } from "@/composables/useAuthGuard";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import PlanTripModal from "@/components/trip/PlanTripModal.vue";
import GenerateTripModal from "@/components/trip/GenerateTripModal.vue";
import LoginPromptModal from "@/components/auth/LoginPromptModal.vue";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  MapPin,
  Calendar,
  FileText,
  Plus,
  Compass,
  Trash2,
  Sparkles,
  Clock,
  ShieldCheck,
} from "lucide-vue-next";

type TripFilter = "all" | "upcoming" | "completed";

const router = useRouter();
const route = useRoute();
const filters: TripFilter[] = ["all", "upcoming", "completed"];

const {
  trips,
  sortedTrips,
  loading,
  error,
  hasTrips,
  deletingTripId,
  tripStats,
  upcomingTrips,
  pastTrips,
  formatTripLocation,
  formatTripDateRange,
  formatTripPlaceCount,
  deleteTrip,
  loadTrips,
} = useTrips({ autoLoad: false }); // Changed to false to manually control loading

// Always reload trips when component mounts to ensure fresh data
onMounted(() => {
  loadTrips(true);
});

const { showPlanTripModal, openPlanTripModal, handleTripSubmit } = usePlanTrip();
const { 
  showGenerateTripModal, 
  openGenerateTripModal, 
  handleGenerateSubmit,
  aiGenerating,
  error: generateError
} = useGenerateTrip();
const { showLoginPrompt, guardAction } = useAuthGuard();

const activeFilter = ref<TripFilter>("all");
const tripPendingDelete = ref<ITripListSchema | null>(null);
const isDeleteDialogOpen = computed({
  get: () => tripPendingDelete.value !== null,
  set: (value) => {
    if (!value) {
      tripPendingDelete.value = null;
    }
  },
});

const gradients = [
  "from-orange-400 via-amber-500 to-yellow-400",
  "from-rose-400 via-pink-500 to-fuchsia-500",
  "from-violet-400 via-purple-500 to-indigo-500",
  "from-cyan-400 via-teal-500 to-emerald-500",
  "from-blue-400 via-indigo-500 to-purple-500",
  "from-amber-400 via-orange-500 to-red-500",
];

const getGradient = (index: number) => gradients[index % gradients.length];

const filteredTrips = computed(() => {
  const base = sortedTrips.value.length ? sortedTrips.value : trips.value;
  if (activeFilter.value === "upcoming") return upcomingTrips.value;
  if (activeFilter.value === "completed") return pastTrips.value;
  return base;
});

const nextTrip = computed(() => upcomingTrips.value[0] ?? null);

const getTripStatus = (trip: ITripListSchema) => {
  const now = new Date();
  const start = trip.start_date ? new Date(trip.start_date) : null;
  const end = trip.end_date ? new Date(trip.end_date) : null;

  if (start && start > now) return "Upcoming";
  if (end && end < now) return "Completed";
  return "In Progress";
};

const handleNewTrip = () => guardAction(openPlanTripModal);
const handleAIGenerate = () => guardAction(openGenerateTripModal);
const handleResumeNextTrip = () => {
  if (!nextTrip.value) return;
  guardAction(() => router.push(`/trip/${nextTrip.value?.id}`));
};

const setFilter = (filter: TripFilter) => {
  activeFilter.value = filter;
};

const openDeleteDialog = (trip: ITripListSchema) => {
  console.log('[MainPage] Opening delete dialog for trip:', trip.trip_name, trip.id);
  tripPendingDelete.value = trip;
};

const handleDeleteConfirm = async () => {
  if (!tripPendingDelete.value) return;

  console.log('[MainPage] Delete confirmed for trip:', tripPendingDelete.value.trip_name, tripPendingDelete.value.id);
  
  try {
    await deleteTrip(tripPendingDelete.value.id);
    console.log('[MainPage] Trip deleted successfully');
  } catch (err) {
    console.error('[MainPage] Failed to delete trip:', err);
  } finally {
    tripPendingDelete.value = null;
  }
};
</script>

<template>
  <div class="flex w-full flex-col gap-10 px-4 py-8 sm:px-6 lg:px-10">
    <!-- Hero / Summary -->
    <section
      v-motion-slide-visible-once-left
      class="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-background via-background/80 to-background shadow-xl shadow-coral/10"
    >
      <div class="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,121,97,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,193,131,0.12),transparent_30%)]"
        />
        <div class="space-y-5 relative z-10">
          <Badge
            class="inline-flex items-center gap-2 rounded-full border border-coral/40 bg-coral/10 text-coral"
          >
            <Sparkles class="h-4 w-4" />
            Trip workspace
          </Badge>
          <div class="space-y-3">
            <h1
              class="text-4xl sm:text-5xl font-bold tracking-tight text-foreground"
            >
              My Trips
            </h1>
            <p class="text-muted-foreground text-lg max-w-2xl">
              Plan, organize, and revisit every adventure in one place. Pick up
              where you left off or start a brand-new journey.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              class="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white font-semibold rounded-xl shadow-lg shadow-coral/25 hover:bg-coral-dark hover:-translate-y-0.5 transition-all duration-200"
              @click="handleNewTrip"
            >
              <Plus :size="20" />
              Plan a trip
            </Button>
            <Button
              type="button"
              variant="outline"
              class="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-coral-light transition-all"
              @click="handleAIGenerate"
            >
              <Sparkles :size="18" class="text-purple-600" />
              <span class="font-semibold bg-gradient-to-r from-purple-600 to-coral bg-clip-text text-transparent">
                AI Generate
              </span>
            </Button>
            <Button
              v-if="nextTrip"
              variant="outline"
              class="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-border/70 hover:border-coral/50 hover:text-coral transition-colors"
              @click="handleResumeNextTrip"
            >
              <Clock :size="18" />
              Resume next trip
            </Button>
          </div>
          <div
            class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm sm:text-base"
          >
            <div
              class="rounded-2xl border border-border/60 bg-white/50 dark:bg-card/80 backdrop-blur-sm p-4 shadow-sm"
            >
              <p class="text-muted-foreground">Total trips</p>
              <p class="text-2xl font-semibold text-foreground">
                {{ tripStats.total }}
              </p>
            </div>
            <div
              class="rounded-2xl border border-border/60 bg-white/50 dark:bg-card/80 backdrop-blur-sm p-4 shadow-sm"
            >
              <p class="text-muted-foreground">Upcoming</p>
              <p class="text-2xl font-semibold text-foreground">
                {{ tripStats.upcoming }}
              </p>
            </div>
            <div
              class="rounded-2xl border border-border/60 bg-white/50 dark:bg-card/80 backdrop-blur-sm p-4 shadow-sm"
            >
              <p class="text-muted-foreground">Completed</p>
              <p class="text-2xl font-semibold text-foreground">
                {{ tripStats.completed }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="relative rounded-2xl border border-border/60 bg-gradient-to-br from-coral/15 via-orange-100/40 to-white p-6 shadow-lg"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="h-11 w-11 rounded-xl bg-white shadow-sm flex items-center justify-center"
                >
                  <Compass :size="22" class="text-coral" />
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Next on deck</p>
                  <p class="font-semibold text-foreground">
                    {{ nextTrip ? nextTrip.trip_name : "No upcoming trip" }}
                  </p>
                </div>
              </div>
              <Badge
                v-if="nextTrip"
                class="bg-coral text-white rounded-full px-3 py-1"
              >
                Upcoming
              </Badge>
            </div>

            <div
              v-if="nextTrip"
              class="rounded-xl border border-white/60 bg-white/70 p-4 space-y-3 shadow-sm"
            >
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin :size="16" class="text-coral" />
                <span>{{ formatTripLocation(nextTrip) }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar :size="16" class="text-coral" />
                <span>{{ formatTripDateRange(nextTrip) }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText :size="16" class="text-coral" />
                <span>{{ formatTripPlaceCount(nextTrip) }}</span>
              </div>
            </div>

            <div
              v-else
              class="rounded-xl border border-dashed border-border/70 bg-white/70 p-4 text-muted-foreground"
            >
              Start planning to see your next trip here.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filter bar -->
    <section
      class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-4"
    >
      <p class="text-sm text-muted-foreground">
        Sorted by start date — tap a card to open
      </p>
    </section>

    <!-- Loading State -->
    <section v-if="loading" class="mx-auto w-full max-w-6xl">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="i in 6"
          :key="i"
          class="animate-pulse rounded-2xl border border-border/50 bg-muted/30 h-64"
        ></div>
      </div>
    </section>

    <!-- Error State -->
    <section v-else-if="error" class="mx-auto w-full max-w-6xl">
      <div
        class="rounded-2xl border border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10 p-8 text-center backdrop-blur-sm"
      >
        <p class="text-destructive font-medium text-lg">{{ error }}</p>
      </div>
    </section>

    <!-- Empty State -->
    <section
      v-else-if="!hasTrips"
      v-motion-pop-visible-once
      class="mx-auto w-full max-w-6xl"
    >
      <div
        class="text-center py-16 px-6 rounded-3xl bg-gradient-to-br from-muted/30 to-muted/10 border border-dashed border-border"
      >
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-coral/20 to-coral/5 mb-6"
        >
          <Compass :size="40" class="text-coral" />
        </div>
        <h3 class="text-2xl font-bold mb-3">You have no trips yet</h3>
        <p class="text-muted-foreground mb-8 max-w-md mx-auto">
          Build your first itinerary, add your must-see spots, and keep
          everything organized.
        </p>
        <Button
          type="button"
          class="inline-flex items-center gap-2 px-8 py-3 bg-coral text-white font-semibold rounded-xl shadow-lg shadow-coral/25 hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-coral/30 transition-all duration-200"
          @click="openPlanTripModal"
        >
          <Plus :size="20" />
          Start planning
        </Button>
      </div>
    </section>

    <!-- Trips Grid -->
    <section v-else class="mx-auto w-full max-w-6xl">
      <div
        class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Saved trips"
      >
        <RouterLink
          v-for="(trip, index) in filteredTrips"
          :key="trip.id"
          :to="`/trip/${trip.id}`"
          class="block"
          custom
          v-slot="{ navigate, href }"
        >
          <Card
            :as="'a'"
            :href="href"
            v-motion
            :initial="{ opacity: 0, y: 40 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 80 } }"
            class="group cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card/90 backdrop-blur hover:shadow-xl hover:shadow-coral/10 transition-all duration-300"
            @click="(e: MouseEvent) => { e.preventDefault(); guardAction(navigate); }"
          >
            <!-- Cover / Accent -->
            <div class="relative h-32 overflow-hidden" :class="trip.preview_image_url ? '' : 'bg-gradient-to-br ' + getGradient(index)">
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
                <Badge class="rounded-full bg-white/85 text-foreground px-3 py-1 text-xs font-semibold">
                  {{ getTripStatus(trip) }}
                </Badge>
              </div>
              <div class="absolute bottom-4 left-4 text-white drop-shadow-lg font-semibold text-lg">
                {{ trip.trip_name }}
              </div>
              <div class="absolute right-4 bottom-4 flex items-center gap-1 text-white/80 text-sm">
                <ShieldCheck v-if="trip.public" :size="16" />
                <span v-if="trip.public">Public</span>
              </div>
            </div>

            <CardContent class="space-y-4 p-5">
              <div class="space-y-2 text-sm text-muted-foreground">
                <div class="flex items-center gap-2">
                  <MapPin :size="16" class="text-coral" />
                  <span class="truncate">{{ formatTripLocation(trip) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Calendar :size="16" class="text-coral" />
                  <span>{{ formatTripDateRange(trip) }}</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  class="bg-coral/10 text-coral border-coral/30 px-3 py-1"
                >
                  {{ formatTripPlaceCount(trip) }}
                </Badge>
                <Badge
                  variant="secondary"
                  class="bg-muted/70 text-muted-foreground px-3 py-1"
                >
                  ID: {{ trip.id.slice(0, 6) }}
                </Badge>
              </div>

              <div class="flex items-center gap-3 pt-2">
                <Button
                  size="sm"
                  class="flex-1 bg-coral text-white hover:bg-coral-dark rounded-xl"
                  type="button"
                >
                  Open Trip
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  class="rounded-xl text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                  type="button"
                  :disabled="deletingTripId === trip.id"
                  @click.stop.prevent="openDeleteDialog(trip)"
                  aria-label="Delete trip"
                >
                  <Trash2 :size="18" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </RouterLink>
      </div>
    </section>

    <!-- Plan Trip Modal -->
    <PlanTripModal
      v-model:open="showPlanTripModal"
      @submit="handleTripSubmit"
    />

    <!-- Generate Trip Modal -->
    <GenerateTripModal
      v-model:open="showGenerateTripModal"
      :loading="aiGenerating"
      :error="generateError"
      @submit="handleGenerateSubmit"
    />

    <LoginPromptModal v-model:open="showLoginPrompt" />

    <!-- Delete Confirmation Dialog -->
    <AlertDialog
      :open="isDeleteDialogOpen"
      @update:open="isDeleteDialogOpen = $event"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
          <AlertDialogDescription>
            "{{ tripPendingDelete?.trip_name }}" will be permanently removed.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            :disabled="deletingTripId !== null"
            @click="handleDeleteConfirm"
          >
            {{ deletingTripId ? 'Deleting...' : 'Delete trip' }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<style scoped>
</style>
