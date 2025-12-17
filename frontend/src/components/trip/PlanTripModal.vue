<script setup lang="ts">
import { ref, computed } from "vue";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Trash2, Star } from "lucide-vue-next";
import type { IPlace } from "@/utils/interfaces";

interface PlanTripModalProps {
    open?: boolean;
}

interface PlanTripModalEmits {
    (e: "update:open", value: boolean): void;
    (e: "submit", data: TripFormData): void;
}

interface TripFormData {
    tripName: string;
    destination: string;
    startDate: string;
    endDate: string;
    places: IPlace[];
}

const props = withDefaults(defineProps<PlanTripModalProps>(), {
    open: false,
});

const emit = defineEmits<PlanTripModalEmits>();

// Form data
const tripName = ref("");
const destination = ref("");
const startDate = ref("");
const endDate = ref("");
// TODO: Fetch places from API
const places = ref<IPlace[]>([
    {
        id: "1",
        name: "Colosseum",
        placeType: "landmark",
        address: "Piazza del Colosseo, 1",
        city: "Rome",
        country: "Italy",
        location: {
            type: "Point",
            coordinates: [12.4924, 41.8902],
        },
        mainImageUrl: "684015-58379d421a52?w=400",
        averageRating: 5,
        reviewCount: 180,
    },
    {
        id: "3",
        name: "Pantheon",
        placeType: "landmark",
        address: "Piazza della Rotonda",
        city: "Rome",
        country: "Italy",
        location: {
            type: "Point",
            coordinates: [12.4768, 41.8986],
        },
        mainImageUrl:
            "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400",
        averageRating: 5,
        reviewCount: 220,
    },
    {
        id: "4",
        name: "Vatican Museums",
        placeType: "landmark",
        address: "Viale Vaticano",
        city: "Vatican City",
        country: "Italy",
        location: {
            type: "Point",
            coordinates: [12.4534, 41.9065],
        },
        mainImageUrl:
            "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400",
        averageRating: 5,
        reviewCount: 300,
    },
    {
        id: "5",
        name: "Roman Forum",
        placeType: "landmark",
        address: "Via della Salara Vecchia",
        city: "Rome",
        country: "Italy",
        location: {
            type: "Point",
            coordinates: [12.4853, 41.8925],
        },
        mainImageUrl:
            "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400",
        averageRating: 4.8,
        reviewCount: 150,
    },
]);
const newPlaceInput = ref("");

const isFormValid = computed(() => {
    return tripName.value.trim() !== "" && destination.value.trim() !== "";
});

const handleOpenChange = (value: boolean) => {
    emit("update:open", value);
};

const handleSubmit = () => {
    if (!isFormValid.value) return;

    emit("submit", {
        tripName: tripName.value,
        destination: destination.value,
        startDate: startDate.value,
        endDate: endDate.value,
        places: places.value,
    });

    handleCancel();
};

const handleCancel = () => {
    // Reset form
    tripName.value = "";
    destination.value = "";
    startDate.value = "";
    endDate.value = "";
    places.value = [];
    newPlaceInput.value = "";
    emit("update:open", false);
};

const removePlace = (id: string) => {
    places.value = places.value.filter((place) => place.id !== id);
};

const addPlaceFromInput = () => {
    if (newPlaceInput.value.trim()) {
        // In a real implementation, this would search for places
        // For now, just show the input as a placeholder
        newPlaceInput.value = "";
    }
};
</script>

<template>
    <Dialog :open="props.open" @update:open="handleOpenChange">
        <DialogContent class="plan-trip-modal">
            <DialogHeader class="modal-header">
                <DialogTitle class="modal-title">Plan a New Trip</DialogTitle>
                <p class="modal-subtitle">
                    Create and organize your perfect itinerary
                </p>
            </DialogHeader>

            <Separator class="dotted-separator" />

            <div class="modal-body">
                <!-- Trip Name -->
                <div class="form-group">
                    <Label for="trip-name" class="form-label">
                        Trip Name
                    </Label>
                    <Input
                        id="trip-name"
                        v-model="tripName"
                        type="text"
                        placeholder="e.g. Summer in Italy"
                        class="form-input"
                    />
                </div>

                <!-- Destination -->
                <div class="form-group">
                    <Label
                        for="destination"
                        class="form-label destination-label"
                    >
                        <MapPin :size="16" class="label-icon" />
                        Destination
                    </Label>
                    <Input
                        id="destination"
                        v-model="destination"
                        type="text"
                        placeholder="Where are you going?"
                        class="form-input"
                    />
                </div>

                <!-- Dates -->
                <div class="dates-group">
                    <div class="form-group">
                        <Label for="start-date" class="form-label date-label">
                            <Calendar :size="16" class="label-icon" />
                            Start Date
                        </Label>
                        <Input
                            id="start-date"
                            v-model="startDate"
                            type="text"
                            placeholder="mm/dd/yyyy"
                            class="form-input"
                        />
                    </div>

                    <div class="form-group">
                        <Label for="end-date" class="form-label">
                            End Date
                        </Label>
                        <Input
                            id="end-date"
                            v-model="endDate"
                            type="text"
                            placeholder="mm/dd/yyyy"
                            class="form-input"
                        />
                    </div>
                </div>

                <!-- Add Places Section -->
                <div class="places-section">
                    <div class="places-header">
                        <Label class="section-label">Add Places to Trip</Label>
                        <Button
                            variant="link"
                            size="sm"
                            class="link-button"
                            type="button"
                        >
                            Add from Saved List
                        </Button>
                    </div>

                    <!-- Places List with ScrollArea -->
                    <ScrollArea
                        v-if="places.length > 0"
                        class="places-scroll-area"
                    >
                        <div class="places-list">
                            <div
                                v-for="place in places"
                                :key="place.id"
                                class="place-item"
                            >
                                <img
                                    :src="place.mainImageUrl"
                                    :alt="place.name"
                                    class="place-image"
                                />
                                <div class="place-info">
                                    <h4 class="place-name">{{ place.name }}</h4>
                                    <div class="place-meta">
                                        <MapPin :size="14" class="meta-icon" />
                                        <span class="place-location">
                                            {{ place.city }},
                                            {{ place.country }}
                                        </span>
                                    </div>
                                    <div class="place-rating">
                                        <Star
                                            :size="14"
                                            class="star-icon"
                                            fill="currentColor"
                                        />
                                        <span class="rating-value">
                                            {{ place.averageRating }}
                                        </span>
                                        <span class="review-count">
                                            {{ place.reviewCount }} reviews
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    class="delete-button"
                                    type="button"
                                    @click="removePlace(place.id)"
                                    aria-label="Remove place"
                                >
                                    <Trash2 :size="18" />
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>

                    <!-- Add Place Input -->
                    <div class="add-place-input">
                        <Input
                            v-model="newPlaceInput"
                            type="text"
                            placeholder="e.g. Colosseum, Rome, Italy"
                            class="form-input"
                            @keyup.enter="addPlaceFromInput"
                        />
                    </div>
                </div>
            </div>

            <!-- Footer Actions -->
            <Separator />
            <div class="modal-footer">
                <Button
                    type="button"
                    class="submit-button"
                    :disabled="!isFormValid"
                    @click="handleSubmit"
                >
                    Submit Review
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    class="cancel-button"
                    @click="handleCancel"
                >
                    Cancel
                </Button>
            </div>
        </DialogContent>
    </Dialog>
</template>

<style scoped>
.plan-trip-modal {
    max-width: 480px;
    max-height: 75vh;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow: hidden;
}

.modal-header {
    padding: 1.25rem 1.5rem 1rem;
}

.dotted-separator {
    border-top: 2px dotted hsl(var(--border));
    background: transparent;
}

.modal-title {
    font-size: 1.375rem;
    font-weight: 700;
    color: hsl(var(--foreground));
    margin-bottom: 0.25rem;
    letter-spacing: -0.01em;
}

.modal-subtitle {
    font-size: 0.875rem;
    color: hsl(var(--muted-foreground));
    margin: 0;
    font-weight: 400;
}

.modal-body {
    padding: 1.25rem 1.5rem;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.label-icon {
    color: #ff755d;
    flex-shrink: 0;
}

.form-input {
    font-size: 0.875rem;
    height: 38px;
}

.dates-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.places-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0;
}

.places-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
}

.section-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: hsl(var(--foreground));
}

.link-button {
    color: #ff755d;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    height: auto;
}

.link-button:hover {
    color: #ff684e;
    background: #fff5f3;
}

.places-scroll-area {
    height: 180px;
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    background: hsl(var(--background));
}

.places-list {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
}

.place-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem;
    border: 1.5px solid hsl(var(--border));
    border-radius: 0.5rem;
    background: hsl(var(--background));
    transition: all 0.2s ease;
}

.place-item:hover {
    border-color: #ff755d;
    box-shadow: 0 2px 8px rgba(255, 117, 93, 0.1);
}

.place-image {
    width: 52px;
    height: 52px;
    border-radius: 0.375rem;
    object-fit: cover;
    flex-shrink: 0;
    background: hsl(var(--muted));
}

.place-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.place-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.place-meta {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
}

.meta-icon {
    color: hsl(var(--muted-foreground));
    flex-shrink: 0;
}

.place-location {
    color: hsl(var(--muted-foreground));
}

.place-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
}

.star-icon {
    color: #fbbf24;
    flex-shrink: 0;
}

.rating-value {
    font-weight: 600;
    color: hsl(var(--foreground));
}

.review-count {
    color: hsl(var(--muted-foreground));
}

.delete-button {
    color: #ef4444;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
}

.delete-button:hover {
    background-color: #fef2f2;
    color: #dc2626;
}

.add-place-input {
    margin-top: 0.25rem;
}

.modal-footer {
    padding: 1rem 1.5rem;
    display: flex;
    gap: 0.75rem;
}

.submit-button {
    flex: 1;
    background: #ff755d;
    color: white;
    font-weight: 600;
    height: 40px;
}

.submit-button:hover:not(:disabled) {
    background: #ff684e;
}

.submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.cancel-button {
    flex: 1;
    font-weight: 600;
    height: 40px;
}

@media (max-width: 640px) {
    .plan-trip-modal {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
    }

    .modal-header {
        padding: 1rem 1.25rem 0.875rem;
    }

    .modal-body {
        padding: 1rem 1.25rem;
    }

    .modal-footer {
        padding: 1rem 1.25rem;
    }

    .dates-group {
        grid-template-columns: 1fr;
    }

    .modal-footer {
        flex-direction: column-reverse;
    }

    .places-scroll-area {
        height: 150px;
    }
}
</style>
