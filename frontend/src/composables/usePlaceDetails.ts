import { onMounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlaceStore } from '@/stores'
import { useRoute } from 'vue-router'

export function usePlaceDetails() {
  const route = useRoute()
  const store = usePlaceStore()
  const { place, loading, error } = storeToRefs(store)

  const fetchPlace = (id: string) => {
    if (id) {
      store.loadPlace(id)
    }
  }

  onMounted(() => {
    const placeId = route.params.id as string
    fetchPlace(placeId)
  })

  watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        fetchPlace(newId as string)
      }
    }
  )

  const heroImage = computed(() => {
    if (!place.value) return ''
    return place.value.mainImageUrl || place.value.images?.[0]?.imageUrl || ''
  })

  const galleryImages = computed(() => {
    if (!place.value?.images) return [] as string[]
    return place.value.images.map((img) => img.imageUrl).filter(Boolean)
  })

  const locationLabel = computed(() => {
    if (!place.value) return ''
    const parts = [place.value.address, place.value.city, place.value.country].filter(Boolean)
    return parts.join(', ')
  })

  const coordinates = computed(() => {
    const coords = place.value?.location?.coordinates
    if (coords && coords.length === 2) {
      const [lng, lat] = coords
      return { lat, lng }
    }
    return null
  })

  const tags = computed(() => place.value?.tags?.map((tag) => tag.name) ?? [])

  const priceLabel = computed(() => {
    const p = place.value
    if (!p) return 'N/A'
    if (p.pricePerNight !== undefined) return `$${p.pricePerNight.toLocaleString()}/night`
    if (p.ticketPrice !== undefined) return `$${p.ticketPrice.toLocaleString()}`
    if (p.priceRange) return p.priceRange
    return 'N/A'
  })

  const openHoursLabel = computed(() => {
    const hours = place.value?.openingHours
    if (!hours) return 'N/A'
    const entries = Object.entries(hours)
    if (!entries.length) return 'N/A'
    return entries.map(([day, val]) => `${day}: ${val}`).join(' • ')
  })

  return {
    place,
    loading,
    error,
    fetchPlace,
    heroImage,
    galleryImages,
    locationLabel,
    coordinates,
    tags,
    priceLabel,
    openHoursLabel,
  }
}
