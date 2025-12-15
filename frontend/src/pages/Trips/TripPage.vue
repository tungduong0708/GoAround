<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTripDetails } from "@/composables";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Collapsible from "@/components/ui/collapsible/Collapsible.vue";
import CollapsibleTrigger from "@/components/ui/collapsible/CollapsibleTrigger.vue";
import CollapsibleContent from "@/components/ui/collapsible/CollapsibleContent.vue";
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
    removeStop,
    navigateToPlace,
    navigateBack,
    navigateToAddPlace,
    formatArrivalTime,
    clearErrors,
} = useTripDetails({ tripId, autoLoad: true });

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
    console.log("Trip loaded");
    console.log("Trip details:", tripInfo.value);
});
</script>

<template>
    <div class="flex w-full flex-col gap-8 px-4 py-8">
        <!-- Header Section -->
        <section class="mx-auto w-full max-w-6xl">
            <Button variant="ghost" class="mb-4 -ml-2" @click="navigateBack">
                <ArrowLeft :size="20" class="mr-2" />
                Back to Trips
            </Button>

            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <div class="text-center">
                    <div
                        class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
                    ></div>
                    <p class="mt-4 text-muted-foreground">Loading trip...</p>
                </div>
            </div>

            <!-- Error State -->
            <div
                v-else-if="error"
                class="rounded-lg border border-destructive/50 bg-destructive/10 p-6"
            >
                <div class="flex items-center gap-3">
                    <AlertCircle :size="24" class="text-destructive shrink-0" />
                    <div class="flex-1">
                        <p class="text-destructive font-semibold">
                            Failed to load trip
                        </p>
                        <p class="text-sm text-destructive/80 mt-1">
                            {{ error }}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" @click="clearErrors">
                        Dismiss
                    </Button>
                </div>
            </div>

            <!-- Trip Header -->
            <div v-else-if="trip && tripInfo" class="space-y-4">
                <div class="flex items-start justify-between gap-4 flex-wrap">
                    <div class="flex-1 min-w-0">
                        <h1 class="text-4xl font-bold mb-2 wrap-break-words">
                            {{ tripInfo.name }}
                        </h1>
                        <p class="text-muted-foreground text-lg">
                            Organize places into collections for your trips
                        </p>
                    </div>
                    <Button
                        class="new-trip-btn shrink-0"
                        @click="navigateToAddPlace"
                    >
                        <Plus :size="20" class="mr-2" />
                        Add Place
                    </Button>
                </div>

                <!-- Trip Info -->
                <div class="flex flex-wrap gap-4 items-center">
                    <div
                        v-if="tripInfo.hasDateRange"
                        class="flex items-center gap-2 text-muted-foreground"
                    >
                        <Calendar :size="18" class="shrink-0" />
                        <span>{{ tripInfo.dateRange }}</span>
                    </div>
                    <Badge variant="secondary" class="px-3 py-1">
                        {{ tripInfo.placeCount }}
                    </Badge>
                </div>

                <!-- Remove Error Alert -->
                <div
                    v-if="removeError"
                    class="rounded-lg border border-destructive/50 bg-destructive/10 p-4"
                >
                    <div class="flex items-center gap-2">
                        <AlertCircle :size="20" class="text-destructive" />
                        <p class="text-sm text-destructive">
                            {{ removeError }}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            class="ml-auto"
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
        <section
            v-if="trip && !loading"
            class="mx-auto w-full max-w-6xl space-y-4"
        >
            <!-- Empty State -->
            <div v-if="!hasStops" class="text-center py-12">
                <MapPin :size="48" class="mx-auto text-muted-foreground mb-4" />
                <h3 class="text-xl font-semibold mb-2">No places yet</h3>
                <p class="text-muted-foreground mb-6">
                    Start adding places to your trip!
                </p>
                <Button @click="navigateToAddPlace">
                    <Plus :size="20" class="mr-2" />
                    Add Your First Place
                </Button>
            </div>

            <!-- Stop Groups -->
            <div v-else class="space-y-3">
                <Collapsible
                    v-for="group in stopGroups"
                    :key="group.id"
                    :default-open="true"
                    class="stop-group"
                >
                    <CollapsibleTrigger class="group-trigger">
                        <div class="flex items-center justify-between w-full">
                            <div class="flex items-center gap-3">
                                <span class="group-title">{{
                                    group.title
                                }}</span>
                                <Badge variant="outline" class="text-xs">
                                    {{ group.stops.length }} places
                                </Badge>
                            </div>
                            <ChevronDown
                                :size="20"
                                class="chevron-icon transition-transform duration-200 group-data-[state=open]:rotate-180"
                            />
                        </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent class="group-content">
                        <div class="space-y-2 mt-2">
                            <Card
                                v-for="stop in group.stops"
                                :key="stop.id"
                                class="place-card"
                                @click="navigateToPlace(stop.place.id)"
                            >
                                <div class="place-card-content">
                                    <!-- Place Image -->
                                    <img
                                        :src="stop.place.mainImageUrl"
                                        :alt="stop.place.name"
                                        class="place-image"
                                        loading="lazy"
                                    />

                                    <!-- Place Info -->
                                    <div class="place-info">
                                        <div class="place-header">
                                            <h3
                                                class="place-name"
                                                :title="stop.place.name"
                                            >
                                                {{ stop.place.name }}
                                            </h3>
                                            <div class="place-rating">
                                                <Star
                                                    :size="16"
                                                    class="star-icon"
                                                    fill="currentColor"
                                                />
                                                <span>{{
                                                    stop.place.averageRating.toFixed(
                                                        1,
                                                    )
                                                }}</span>
                                            </div>
                                        </div>

                                        <div class="place-details">
                                            <div class="place-location">
                                                <MapPin
                                                    :size="14"
                                                    class="shrink-0"
                                                />
                                                <span class="truncate"
                                                    >{{ stop.place.city }},
                                                    {{
                                                        stop.place.country
                                                    }}</span
                                                >
                                            </div>
                                            <div class="place-reviews">
                                                {{ stop.place.reviewCount }}
                                                reviews
                                            </div>
                                        </div>

                                        <!-- Stop Info -->
                                        <div
                                            v-if="
                                                stop.arrivalTime || stop.notes
                                            "
                                            class="stop-info"
                                        >
                                            <div
                                                v-if="stop.arrivalTime"
                                                class="flex items-center gap-1.5 text-xs text-muted-foreground"
                                            >
                                                <Clock
                                                    :size="12"
                                                    class="shrink-0"
                                                />
                                                <span>{{
                                                    formatArrivalTime(
                                                        stop.arrivalTime,
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
                                    <div class="place-actions">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            class="action-button remove-button"
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
</template>

<style scoped>
/* Button Styles */
.new-trip-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #ff755d;
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(255, 117, 93, 0.28);
    transition:
        background 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.new-trip-btn:hover {
    background: #ff684e;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(255, 104, 78, 0.35);
}

.new-trip-btn:active {
    transform: translateY(0);
}

/* Stop Group Styles */
.stop-group {
    border-radius: 0.75rem;
    background: var(--card);
    border: 1px solid var(--border);
    overflow: hidden;
    transition: border-color 0.2s ease;
}

.stop-group:hover {
    border-color: hsl(var(--border) / 0.8);
}

.group-trigger {
    width: 100%;
    padding: 1rem 1.25rem;
    background: hsl(var(--muted) / 0.5);
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.group-trigger:hover {
    background: hsl(var(--muted) / 0.7);
}

.group-trigger:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: -2px;
}

.group-title {
    font-weight: 600;
    font-size: 1rem;
    color: var(--foreground);
}

.chevron-icon {
    color: var(--muted-foreground);
    flex-shrink: 0;
}

.group-content {
    padding: 0 0.75rem 0.75rem;
}

/* Place Card Styles */
.place-card {
    cursor: pointer;
    transition:
        box-shadow 0.2s ease,
        transform 0.2s ease,
        border-color 0.2s ease;
    padding: 0;
    overflow: hidden;
}

.place-card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    transform: translateX(2px);
    border-color: var(--primary);
}

.place-card:active {
    transform: translateX(1px);
}

.place-card-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
}

.place-image {
    width: 64px;
    height: 64px;
    border-radius: 0.5rem;
    object-fit: cover;
    flex-shrink: 0;
    background: var(--muted);
}

.place-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.place-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.place-name {
    font-weight: 600;
    font-size: 1rem;
    color: var(--foreground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
}

.place-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    flex-shrink: 0;
}

.star-icon {
    color: #fbbf24;
}

.place-details {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--muted-foreground);
}

.place-location {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex: 1;
    min-width: 0;
}

.place-reviews {
    color: var(--muted-foreground);
    white-space: nowrap;
}

.stop-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-top: 0.25rem;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.place-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
}

.action-button {
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
}

.remove-button {
    color: var(--muted-foreground);
}

.remove-button:hover:not(:disabled) {
    color: var(--destructive);
    background: hsl(var(--destructive) / 0.1);
}

.remove-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
    .place-card-content {
        gap: 0.75rem;
    }

    .place-image {
        width: 56px;
        height: 56px;
    }

    .place-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }

    .place-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }

    .place-rating {
        align-self: flex-start;
    }
}

@media (max-width: 640px) {
    .place-image {
        width: 48px;
        height: 48px;
    }

    .group-trigger {
        padding: 0.875rem 1rem;
    }

    .group-title {
        font-size: 0.9375rem;
    }

    .place-name {
        font-size: 0.9375rem;
    }

    .new-trip-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
