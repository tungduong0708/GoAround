<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Hotel, UtensilsCrossed, Coffee, Landmark, Loader2, Clock } from "lucide-vue-next";
import ImageUpload from "@/components/common/ImageUpload.vue";
import LocationPickerModal from "@/components/common/LocationPickerModal.vue";
import HotelDetailsForm from "@/components/place/HotelDetailsForm.vue";
import RestaurantDetailsForm from "@/components/place/RestaurantDetailsForm.vue";
import CafeDetailsForm from "@/components/place/CafeDetailsForm.vue";
import LandmarkDetailsForm from "@/components/place/LandmarkDetailsForm.vue";
import PlacesService from "@/services/PlacesService";
import type { IPlaceCreate } from "@/utils/interfaces";

const router = useRouter();

// Form state
const placeName = ref("");
const selectedCategory = ref<"hotel" | "restaurant" | "cafe" | "landmark">("hotel");
const address = ref("");
const city = ref("");
const country = ref("");
const description = ref("");
const latitude = ref<number | null>(null);
const longitude = ref<number | null>(null);
const showLocationPicker = ref(false);
const mainImageUrl = ref("");
const additionalImages = ref<string[]>([]);
const tags = ref("");

// Operating hours - default all closed
const operatingHours = ref({
  monday: { open: "", close: "", closed: true },
  tuesday: { open: "", close: "", closed: true },
  wednesday: { open: "", close: "", closed: true },
  thursday: { open: "", close: "", closed: true },
  friday: { open: "", close: "", closed: true },
  saturday: { open: "", close: "", closed: true },
  sunday: { open: "", close: "", closed: true },
});

// Category-specific fields
// Hotel fields
const hotelClass = ref<number | null>(null);
const pricePerNight = ref<number | null>(null);
const hotelAmenities = ref("");

// Restaurant fields
const cuisineType = ref("");
const restaurantPriceRange = ref("");

// Cafe fields
const coffeeSpecialties = ref("");
const cafeAmenities = ref("");
const cafePriceRange = ref("");

// Landmark fields
const ticketPrice = ref<number | null>(null);

// UI state
const isSubmitting = ref(false);
const errorMessage = ref("");
const uploadError = ref("");

const categories = [
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { value: "cafe", label: "Café", icon: Coffee },
  { value: "landmark", label: "Landmark", icon: Landmark },
];

const fullAddress = computed(() => {
  const parts = [address.value, city.value, country.value].filter(Boolean);
  return parts.join(", ");
});

const isFormValid = computed(() => {
  return placeName.value.trim() !== "" && 
         address.value.trim() !== "" && 
         selectedCategory.value !== null;
});

const handleMainImageUpload = (url: string) => {
  mainImageUrl.value = url;
  uploadError.value = "";
};

const handleAdditionalImagesUpdate = (urls: string[] | string) => {
  additionalImages.value = Array.isArray(urls) ? urls : [urls];
};

const handleUploadError = (error: string) => {
  uploadError.value = error;
  setTimeout(() => {
    uploadError.value = "";
  }, 5000);
};

const toggleDayClosed = (day: keyof typeof operatingHours.value) => {
  operatingHours.value[day].closed = !operatingHours.value[day].closed;
  if (operatingHours.value[day].closed) {
    operatingHours.value[day].open = "";
    operatingHours.value[day].close = "";
  }
};

const copyToAll = (day: keyof typeof operatingHours.value) => {
  const source = operatingHours.value[day];
  Object.keys(operatingHours.value).forEach((key) => {
    if (key !== day) {
      const targetDay = key as keyof typeof operatingHours.value;
      operatingHours.value[targetDay] = { ...source };
    }
  });
};

const handleLocationSelected = (location: { lat: number; lng: number }) => {
  latitude.value = location.lat;
  longitude.value = location.lng;
  console.log('Location selected:', location);
};

const openLocationPicker = () => {
  showLocationPicker.value = true;
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    // Convert operating hours to backend format (only include open days)
    const openingHoursBackend: Record<string, string> = {};
    const dayMap: Record<keyof typeof operatingHours.value, string> = {
      monday: "mon",
      tuesday: "tue",
      wednesday: "wed",
      thursday: "thu",
      friday: "fri",
      saturday: "sat",
      sunday: "sun",
    };

    Object.entries(operatingHours.value).forEach(([day, hours]) => {
      const backendDay = dayMap[day as keyof typeof operatingHours.value];
      if (!hours.closed && hours.open && hours.close) {
        // Only include open days with valid times
        openingHoursBackend[backendDay] = `${hours.open} - ${hours.close}`;
      }
      // Don't include closed days at all
    });

    const placeData: IPlaceCreate = {
      name: placeName.value.trim(),
      address: address.value.trim() || null,
      city: city.value.trim() || null,
      country: country.value.trim() || null,
      place_type: selectedCategory.value,
      description: description.value.trim() || null,
      main_image_url: mainImageUrl.value || null,
      images: additionalImages.value.length > 0 ? additionalImages.value : [],
      tags: tags.value ? tags.value.split(",").map(t => t.trim()).filter(Boolean) : [],
      opening_hours: Object.keys(openingHoursBackend).length > 0 ? openingHoursBackend : null,
      location: (latitude.value !== null && longitude.value !== null) 
        ? { lat: latitude.value, lng: longitude.value } 
        : null,
    };

    // Add category-specific fields
    if (selectedCategory.value === "hotel") {
      placeData.hotel_class = (hotelClass.value !== null && hotelClass.value !== undefined && !isNaN(hotelClass.value)) ? hotelClass.value : null;
      placeData.price_per_night = (pricePerNight.value !== null && pricePerNight.value !== undefined && !isNaN(pricePerNight.value)) ? pricePerNight.value : null;
      placeData.amenities = hotelAmenities.value ? hotelAmenities.value.split(",").map(a => a.trim()).filter(Boolean) : null;
    } else if (selectedCategory.value === "restaurant") {
      placeData.cuisine_type = cuisineType.value.trim() || null;
      placeData.price_range = restaurantPriceRange.value || null;
    } else if (selectedCategory.value === "cafe") {
      placeData.coffee_specialties = coffeeSpecialties.value.trim() || null;
      placeData.amenities = cafeAmenities.value ? cafeAmenities.value.split(",").map(a => a.trim()).filter(Boolean) : null;
      placeData.price_range = cafePriceRange.value || null;
    } else if (selectedCategory.value === "landmark") {
      placeData.ticket_price = (ticketPrice.value !== null && ticketPrice.value !== undefined && !isNaN(ticketPrice.value)) ? ticketPrice.value : null;
    }

    const createdPlace = await PlacesService.createPlace(placeData);
    
    // Navigate to the created place details page
    router.push({ name: "details", params: { id: createdPlace.id } });
  } catch (error: any) {
    errorMessage.value = "Error creating place:" + error.detail;
    
    // Extract error message from various possible error structures
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle validation errors (array of error objects)
      if (Array.isArray(errorData.detail)) {
        errorMessage.value = errorData.detail
          .map((err: any) => `${err.loc?.join(' → ') || 'Error'}: ${err.msg}`)
          .join('; ');
      } 
      // Handle single error detail (string or object)
      else if (typeof errorData.detail === 'string') {
        errorMessage.value = errorData.detail;
      } 
      // Handle error object with message
      else if (errorData.message) {
        errorMessage.value = errorData.message;
      }
      // Fallback to generic message from error data
      else {
        errorMessage.value = JSON.stringify(errorData.detail || errorData);
      }
    } 
    // Handle error message directly on error object
    else if (error.message) {
      errorMessage.value = error.detail;
    } 
    // Ultimate fallback
    else {
      errorMessage.value = "Failed to create place. Please try again. Error: " + (error.detail ? error.detail : "Unknown error occurred.");
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="container max-w-4xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="space-y-2">
      <Button variant="ghost" @click="router.back()" class="mb-2">
        <ArrowLeft class="mr-2 size-4" />
        Go Back
      </Button>
      <h1 class="text-3xl font-bold">Add New Place</h1>
      <p class="text-muted-foreground">Register a new venue, attraction, or business location</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Place Name -->
      <Card>
        <CardContent class="pt-6">
          <div class="space-y-2">
            <Label for="placeName" class="text-base">
              Place Name <span class="text-destructive">*</span>
            </Label>
            <Input
              id="placeName"
              v-model="placeName"
              type="text"
              placeholder="e.g., Grand Plaza Hotel"
              :disabled="isSubmitting"
              required
            />
          </div>
        </CardContent>
      </Card>

      <!-- Category -->
      <Card>
        <CardContent class="pt-6">
          <div class="space-y-3">
            <Label class="text-base">
              Category <span class="text-destructive">*</span>
            </Label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                v-for="category in categories"
                :key="category.value"
                type="button"
                @click="selectedCategory = category.value as any"
                :class="[
                  'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:border-primary/50',
                  selectedCategory === category.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background'
                ]"
                :disabled="isSubmitting"
              >
                <component 
                  :is="category.icon" 
                  :size="32" 
                  :class="selectedCategory === category.value ? 'text-primary' : 'text-muted-foreground'" 
                />
                <span class="font-medium text-sm">{{ category.label }}</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Location -->
      <Card>
        <CardHeader>
          <CardTitle>Location <span class="text-destructive">*</span></CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="address">
              Physical Address <span class="text-destructive">*</span>
            </Label>
            <div class="relative">
              <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="address"
                v-model="address"
                type="text"
                placeholder="e.g., 123 Main Street, Paris, France"
                class="pl-10"
                :disabled="isSubmitting"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="city">City</Label>
              <Input
                id="city"
                v-model="city"
                type="text"
                placeholder="Paris"
                :disabled="isSubmitting"
              />
            </div>
            <div class="space-y-2">
              <Label for="country">Country</Label>
              <Input
                id="country"
                v-model="country"
                type="text"
                placeholder="France"
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <!-- Location Picker -->
          <div v-if="!latitude || !longitude" class="space-y-3">
            <Button 
              type="button"
              variant="outline" 
              class="w-full h-20 border-2 border-dashed"
              @click="openLocationPicker"
              :disabled="isSubmitting"
            >
              <div class="flex flex-col items-center gap-2">
                <MapPin class="size-5" />
                <div class="text-sm">
                  <p class="font-medium">Choose Location on Map</p>
                  <p class="text-xs text-muted-foreground">Click to select coordinates</p>
                </div>
              </div>
            </Button>
          </div>

          <!-- Selected Location Display -->
          <div v-else class="space-y-3">
            <div class="p-4 border-2 border-primary/20 bg-primary/5 rounded-xl">
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-primary/10 rounded-lg">
                    <MapPin class="size-5 text-primary" />
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm font-medium">Location Selected</p>
                    <p class="text-xs text-muted-foreground font-mono">
                      {{ latitude?.toFixed(6) }}, {{ longitude?.toFixed(6) }}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="openLocationPicker"
                  :disabled="isSubmitting"
                >
                  Change
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Operating Hours -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Clock class="w-5 h-5" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="(day, key) in operatingHours"
            :key="key"
            class="grid grid-cols-12 gap-3 items-center"
          >
            <div class="col-span-2 font-medium capitalize">{{ key }}</div>
            <template v-if="!day.closed">
              <Input
                v-model="day.open"
                type="time"
                class="col-span-3"
                :disabled="isSubmitting"
              />
              <span class="col-span-1 text-center text-muted-foreground">to</span>
              <Input
                v-model="day.close"
                type="time"
                class="col-span-3"
                :disabled="isSubmitting"
              />
            </template>
            <div v-else class="col-span-7 text-muted-foreground">Closed</div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="col-span-2"
              @click="toggleDayClosed(key as keyof typeof operatingHours)"
              :disabled="isSubmitting"
            >
              {{ day.closed ? "Open" : "Closed" }}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="col-span-1"
              @click="copyToAll(key as keyof typeof operatingHours)"
              :disabled="isSubmitting || day.closed"
              title="Copy to all days"
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Description -->
      <Card>
        <CardContent class="pt-6">
          <div class="space-y-2">
            <Label for="description" class="text-base">
              Description <span class="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              v-model="description"
              placeholder="Describe your place, its features, and what makes it special..."
              :disabled="isSubmitting"
              rows="5"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Category-Specific Fields -->
      <HotelDetailsForm
        v-if="selectedCategory === 'hotel'"
        v-model:hotel-class="hotelClass"
        v-model:price-per-night="pricePerNight"
        v-model:amenities="hotelAmenities"
        :disabled="isSubmitting"
      />

      <RestaurantDetailsForm
        v-if="selectedCategory === 'restaurant'"
        v-model:cuisine-type="cuisineType"
        v-model:price-range="restaurantPriceRange"
        :disabled="isSubmitting"
      />

      <CafeDetailsForm
        v-if="selectedCategory === 'cafe'"
        v-model:coffee-specialties="coffeeSpecialties"
        v-model:amenities="cafeAmenities"
        v-model:price-range="cafePriceRange"
        :disabled="isSubmitting"
      />

      <LandmarkDetailsForm
        v-if="selectedCategory === 'landmark'"
        v-model:ticket-price="ticketPrice"
        :disabled="isSubmitting"
      />

      <!-- Main Image -->
      <Card>
        <CardHeader>
          <CardTitle>Main Image</CardTitle>
          <CardDescription>
            Upload a primary image for your place (max 10MB). This will be the cover image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            v-model="mainImageUrl"
            upload-type="place"
            :max-size-in-m-b="10"
            :disabled="isSubmitting"
            @upload="handleMainImageUpload"
            @error="handleUploadError"
          />
        </CardContent>
      </Card>

      <!-- Additional Images -->
      <Card>
        <CardHeader>
          <CardTitle>Additional Images</CardTitle>
          <CardDescription>
            Upload multiple images for your place (up to 10 images, max 10MB each). 
            These will showcase your location to other users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            v-model="additionalImages"
            multiple
            upload-type="place"
            :max-files="10"
            :max-size-in-m-b="10"
            :disabled="isSubmitting"
            @update:model-value="handleAdditionalImagesUpdate"
            @error="handleUploadError"
          />
        </CardContent>
      </Card>

      <!-- Tags -->
      <Card>
        <CardContent class="pt-6">
          <div class="space-y-2">
            <Label for="tags" class="text-base">Tags (Optional)</Label>
            <Input
              id="tags"
              v-model="tags"
              type="text"
              placeholder="e.g., luxury, family-friendly, pet-friendly (comma separated)"
              :disabled="isSubmitting"
            />
            <p class="text-xs text-muted-foreground">
              Separate tags with commas to help users find your place
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Error Messages -->
      <div v-if="uploadError" class="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
        {{ uploadError }}
      </div>

      <div v-if="errorMessage" class="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
        {{ errorMessage }}
      </div>

      <!-- Submit Buttons -->
      <div class="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          @click="router.back()"
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          :disabled="!isFormValid || isSubmitting"
        >
          <Loader2 v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
          {{ isSubmitting ? "Creating..." : "Create Place" }}
        </Button>
      </div>
    </form>

    <!-- Location Picker Modal -->
    <LocationPickerModal
      v-model:open="showLocationPicker"
      :initial-lat="latitude || 10.8231"
      :initial-lng="longitude || 106.6297"
      @select="handleLocationSelected"
    />
  </div>
</template>

<style scoped>
</style>
