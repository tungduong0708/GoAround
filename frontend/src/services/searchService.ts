import type { SearchFilters, SearchResult } from '@/utils/types'

const mockPlaces: SearchResult[] = [
  {
    id: '1',
    name: 'Misty Mountain Retreat',
    description: 'Cozy cabins tucked away in the pine forests with panoramic valley views.',
    location: 'Da Lat, Vietnam',
    category: 'retreat',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
    tags: ['mountain', 'nature', 'relax']
  },
  {
    id: '2',
    name: 'Sunset Coastline Walk',
    description: 'Experience golden hour along a dramatic shoreline filled with hidden coves.',
    location: 'Vũng Tàu, Vietnam',
    category: 'experience',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
    tags: ['beach', 'sunset', 'walks']
  },
  {
    id: '3',
    name: 'Old Quarter Coffee Crawl',
    description: 'Discover heritage coffee houses and modern brews in the heart of the city.',
    location: 'Hanoi, Vietnam',
    category: 'tour',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
    tags: ['coffee', 'culture', 'city']
  }
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function searchPlaces(query: string, filters: SearchFilters = {}): Promise<SearchResult[]> {
  // Simulate backend round-trip
  // TODO: Replace with real API call
  await wait(350)

  const normalizedQuery = query.trim().toLowerCase()

  return mockPlaces.filter((place) => {
    const matchesQuery = !normalizedQuery ||
      place.name.toLowerCase().includes(normalizedQuery) ||
      place.description.toLowerCase().includes(normalizedQuery) ||
      place.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))

    const matchesCategory = !filters.category || place.category === filters.category
    const matchesLocation = !filters.location || place.location.toLowerCase().includes(filters.location.toLowerCase())
    const matchesTags = !filters.tags || filters.tags.every((tag) => place.tags.includes(tag))

    return matchesQuery && matchesCategory && matchesLocation && matchesTags
  })
}
