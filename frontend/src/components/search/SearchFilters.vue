<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { XIcon, StarIcon, SlidersHorizontalIcon, MapPinIcon, Loader2Icon } from 'lucide-vue-next'
import type { IPlaceSearchQuery } from '@/utils/interfaces'
import { useGeolocation } from '@/composables'

interface SearchFiltersProps {
  modelValue: Partial<Omit<IPlaceSearchQuery, 'q' | 'place_type'>>
  category?: 'all' | 'hotel' | 'restaurant' | 'cafe' | 'landmark'
}

const props = withDefaults(defineProps<SearchFiltersProps>(), {
  category: 'all'
})

const emit = defineEmits<{
  'update:modelValue': [value: Partial<Omit<IPlaceSearchQuery, 'q' | 'place_type'>>]
  apply: []
  clear: []
}>()

const isOpen = ref(false)

// Geolocation
const { 
  loading: geoLoading, 
  error: geoError,
  isSupported: geoSupported,
  getCurrentLocation,
  clearLocation 
} = useGeolocation()

// Computed properties to determine which filters to show based on category
const showHotelFilters = computed(() => props.category === 'hotel' || props.category === 'all')
const showRestaurantFilters = computed(() => props.category === 'restaurant' || props.category === 'cafe' || props.category === 'all')

// Local filter state
const localFilters = ref<Partial<Omit<IPlaceSearchQuery, 'q' | 'place_type'>>>({
  ...props.modelValue
})

// Price range (in VND)
const priceMin = computed({
  get: () => localFilters.value.price_per_night_min ?? 0,
  set: (val) => {
    const numVal = Number(val)
    if (numVal > 0) {
      // Ensure min doesn't exceed max
      const currentMax = priceMax.value
      localFilters.value.price_per_night_min = numVal <= currentMax ? numVal : currentMax
    } else {
      localFilters.value.price_per_night_min = null
    }
  }
})

const priceMax = computed({
  get: () => localFilters.value.price_per_night_max ?? 10000000,
  set: (val) => {
    const numVal = Number(val)
    if (numVal < 10000000 && numVal > 0) {
      // Ensure max doesn't go below min
      const currentMin = priceMin.value
      localFilters.value.price_per_night_max = numVal >= currentMin ? numVal : currentMin
    } else {
      localFilters.value.price_per_night_max = null
    }
  }
})

// Hotel class
const hotelClass = computed({
  get: () => localFilters.value.hotel_class ?? null,
  set: (val) => {
    localFilters.value.hotel_class = val
  }
})

// Rating
const rating = computed({
  get: () => localFilters.value.rating ?? null,
  set: (val) => {
    localFilters.value.rating = val
  }
})

// Radius
const radiusValue = computed({
  get: () => [localFilters.value.radius ?? 5000],
  set: (val: number[]) => {
    localFilters.value.radius = val[0]
  }
})

const radius = computed({
  get: () => localFilters.value.radius ?? 5000,
  set: (val) => {
    localFilters.value.radius = val
  }
})

// Location toggle - use ref instead of computed for async operations
const useLocation = computed(() => !!localFilters.value.location)

const handleLocationToggle = async (val: boolean) => {
  console.log("Location toggle changed to:", val);
  if (val) {
    const loc = await getCurrentLocation()
    console.log("Got location:", loc);
    if (loc) {
      // Trigger reactivity by creating a new object
      localFilters.value = {
        ...localFilters.value,
        location: loc
      }
      console.log("Location set in localFilters:", localFilters.value.location);
    }
  } else {
    // Trigger reactivity by creating a new object
    localFilters.value = {
      ...localFilters.value,
      location: null
    }
    clearLocation()
    console.log("Location cleared");
  }
}

// Sort by
const sortBy = computed({
  get: () => localFilters.value.sort_by ?? 'rating',
  set: (val) => {
    localFilters.value.sort_by = val as 'rating' | 'distance' | 'newest'
  }
})

// Price range options (VND)
const priceRanges = [
  { value: null, label: 'Any' },
  { value: '₫', label: '₫ (Budget)' },
  { value: '₫₫', label: '₫₫ (Moderate)' },
  { value: '₫₫₫', label: '₫₫₫ (Upscale)' },
  { value: '₫₫₫₫', label: '₫₫₫₫ (Luxury)' },
]

const selectedPriceRange = computed({
  get: () => localFilters.value.price_range ?? null,
  set: (val) => {
    localFilters.value.price_range = val
  }
})

// Amenities (for hotels)
const amenityOptions = [
  'wifi',
  'parking',
  'pool',
  'gym',
  'restaurant',
  'spa',
  'bar',
  'room_service',
  'air_conditioning',
  'breakfast',
]

const selectedAmenities = computed({
  get: () => {
    if (!localFilters.value.amenities) return []
    return localFilters.value.amenities.split(',').filter(Boolean)
  },
  set: (val: string[]) => {
    localFilters.value.amenities = val.length > 0 ? val.join(',') : null
  }
})

const toggleAmenity = (amenity: string) => {
  const current = selectedAmenities.value
  if (current.includes(amenity)) {
    selectedAmenities.value = current.filter(a => a !== amenity)
  } else {
    selectedAmenities.value = [...current, amenity]
  }
}

// Tags
const tagInput = ref('')
const tags = computed({
  get: () => {
    if (!localFilters.value.tags) return []
    return localFilters.value.tags.split(',').filter(Boolean)
  },
  set: (val: string[]) => {
    localFilters.value.tags = val.length > 0 ? val.join(',') : null
  }
})

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !tags.value.includes(tag)) {
    tags.value = [...tags.value, tag]
    tagInput.value = ''
  }
}

const removeTag = (tag: string) => {
  console.log('Removing tag:', tag, 'Current tags:', tags.value)
  tags.value = tags.value.filter(t => t !== tag)
  console.log('Tags after removal:', tags.value)
}

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.value.price_per_night_min !== null && localFilters.value.price_per_night_min !== undefined) count++
  if (localFilters.value.price_per_night_max !== null && localFilters.value.price_per_night_max !== undefined) count++
  if (localFilters.value.hotel_class) count++
  if (localFilters.value.rating) count++
  if (localFilters.value.radius && localFilters.value.radius !== 5000) count++
  if (localFilters.value.amenities) count++
  if (localFilters.value.price_range) count++
  if (localFilters.value.tags) count++
  if (localFilters.value.location) count++
  if (localFilters.value.sort_by && localFilters.value.sort_by !== 'rating') count++
  return count
})

const handleApply = () => {
  console.log("Applying filters:", localFilters.value);
  emit('update:modelValue', { ...localFilters.value })
  emit('apply')
  isOpen.value = false
}

const handleClear = () => {
  localFilters.value = {}
  priceMin.value = 0
  priceMax.value = 10000000
  radius.value = 5000
  sortBy.value = 'rating'
  tagInput.value = ''
  emit('update:modelValue', {})
  emit('clear')
}

const handleOpenChange = (open: boolean) => {
  if (open) {
    // Reset local filters to current prop values when opening
    localFilters.value = { ...props.modelValue }
    console.log("Popover opened, local filters reset to:", localFilters.value);
  }
  isOpen.value = open
}
</script>

<template>
  <Popover :open="isOpen" @update:open="handleOpenChange">
    <PopoverTrigger as-child>
      <slot>
        <Button variant="secondary" size="lg" class="rounded-full px-4 relative">
          <SlidersHorizontalIcon class="mr-2 size-4" aria-hidden="true" />
          Filters
          <Badge
            v-if="activeFiltersCount > 0"
            class="absolute -right-2 -top-2 size-6 rounded-full p-0 flex items-center justify-center"
            variant="default"
          >
            {{ activeFiltersCount }}
          </Badge>
        </Button>
      </slot>
    </PopoverTrigger>
    <PopoverContent class="w-[400px] p-0" align="end">
      <div class="p-4 border-b">
        <h3 class="font-semibold text-lg">Filters</h3>
        <p class="text-sm text-muted-foreground">
          <template v-if="props.category === 'hotel'">Find the perfect hotel</template>
          <template v-else-if="props.category === 'restaurant'">Discover great restaurants</template>
          <template v-else-if="props.category === 'cafe'">Find cozy cafes</template>
          <template v-else-if="props.category === 'landmark'">Explore landmarks</template>
          <template v-else>Customize your search</template>
        </p>
      </div>

      <ScrollArea class="h-[500px]">
        <div class="space-y-6 p-4">
        
        <!-- GENERAL SECTION -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-primary uppercase tracking-wide">General</h3>
          
          <!-- Sort By -->
          <div class="space-y-3">
            <Label class="text-base font-semibold">Sort By</Label>
            <RadioGroup v-model="sortBy">
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="sort-rating" value="rating" />
                <Label for="sort-rating" class="font-normal cursor-pointer">
                  Highest Rating
                </Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="sort-distance" value="distance" :disabled="!useLocation" />
                <Label for="sort-distance" class="font-normal cursor-pointer" :class="{ 'text-muted-foreground': !useLocation }">
                  Nearest First {{ !useLocation ? '(Enable location)' : '' }}
                </Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem id="sort-newest" value="newest" />
                <Label for="sort-newest" class="font-normal cursor-pointer">
                  Newest First
                </Label>
              </div>
            </RadioGroup>
          </div>

          <!-- Minimum Rating -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <Label class="text-base font-semibold">Minimum Rating</Label>
              <span class="text-sm text-muted-foreground">
                {{ rating ? `${rating}+` : 'Any' }}
              </span>
            </div>
            <div class="flex gap-2">
              <Button
                v-for="star in [1, 2, 3, 4, 5]"
                :key="star"
                :variant="rating === star ? 'default' : 'outline'"
                size="sm"
                class="flex-1"
                @click="rating = rating === star ? null : star"
              >
                <StarIcon class="size-4" :class="{ 'fill-current': rating === star }" />
                {{ star }}
              </Button>
            </div>
          </div>

          <!-- Tags -->
          <div class="space-y-3">
            <Label class="text-base font-semibold">Tags</Label>
            <div class="flex gap-2">
              <Input
                v-model="tagInput"
                placeholder="Add a tag..."
                @keydown.enter.prevent="addTag"
              />
              <Button type="button" size="sm" @click="addTag">
                Add
              </Button>
            </div>
            <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
              <Badge
                v-for="tag in tags"
                :key="tag"
                variant="secondary"
                class="gap-1 pr-1"
              >
                {{ tag }}
                <button
                  type="button"
                  class="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                  @click.stop.prevent="removeTag(tag)"
                >
                  <XIcon class="size-3 cursor-pointer hover:text-destructive" />
                </button>
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        <!-- LOCATION SECTION -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-primary uppercase tracking-wide">Location</h3>
          
          <!-- Use My Location -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label class="text-base font-semibold">Use My Location</Label>
                <p class="text-xs text-muted-foreground">
                  Enable to search near you and filter by distance
                </p>
              </div>
              <Switch
                :model-value="useLocation"
                :disabled="!geoSupported || geoLoading"
                @update:model-value="handleLocationToggle"
              />
            </div>
            
            <div v-if="geoLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon class="size-4 animate-spin" />
              Getting your location...
            </div>
            
            <div v-if="geoError" class="text-sm text-destructive">
              {{ geoError }}
            </div>
            
            <div v-if="localFilters.location && !geoLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPinIcon class="size-4" />
              {{ localFilters.location.lat.toFixed(4) }}, {{ localFilters.location.lng.toFixed(4) }}
            </div>
            
            <div v-if="!geoSupported" class="text-sm text-muted-foreground">
              Geolocation is not supported by your browser
            </div>
          </div>

          <!-- Search Radius -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <Label class="text-base font-semibold" :class="{ 'text-muted-foreground': !useLocation }">Search Radius</Label>
              <span class="text-sm text-muted-foreground">
                {{ (radius / 1000).toFixed(1) }} km
              </span>
            </div>
            <Slider
              v-model="radiusValue"
              :min="1000"
              :max="50000"
              :step="1000"
              :disabled="!useLocation"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>
        </div>


        <Separator />

        <!-- HOTEL SECTION -->
        <template v-if="showHotelFilters">
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-primary uppercase tracking-wide">Hotel</h3>
            
            <!-- Hotel Class -->
            <div class="space-y-3">
              <Label class="text-base font-semibold">Hotel Class</Label>
              <div class="flex gap-2">
                <Button
                  v-for="star in [1, 2, 3, 4, 5]"
                  :key="star"
                  :variant="hotelClass === star ? 'default' : 'outline'"
                  size="sm"
                  class="flex-1"
                  @click="hotelClass = hotelClass === star ? null : star"
                >
                  {{ star }}★
                </Button>
              </div>
            </div>

            <!-- Price Per Night -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <Label class="text-base font-semibold">Price Per Night</Label>
                <span class="text-sm text-muted-foreground">
                  {{ priceMin.toLocaleString('vi-VN') }}₫ - {{ priceMax.toLocaleString('vi-VN') }}₫
                </span>
              </div>
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label for="price-min" class="text-sm">Minimum (₫)</Label>
                  <Input
                    id="price-min"
                    v-model.number="priceMin"
                    type="number"
                    min="0"
                    :max="priceMax"
                    step="100000"
                    placeholder="Min price"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="price-max" class="text-sm">Maximum (₫)</Label>
                  <Input
                    id="price-max"
                    v-model.number="priceMax"
                    type="number"
                    :min="priceMin"
                    max="10000000"
                    step="100000"
                    placeholder="Max price"
                  />
                </div>
              </div>
            </div>

            <!-- Amenities (Hotels) -->
            <div class="space-y-3">
              <Label class="text-base font-semibold">Amenities</Label>
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-for="amenity in amenityOptions"
                  :key="amenity"
                  :variant="selectedAmenities.includes(amenity) ? 'default' : 'outline'"
                  class="cursor-pointer capitalize"
                  @click="toggleAmenity(amenity)"
                >
                  {{ amenity.replace('_', ' ') }}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />
        </template>

        <!-- RESTAURANT & CAFE SECTION -->
        <template v-if="showRestaurantFilters">
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-primary uppercase tracking-wide">
              {{ props.category === 'restaurant' ? 'Restaurant' : props.category === 'cafe' ? 'Cafe' : 'Restaurant & Cafe' }}
            </h3>
            
            <!-- Price Range -->
            <div class="space-y-3">
              <Label class="text-base font-semibold">Price Range</Label>
              <RadioGroup v-model="selectedPriceRange">
                <div
                  v-for="range in priceRanges"
                  :key="range.value ?? 'any'"
                  class="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    :id="`price-${range.value ?? 'any'}`"
                    :value="range.value"
                  />
                  <Label
                    :for="`price-${range.value ?? 'any'}`"
                    class="font-normal cursor-pointer"
                  >
                    {{ range.label }}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />
        </template>
        </div>
      </ScrollArea>

      <div class="p-4 border-t flex gap-2">
        <Button
          variant="outline"
          class="flex-1"
          @click="handleClear"
        >
          Clear All
        </Button>
        <Button
          class="flex-1"
          @click="handleApply"
        >
          Apply Filters
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
