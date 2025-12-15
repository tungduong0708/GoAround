<script setup lang="ts">
import { useTrips, usePlanTrip } from "@/composables";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import PlanTripModal from "@/components/trip/PlanTripModal.vue";
import { MapPin, Calendar, FileText, Plus } from "lucide-vue-next";

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
</script>

<template>
    <div class="flex w-full flex-col gap-12 px-4 py-8">
        <!-- Page Header Section -->
        <section class="mx-auto w-full max-w-6xl">
            <div class="trips-header">
                <div class="title-block">
                    <h1 class="trips-title">MY TRIPS</h1>
                    <p class="trips-subtitle">
                        Organize and plan your adventures
                    </p>
                </div>
                <Button
                    class="new-trip-btn"
                    type="button"
                    @click="openPlanTripModal"
                >
                    <Plus :size="20" class="mr-2" />
                    <span>New Trip</span>
                </Button>
            </div>
        </section>

        <!-- Loading State -->
        <section v-if="loading" class="mx-auto w-full max-w-6xl">
            <div class="flex items-center justify-center py-12">
                <div class="text-center">
                    <div
                        class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
                    ></div>
                    <p class="mt-4 text-muted-foreground">Loading trips...</p>
                </div>
            </div>
        </section>

        <!-- Error State -->
        <section v-else-if="error" class="mx-auto w-full max-w-6xl">
            <div
                class="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center"
            >
                <p class="text-destructive">{{ error }}</p>
            </div>
        </section>

        <!-- Empty State -->
        <section v-else-if="!hasTrips" class="mx-auto w-full max-w-6xl">
            <div class="text-center py-12">
                <FileText
                    :size="48"
                    class="mx-auto text-muted-foreground mb-4"
                />
                <h3 class="text-xl font-semibold mb-2">No trips yet</h3>
                <p class="text-muted-foreground mb-6">
                    Start planning your next adventure!
                </p>
                <Button type="button" @click="openPlanTripModal">
                    <Plus :size="20" class="mr-2" />
                    Create Your First Trip
                </Button>
            </div>
        </section>

        <!-- Trips Grid Section -->
        <section v-else class="mx-auto w-full max-w-6xl">
            <div class="trip-grid" aria-label="Saved trips">
                <Card
                    v-for="trip in trips"
                    :key="trip.id"
                    class="trip-card"
                    @click="handleTripSelect(trip)"
                >
                    <CardHeader>
                        <CardTitle class="trip-card-title">{{
                            trip.tripName
                        }}</CardTitle>
                    </CardHeader>

                    <CardContent class="trip-meta">
                        <div class="meta-item">
                            <MapPin :size="18" class="meta-icon" />
                            <span>{{ formatTripLocation(trip) }}</span>
                        </div>

                        <div class="meta-item">
                            <Calendar :size="18" class="meta-icon" />
                            <span>{{ formatTripDateRange(trip) }}</span>
                        </div>

                        <div class="meta-item">
                            <FileText :size="18" class="meta-icon" />
                            <span class="place-count">
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
    </div>
</template>

<style scoped>
.trips-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.trips-title {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--foreground);
}

.trips-subtitle {
    margin: 0.5rem 0 0;
    color: var(--muted-foreground);
    font-size: 1rem;
}

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

.new-trip-btn:focus-visible {
    outline: 2px solid #ff755d;
    outline-offset: 3px;
}

.trip-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.trip-card {
    cursor: pointer;
    transition:
        box-shadow 0.2s ease,
        transform 0.2s ease,
        border-color 0.2s ease;
}

.trip-card:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
    border-color: var(--primary);
}

.trip-card-title {
    font-size: 1.25rem;
    color: var(--foreground);
}

.trip-meta {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    padding-top: 0 !important;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--muted-foreground);
    font-size: 0.9375rem;
}

.meta-icon {
    color: #ff755d;
    flex-shrink: 0;
}

.place-count {
    color: var(--foreground);
    font-weight: 600;
}

@media (max-width: 768px) {
    .trips-title {
        font-size: 2rem;
    }

    .trips-subtitle {
        font-size: 0.9375rem;
    }

    .trip-grid {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1rem;
    }
}

@media (max-width: 640px) {
    .trips-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .new-trip-btn {
        width: 100%;
        justify-content: center;
    }

    .trip-grid {
        grid-template-columns: 1fr;
    }
}
</style>
