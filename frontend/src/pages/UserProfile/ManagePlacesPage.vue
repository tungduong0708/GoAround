<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Eye, Pencil, Trash2, MapPin, Star, Loader2 } from 'lucide-vue-next'
import PlacesService from '@/services/PlacesService'
import type { IPlacePublic } from '@/utils/interfaces'

const router = useRouter()

const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const places = ref<IPlacePublic[]>([])

const stats = computed(() => ({
  totalPlaces: places.value.length,
  totalReviews: places.value.reduce((sum, place) => sum + (place.review_count || 0), 0)
}))

const filteredPlaces = computed(() => {
  if (!searchQuery.value) return places.value
  
  const query = searchQuery.value.toLowerCase()
  return places.value.filter(place => 
    place.name.toLowerCase().includes(query) ||
    getLocationDisplay(place).toLowerCase().includes(query) ||
    getCategoryDisplay(place.place_type).toLowerCase().includes(query)
  )
})

const getLocationDisplay = (place: IPlacePublic) => {
  const parts = [place.city, place.country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : place.address || 'Unknown'
}

const getCategoryDisplay = (placeType: string) => {
  const categoryMap: Record<string, string> = {
    'hotel': 'Hotel',
    'restaurant': 'Restaurant',
    'cafe': 'Café',
    'landmark': 'Landmark'
  }
  return categoryMap[placeType] || placeType
}

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

const fetchPlaces = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await PlacesService.getOwnedPlaces()
    places.value = response.data || []
  } catch (err: any) {
    error.value = err?.message || 'Failed to fetch places'
    console.error('Error fetching places:', err)
  } finally {
    isLoading.value = false
  }
}

const handleAddPlace = () => {
  router.push({ name: 'create-place' })
}

const handleViewDetails = (placeId: string) => {
  router.push({ name: 'details', params: { id: placeId } })
}

const handleEdit = (placeId: string) => {
  router.push({ name: 'edit-place', params: { id: placeId } })
}

const handleDelete = async (placeId: string) => {
  if (!confirm('Are you sure you want to delete this place? This action cannot be undone.')) {
    return
  }
  
  try {
    await PlacesService.deletePlace(placeId)
    await fetchPlaces() // Refresh the list
  } catch (err: any) {
    error.value = err?.message || 'Failed to delete place'
    console.error('Error deleting place:', err)
  }
}

onMounted(() => {
  fetchPlaces()
})
</script>

<template>
  <div class="container max-w-7xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Manage Places</h1>
        <p class="text-muted-foreground mt-1">View and manage all your business locations</p>
      </div>
      <Button size="lg" @click="handleAddPlace" class="gap-2">
        <Plus class="size-4" />
        Add New Place
      </Button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-4 rounded-lg bg-destructive/10 text-destructive">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <Loader2 class="size-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Total Places</p>
                <p class="text-3xl font-bold text-orange-600">{{ stats.totalPlaces }}</p>
              </div>
              <div class="size-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <MapPin class="size-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Total Reviews</p>
                <p class="text-3xl font-bold text-blue-600">{{ stats.totalReviews }}</p>
              </div>
              <div class="size-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Star class="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          type="text"
          placeholder="Search places by name, location, or category..."
          class="pl-10"
        />
      </div>

      <!-- Places List -->
      <div class="space-y-4">
        <Card
          v-for="place in filteredPlaces"
          :key="place.id"
          class="hover:shadow-md transition-shadow"
        >
          <CardContent class="p-6">
            <div class="flex gap-6">
              <!-- Image -->
              <img
                :src="place.main_image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'"
                :alt="place.name"
                class="size-40 rounded-xl object-cover"
              />

              <!-- Content -->
              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h3 class="text-xl font-semibold mb-1">{{ place.name }}</h3>
                      <div class="flex items-center gap-4 text-sm text-muted-foreground">
                        <span class="flex items-center gap-1">
                          <MapPin class="size-3" />
                          {{ getLocationDisplay(place) }}
                        </span>
                        <span>{{ getCategoryDisplay(place.place_type) }}</span>
                        <span class="flex items-center gap-1">
                          <Star class="size-3 fill-yellow-400 text-yellow-400" />
                          {{ place.average_rating?.toFixed(1) || 'N/A' }} ({{ place.review_count || 0 }} reviews)
                        </span>
                      </div>
                    </div>
                    <Badge variant="default" class="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      <span class="size-2 rounded-full bg-green-500 mr-1.5"></span>
                      Active
                    </Badge>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Created on {{ formatDate(place.created_at) }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    @click="handleViewDetails(place.id)"
                    class="gap-1.5"
                  >
                    <Eye class="size-4" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="handleEdit(place.id)"
                    class="gap-1.5"
                  >
                    <Pencil class="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="handleDelete(place.id)"
                    class="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 class="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Empty State -->
        <div
          v-if="filteredPlaces.length === 0"
          class="text-center py-16"
        >
          <div class="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <MapPin class="size-8 text-muted-foreground" />
          </div>
          <h3 class="text-lg font-semibold mb-2">No places found</h3>
          <p class="text-muted-foreground mb-4">
            {{ searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first place' }}
          </p>
          <Button v-if="!searchQuery" @click="handleAddPlace">
            <Plus class="size-4 mr-2" />
            Add New Place
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
</style>
