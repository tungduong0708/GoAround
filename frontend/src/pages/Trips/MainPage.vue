<script setup lang="ts">
import { useTrips, usePlanTrip } from "@/composables";
import { useAuthGuard } from "@/composables/useAuthGuard";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import PlanTripModal from "@/components/trip/PlanTripModal.vue";
import LoginPromptModal from "@/components/auth/LoginPromptModal.vue";
import { MapPin, Calendar, FileText, Plus, Compass } from "lucide-vue-next";

const {
  trips,
  loading,
  error,
  hasTrips,
  handleTripSelect,
  formatTripLocation,
  formatTripDateRange,
  formatTripPlaceCount,
} = useTrips({ autoLoad: true });

const { showPlanTripModal, openPlanTripModal, handleTripSubmit } =
  usePlanTrip();

const { showLoginPrompt, guardAction } = useAuthGuard();

const handleNewTrip = () => guardAction(openPlanTripModal);
const handleSelectTrip = (trip: (typeof trips.value)[number]) =>
  guardAction(() => handleTripSelect(trip));
</script>

<template>
  <div class="flex w-full flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
    <!-- Page Header Section -->
    <section v-motion-slide-visible-once-left class="mx-auto w-full max-w-6xl">
      <div class="flex items-center justify-between gap-6 flex-wrap">
        <div class="space-y-2">
          <h1
            class="text-4xl sm:text-5xl font-bold tracking-tight uppercase bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text"
          >
            MY TRIPS
          </h1>
          <p class="text-muted-foreground text-base sm:text-lg">
            Organize and plan your adventures
          </p>
        </div>
        <Button
          class="inline-flex items-center gap-2.5 px-6 py-3 bg-coral text-white font-semibold text-base rounded-xl shadow-lg shadow-coral/25 hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-coral/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 active:translate-y-0 transition-all duration-200"
          type="button"
          @click="handleNewTrip"
        >
          <Plus :size="20" />
          <span>New Trip</span>
        </Button>
      </div>
    </section>

    <!-- Loading State -->
    <section v-if="loading" class="mx-auto w-full max-w-6xl">
      <div class="flex items-center justify-center py-16">
        <div class="text-center">
          <div
            class="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-coral border-t-transparent shadow-lg shadow-coral/20"
          ></div>
          <p class="mt-5 text-muted-foreground font-medium">
            Loading your trips...
          </p>
        </div>
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
        <h3 class="text-2xl font-bold mb-3">No trips yet</h3>
        <p class="text-muted-foreground mb-8 max-w-md mx-auto">
          Start planning your next adventure and create unforgettable memories!
        </p>
        <Button
          type="button"
          class="inline-flex items-center gap-2 px-8 py-3 bg-coral text-white font-semibold rounded-xl shadow-lg shadow-coral/25 hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-coral/30 transition-all duration-200"
          @click="openPlanTripModal"
        >
          <Plus :size="20" />
          Create Your First Trip
        </Button>
      </div>
    </section>

    <!-- Trips Grid Section -->
    <section v-else class="mx-auto w-full max-w-6xl">
      <div
        class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Saved trips"
      >
        <Card
          v-for="(trip, index) in trips"
          :key="trip.id"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
          class="cursor-pointer group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-coral/10 hover:-translate-y-1 hover:border-coral/40"
          @click="handleSelectTrip(trip)"
        >
          <!-- Gradient accent bar -->
          <div
            class="h-1.5 bg-gradient-to-r from-coral via-coral-dark to-coral-darker"
          />

          <CardHeader class="pb-3">
            <CardTitle
              class="text-xl font-bold text-foreground group-hover:text-coral transition-colors duration-200"
            >
              {{ trip.trip_name }}
            </CardTitle>
          </CardHeader>

          <CardContent class="space-y-3 pt-0">
            <div
              class="flex items-center gap-3 text-muted-foreground text-sm group-hover:text-muted-foreground/80 transition-colors"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg bg-coral/10 shrink-0"
              >
                <MapPin :size="16" class="text-coral" />
              </div>
              <span class="truncate">{{ formatTripLocation(trip) }}</span>
            </div>

            <div class="flex items-center gap-3 text-muted-foreground text-sm">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg bg-coral/10 shrink-0"
              >
                <Calendar :size="16" class="text-coral" />
              </div>
              <span>{{ formatTripDateRange(trip) }}</span>
            </div>

            <div class="flex items-center gap-3 text-sm">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg bg-coral/10 shrink-0"
              >
                <FileText :size="16" class="text-coral" />
              </div>
              <span class="text-foreground font-semibold">
                {{ formatTripPlaceCount(trip) }}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Plan Trip Modal -->
    <PlanTripModal
      v-model:open="showPlanTripModal"
      @submit="handleTripSubmit"
    />

    <LoginPromptModal v-model:open="showLoginPrompt" />
  </div>
</template>

<style scoped>
/* Responsive adjustment for mobile - make new trip button full width */
@media (max-width: 640px) {
  .inline-flex.items-center.gap-2\.5 {
    width: 100%;
    justify-content: center;
  }
}
</style>
