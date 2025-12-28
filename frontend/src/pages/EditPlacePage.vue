<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Clock, RefreshCw } from "lucide-vue-next";
import ImageUpload from "@/components/common/ImageUpload.vue";
import TransferOwnershipModal from "@/components/place/TransferOwnershipModal.vue";
import HotelDetailsForm from "@/components/place/HotelDetailsForm.vue";
import RestaurantDetailsForm from "@/components/place/RestaurantDetailsForm.vue";
import CafeDetailsForm from "@/components/place/CafeDetailsForm.vue";
import LandmarkDetailsForm from "@/components/place/LandmarkDetailsForm.vue";
import PlacesService from "@/services/PlacesService";
import type { IPlaceUpdate, IPlaceDetail } from "@/utils/interfaces";

const router = useRouter();
const route = useRoute();
const placeId = route.params.id as string;

// Form state
const placeName = ref("");
const placeType = ref<"hotel" | "restaurant" | "cafe" | "landmark">("hotel");
const address = ref("");
const city = ref("");
const country = ref("");
const description = ref("");
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
const hotelClass = ref<number | null>(null);
const pricePerNight = ref<number | null>(null);
const hotelAmenities = ref("");

const cuisineType = ref("");
const restaurantPriceRange = ref("");

const coffeeSpecialties = ref("");
const cafeAmenities = ref("");
const cafePriceRange = ref("");

const ticketPrice = ref<number | null>(null);

// UI state
const isLoading = ref(true);
const isSubmitting = ref(false);
const errorMessage = ref("");
const uploadError = ref("");
const showTransferModal = ref(false);
const isTransferring = ref(false);
const transferError = ref("");

const isFormValid = computed(() => {
  return placeName.value.trim() !== "" && address.value.trim() !== "";
});

const handleMainImageUpload = (url: string) => {
  mainImageUrl.value = url;
  uploadError.value = "";
};

const handleAdditionalImagesUpdate = (urls: string[]) => {
  additionalImages.value = urls;
};

const handleUploadError = (error: string) => {
  console.error('[EditPlace] Upload error:', error);
  uploadError.value = error;
  // Don't auto-clear the error so user can see it
  // setTimeout(() => {
  //   uploadError.value = "";
  // }, 5000);
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

const loadPlace = async () => {
  if (!placeId) {
    router.push({ name: "manage-places" });
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const place = await PlacesService.getPlaceById(placeId);
    
    // Populate form fields
    placeName.value = place.name;
    placeType.value = place.place_type;
    address.value = place.address || "";
    city.value = place.city || "";
    country.value = place.country || "";
    description.value = place.description || "";
    
    // Handle images: main image is stored separately, additional images exclude the main image
    mainImageUrl.value = place.main_image_url || "";
    const allImageUrls = place.images?.map(img => img.image_url) || [];
    // Filter out the main image from additional images to avoid duplication
    additionalImages.value = allImageUrls.filter(url => url !== place.main_image_url);
    
    tags.value = place.tags?.join(", ") || "";
    
    console.log('[EditPlace] Loaded main image:', mainImageUrl.value);
    console.log('[EditPlace] Loaded additional images:', additionalImages.value);

    // Load operating hours if exists
    // Backend format: { mon: "09:00 - 17:00", tue: "Closed", ... }
    if (place.opening_hours && typeof place.opening_hours === "object") {
      const hours = place.opening_hours as Record<string, string>;
      
      // Map backend day names to full names
      const dayMap: Record<string, keyof typeof operatingHours.value> = {
        mon: "monday",
        tue: "tuesday",
        wed: "wednesday",
        thu: "thursday",
        fri: "friday",
        sat: "saturday",
        sun: "sunday",
      };

      // Reset all to closed first
      Object.keys(operatingHours.value).forEach((day) => {
        operatingHours.value[day as keyof typeof operatingHours.value] = {
          open: "",
          close: "",
          closed: true,
        };
      });

      // Parse backend format
      Object.entries(hours).forEach(([backendDay, timeString]) => {
        const fullDay = dayMap[backendDay.toLowerCase()] || backendDay.toLowerCase();
        if (fullDay in operatingHours.value) {
          // Convert to string to handle any type
          const timeStr = String(timeString || "");
          if (timeStr && timeStr !== "Closed" && timeStr.includes("-")) {
            // Parse "09:00 - 17:00" format
            const [open, close] = timeStr.split("-").map(t => t.trim());
            operatingHours.value[fullDay as keyof typeof operatingHours.value] = {
              open: open || "",
              close: close || "",
              closed: false,
            };
          } else {
            // Closed day
            operatingHours.value[fullDay as keyof typeof operatingHours.value] = {
              open: "",
              close: "",
              closed: true,
            };
          }
        }
      });
    }

    // Load category-specific fields
    if (place.place_type === "hotel") {
      hotelClass.value = place.hotel_class || null;
      pricePerNight.value = place.price_per_night || null;
      hotelAmenities.value = place.amenities?.join(", ") || "";
    } else if (place.place_type === "restaurant") {
      cuisineType.value = place.cuisine_type || "";
      restaurantPriceRange.value = place.price_range || "";
    } else if (place.place_type === "cafe") {
      coffeeSpecialties.value = place.coffee_specialties || "";
      cafeAmenities.value = place.amenities?.join(", ") || "";
      cafePriceRange.value = place.price_range || "";
    } else if (place.place_type === "landmark") {
      ticketPrice.value = place.ticket_price || null;
    }
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to load place";
    console.error("Error loading place:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  console.log('[EditPlace] handleSubmit called');
  console.log('[EditPlace] isFormValid:', isFormValid.value);
  
  if (!isFormValid.value) {
    console.log('[EditPlace] Form is not valid, aborting');
    return;
  }

  console.log('[EditPlace] Starting submission...');
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

    // Combine main image + additional images into single array for backend
    // Backend expects images array to include ALL images (main + additional)
    const allImages: string[] = [];
    if (mainImageUrl.value) {
      allImages.push(mainImageUrl.value);
    }
    if (additionalImages.value.length > 0) {
      allImages.push(...additionalImages.value);
    }

    const placeData: IPlaceUpdate = {
      name: placeName.value.trim(),
      address: address.value.trim() || null,
      city: city.value.trim() || null,
      country: country.value.trim() || null,
      description: description.value.trim() || null,
      main_image_url: mainImageUrl.value || null,
      images: allImages.length > 0 ? allImages : null,
      opening_hours: Object.keys(openingHoursBackend).length > 0 ? openingHoursBackend : null,
    };

    console.log('[EditPlace] Base placeData:', placeData);
    console.log('[EditPlace] Main image:', mainImageUrl.value);
    console.log('[EditPlace] Additional images:', additionalImages.value);
    console.log('[EditPlace] Combined images array:', allImages);

    // Add category-specific fields
    if (placeType.value === "hotel") {
      placeData.hotel_class = hotelClass.value;
      placeData.price_per_night = pricePerNight.value;
      placeData.amenities = hotelAmenities.value
        ? hotelAmenities.value.split(",").map((a) => a.trim()).filter(Boolean)
        : null;
    } else if (placeType.value === "restaurant") {
      placeData.cuisine_type = cuisineType.value.trim() || null;
      placeData.price_range = restaurantPriceRange.value || null;
    } else if (placeType.value === "cafe") {
      placeData.coffee_specialties = coffeeSpecialties.value.trim() || null;
      placeData.amenities = cafeAmenities.value
        ? cafeAmenities.value.split(",").map((a) => a.trim()).filter(Boolean)
        : null;
      placeData.price_range = cafePriceRange.value || null;
    } else if (placeType.value === "landmark") {
      placeData.ticket_price = ticketPrice.value;
    }

    console.log('[EditPlace] Final placeData:', placeData);
    console.log('[EditPlace] Calling updatePlace with placeId:', placeId);

    await PlacesService.updatePlace(placeId, placeData);

    console.log('[EditPlace] Update successful, navigating to manage-places');
    // Navigate back to manage places
    router.push({ name: "manage-places" });
  } catch (error: any) {
    console.error('[EditPlace] Error updating place:', error);
    errorMessage.value = error?.message || "Failed to update place";
  } finally {
    isSubmitting.value = false;
    console.log('[EditPlace] Submission complete');
  }
};

const handleTransferOwnership = async (email: string) => {
  console.log('[EditPlace] handleTransferOwnership called with email:', email);
  if (!placeId) {
    console.error('[EditPlace] No placeId available');
    return;
  }
  
  isTransferring.value = true;
  transferError.value = "";
  
  try {
    console.log('[EditPlace] Calling transferOwnership API');
    await PlacesService.transferOwnership(placeId, { new_owner_email: email });
    console.log('[EditPlace] Transfer successful');
    showTransferModal.value = false;
    // Navigate to manage places after successful transfer
    router.push({ name: "manage-places" });
  } catch (error: any) {
    transferError.value = error?.message || "Failed to transfer ownership";
    console.error("[EditPlace] Error transferring ownership:", error);
  } finally {
    isTransferring.value = false;
  }
};

onMounted(() => {
  loadPlace();
});
</script>

<template>
  <div class="container max-w-4xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="space-y-2">
      <Button variant="ghost" @click="router.back()" class="mb-2">
        <ArrowLeft class="mr-2 size-4" />
        Go Back
      </Button>
      <h1 class="text-3xl font-bold">Edit Place</h1>
      <p class="text-muted-foreground">Update place information</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Error Message -->
      <div v-if="errorMessage" class="p-4 bg-destructive/10 text-destructive rounded-lg">
        {{ errorMessage }}
      </div>

      <!-- Transfer Ownership -->
      <Card class="border-orange-200 dark:border-orange-900 bg-orange-50/30 dark:bg-orange-950/20">
        <CardContent class="pt-6">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <h3 class="text-base font-semibold">Transfer Ownership</h3>
              <p class="text-sm text-muted-foreground">
                Transfer this place to another Business user
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              class="bg-orange-500 hover:bg-orange-600"
              @click="showTransferModal = true"
              :disabled="isSubmitting"
            >
              <RefreshCw class="mr-2 size-4" />
              Transfer Ownership
            </Button>
          </div>
        </CardContent>
      </Card>

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

      <!-- Location -->
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="address">Address <span class="text-destructive">*</span></Label>
            <Input
              id="address"
              v-model="address"
              type="text"
              placeholder="123 Main Street"
              :disabled="isSubmitting"
              required
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="city">City</Label>
              <Input
                id="city"
                v-model="city"
                type="text"
                placeholder="Ho Chi Minh City"
                :disabled="isSubmitting"
              />
            </div>
            <div class="space-y-2">
              <Label for="country">Country</Label>
              <Input
                id="country"
                v-model="country"
                type="text"
                placeholder="Vietnam"
                :disabled="isSubmitting"
              />
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
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="description"
              placeholder="Describe the place..."
              rows="4"
              :disabled="isSubmitting"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Category-Specific Forms -->
      <HotelDetailsForm
        v-if="placeType === 'hotel'"
        v-model:hotel-class="hotelClass"
        v-model:price-per-night="pricePerNight"
        v-model:amenities="hotelAmenities"
        :is-submitting="isSubmitting"
      />

      <RestaurantDetailsForm
        v-if="placeType === 'restaurant'"
        v-model:cuisine-type="cuisineType"
        v-model:price-range="restaurantPriceRange"
        :is-submitting="isSubmitting"
      />

      <CafeDetailsForm
        v-if="placeType === 'cafe'"
        v-model:coffee-specialties="coffeeSpecialties"
        v-model:amenities="cafeAmenities"
        v-model:price-range="cafePriceRange"
        :is-submitting="isSubmitting"
      />

      <LandmarkDetailsForm
        v-if="placeType === 'landmark'"
        v-model:ticket-price="ticketPrice"
        :is-submitting="isSubmitting"
      />

      <!-- Images -->
      <Card>
        <CardHeader>
          <CardTitle>Main Image</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <ImageUpload
            v-model="mainImageUrl"
            :is-submitting="isSubmitting"
            upload-type="place"
            @upload="handleMainImageUpload"
            @error="handleUploadError"
          />

          <div v-if="uploadError" class="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {{ uploadError }}
          </div>
        </CardContent>
      </Card>

      <!-- Additional Images -->
      <Card>
        <CardHeader>
          <CardTitle>Additional Images</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <ImageUpload
            v-model="additionalImages"
            :is-submitting="isSubmitting"
            upload-type="place"
            multiple
            :max-files="10"
            @update:modelValue="handleAdditionalImagesUpdate"
            @error="handleUploadError"
          />
        </CardContent>
      </Card>

      <!-- ardContent>
      </Card>

      <!-- Tags -->
      <Card>
        <CardContent class="pt-6">
          <div class="space-y-2">
            <Label for="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              v-model="tags"
              type="text"
              placeholder="family-friendly, wifi, parking"
              :disabled="isSubmitting"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Submit Button -->
      <div class="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          @click="router.back()"
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
        >
          <Loader2 v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
          Update Place
        </Button>
      </div>
    </form>

    <!-- Transfer Ownership Modal -->
    <TransferOwnershipModal
      v-model:open="showTransferModal"
      :place-name="placeName"
      @transfer="handleTransferOwnership"
    />
  </div>
</template>
