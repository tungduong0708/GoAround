<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTripDetails } from "@/composables";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Collapsible from "@/components/ui/collapsible/Collapsible.vue";
import CollapsibleTrigger from "@/components/ui/collapsible/CollapsibleTrigger.vue";
import CollapsibleContent from "@/components/ui/collapsible/CollapsibleContent.vue";
import SavedPlacesModal from "@/components/trip/SavedPlacesModal.vue";
import {
    MapPin,
    Calendar,
    ChevronDown,
    Star,
    ArrowLeft,
    Plus,
    Trash2,
    Clock,
    AlertCircle,
    Bookmark,
} from "lucide-vue-next";

const route = useRoute();
const tripId = route.params.tripId as string;

const {
    trip,
    loading,
    error,
    isRemoving,
    removeError,
    hasStops,
    stopGroups,
    tripInfo,
    loadTrip,
    removeStop,
    navigateToPlace,
    navigateBack,
    navigateToAddPlace,
    formatArrivalTime,
    clearErrors,
} = useTripDetails({ tripId, autoLoad: true });

const showSavedPlacesModal = ref(false);

const handleAddFromSavedPlaces = () => {
    showSavedPlacesModal.value = true;
};

const handlePlaceAdded = async () => {
    // Reload trip to show newly added place
    await loadTrip(true);
};

const handleRemoveStop = async (stopId: string) => {
    if (confirm("Are you sure you want to remove this place from your trip?")) {
        try {
            await removeStop(stopId);
        } catch (err) {
            // Error is handled by composable
            console.error("Failed to remove stop:", err);
        }
    }
};

onMounted(async () => {
    console.log("Mounted");
    await loadTrip(true);
});
</script>

<template>
  <div class="flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header Section -->
    <section v-motion-slide-visible-once-top class="mx-auto w-full max-w-6xl">
      <Button
        variant="ghost"
        class="mb-4 -ml-2 group hover:bg-coral-light transition-colors duration-200"
        @click="navigateBack"
      >
        <ArrowLeft
          :size="20"
          class="mr-2 transition-transform group-hover:-translate-x-1"
        />
        Back to Trips
      </Button>

            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-16">
                <div class="text-center">
                    <div
                        class="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-coral border-t-transparent shadow-lg shadow-coral/20"
                    ></div>
                    <p class="mt-5 text-muted-foreground font-medium">
                        Loading your trip...
                    </p>
                </div>
            </div>

            <!-- Error State -->
            <div
                v-else-if="error"
                class="rounded-2xl border border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10 p-6 backdrop-blur-sm"
            >
                <div class="flex items-center gap-4">
                    <div
                        class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"
                    >
                        <AlertCircle :size="24" class="text-destructive" />
                    </div>
                    <div class="flex-1">
                        <p class="text-destructive font-semibold text-lg">
                            Failed to load trip
                        </p>
                        <p class="text-sm text-destructive/80 mt-1">
                            {{ error }}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        class="hover:bg-destructive/10"
                        @click="clearErrors"
                    >
                        Dismiss
                    </Button>
                </div>
            </div>

            <!-- Trip Header -->
            <div v-else-if="trip && tripInfo" class="space-y-6">
                <div class="flex items-start justify-between gap-6 flex-wrap">
                    <div class="flex-1 min-w-0 space-y-2">
                        <h1
                            class="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text break-words"
                        >
                            {{ tripInfo.name }}
                        </h1>
                        <p class="text-muted-foreground text-lg max-w-2xl">
                            Organize places into collections for your trips
                        </p>
                    </div>
                    <div class="flex gap-3 shrink-0">
                        <Button
                            variant="outline"
                            class="inline-flex items-center gap-2 px-5 py-3 border-2 border-coral text-coral font-semibold rounded-xl hover:bg-coral hover:text-white transition-all duration-200"
                            @click="handleAddFromSavedPlaces"
                        >
                            <Bookmark :size="20" />
                            From Saved
                        </Button>
                        <Button
                            class="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white font-semibold rounded-xl shadow-lg shadow-coral/25 hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-coral/30 active:translate-y-0 transition-all duration-200"
                            @click="navigateToAddPlace"
                        >
                            <Plus :size="20" />
                            Add Place
                        </Button>
                    </div>
                </div>

                <!-- Trip Info -->
                <div class="flex flex-wrap gap-4 items-center">
                    <div
                        v-if="tripInfo.hasDateRange"
                        class="flex items-center gap-2.5 text-muted-foreground bg-muted/50 px-4 py-2 rounded-full"
                    >
                        <Calendar :size="18" class="text-coral shrink-0" />
                        <span class="font-medium">{{
                            tripInfo.dateRange
                        }}</span>
                    </div>
                    <Badge
                        variant="secondary"
                        class="px-4 py-1.5 text-sm font-semibold bg-coral/10 text-coral border-0"
                    >
                        {{ tripInfo.placeCount }}
                    </Badge>
                </div>

                <!-- Remove Error Alert -->
                <div
                    v-if="removeError"
                    class="rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                    <div class="flex items-center gap-3">
                        <AlertCircle
                            :size="20"
                            class="text-destructive shrink-0"
                        />
                        <p class="text-sm text-destructive flex-1">
                            {{ removeError }}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            class="text-destructive hover:bg-destructive/10"
                            @click="clearErrors"
                        >
                            Dismiss
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <Separator class="mx-auto w-full max-w-6xl" />

    <!-- Stops Section -->
    <section v-if="trip && !loading" class="mx-auto w-full max-w-6xl space-y-4">
      <!-- Empty State -->
      <div v-if="!hasStops" v-motion-pop-visible-once class="text-center py-16">
        <div
          class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-coral/20 to-coral/5 mb-6"
        >
          <MapPin :size="40" class="text-coral" />
        </div>
        <h3 class="text-2xl font-bold mb-3">No places yet</h3>
        <p class="text-muted-foreground mb-8 max-w-md mx-auto">
          Start adding places to your trip and make it unforgettable!
        </p>
        <Button
          class="inline-flex items-center gap-2 px-8 py-3 bg-coral text-white font-semibold rounded-xl shadow-lg shadow-coral/25 hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-coral/30 transition-all duration-200"
          @click="navigateToAddPlace"
        >
          <Plus :size="20" />
          Add Your First Place
        </Button>
      </div>

      <!-- Stop Groups -->
      <div v-else class="space-y-4">
        <Collapsible
          v-for="(group, index) in stopGroups"
          :key="group.id"
          :default-open="true"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
          class="rounded-2xl bg-card border border-border/80 overflow-hidden shadow-sm hover:shadow-md hover:border-border transition-all duration-200"
        >
          <CollapsibleTrigger
            class="w-full px-5 py-4 bg-muted/30 hover:bg-muted/50 transition-colors duration-200 flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div class="flex items-center gap-4">
              <span class="font-semibold text-foreground text-lg">
                {{ group.title }}
              </span>
              <Badge variant="outline" class="text-xs font-medium">
                {{ group.stops.length }} places
              </Badge>
            </div>
            <ChevronDown
              :size="20"
              class="text-muted-foreground shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180"
            />
          </CollapsibleTrigger>

                    <CollapsibleContent class="px-3 pb-3 pt-2">
                        <div class="space-y-2">
                            <Card
                                v-for="stop in group.stops"
                                :key="stop.id"
                                class="cursor-pointer p-0 overflow-hidden transition-all duration-200 hover:shadow-lg hover:translate-x-1 hover:border-coral/50 group/card"
                                @click="stop?.place && navigateToPlace(stop.place.id)"
                            >
                                <div class="flex items-center gap-4 p-3 sm:p-4">
                                    <!-- Place Image -->
                                    <img
                                        v-if="stop.place?.main_image_url != null"
                                        :src="stop.place.main_image_url"
                                        :alt="stop.place.name"
                                        class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-muted ring-1 ring-border/50 group-hover/card:ring-coral/30 transition-all duration-200"
                                        loading="lazy"
                                    />

                                    <!-- Place Info -->
                                    <div
                                        class="flex-1 min-w-0 flex flex-col gap-1.5"
                                    >
                                        <div
                                            class="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row"
                                        >
                                            <h3
                                                class="font-semibold text-foreground text-base sm:text-lg truncate max-w-[200px] sm:max-w-none"
                                                :title="stop.place.name"
                                            >
                                                {{ stop.place.name }}
                                            </h3>
                                            <div
                                                class="flex items-center gap-1 text-sm font-medium shrink-0"
                                            >
                                                <Star
                                                    :size="16"
                                                    class="text-amber fill-amber"
                                                />
                                                <span>{{
                                                    stop.place.average_rating.toFixed(
                                                        1,
                                                    )
                                                }}</span>
                                            </div>
                                        </div>

                                        <div
                                            class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground"
                                        >
                                            <div
                                                class="flex items-center gap-1.5"
                                            >
                                                <MapPin
                                                    :size="14"
                                                    class="shrink-0 text-coral"
                                                />
                                                <span class="truncate">
                                                    {{ stop.place.city }},
                                                    {{ stop.place.country }}
                                                </span>
                                            </div>
                                            <span
                                                class="hidden sm:inline text-muted-foreground/50"
                                                >•</span
                                            >
                                            <span class="text-muted-foreground">
                                                {{ stop.place.review_count }}
                                                reviews
                                            </span>
                                        </div>

                                        <!-- Stop Info -->
                                        <div
                                            v-if="
                                                stop.arrival_time || stop.notes
                                            "
                                            class="flex flex-col gap-1 pt-1 border-t border-border/50 mt-1"
                                        >
                                            <div
                                                v-if="stop.arrival_time"
                                                class="flex items-center gap-1.5 text-xs text-muted-foreground"
                                            >
                                                <Clock
                                                    :size="12"
                                                    class="shrink-0"
                                                />
                                                <span>{{
                                                    formatArrivalTime(
                                                        stop.arrival_time,
                                                    )
                                                }}</span>
                                            </div>
                                            <p
                                                v-if="stop.notes"
                                                class="text-xs text-muted-foreground line-clamp-2"
                                                :title="stop.notes"
                                            >
                                                {{ stop.notes }}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Actions -->
                                    <div class="flex items-center shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            :disabled="isRemoving"
                                            @click.stop="
                                                handleRemoveStop(stop.id)
                                            "
                                        >
                                            <Trash2 :size="18" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </section>
    </div>

    <!-- Saved Places Modal -->
    <SavedPlacesModal
        v-model:open="showSavedPlacesModal"
        :trip-id="tripId"
        @success="handlePlaceAdded"
    />
</template>

<style scoped>
/* Responsive button for mobile */
@media (max-width: 640px) {
    .shrink-0.inline-flex {
        width: 100%;
        justify-content: center;
    }
}
</style>
