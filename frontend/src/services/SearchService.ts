import type { IPlace, IPlaceSearchQuery, PlaceType } from "@/utils/interfaces"

const mockPlaces: IPlace[] = [
  {
    id: "1",
    name: "Misty Mountain Retreat",
    placeType: "hotel",
    address: "12 Pine Ridge",
    city: "Da Lat",
    country: "Vietnam",
    location: {
      type: "Point",
      coordinates: [108.458, 11.94],
    },
    mainImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.8,
    reviewCount: 124,
    description: "Cozy cabins tucked away in the pine forests with panoramic valley views.",
    pricePerNight: 120,
    amenities: ["spa", "breakfast", "wifi"],
    tags: [
      { id: "tag-mountain", name: "Mountain" },
      { id: "tag-nature", name: "Nature" },
      { id: "tag-relax", name: "Relax" },
    ],
  },
  {
    id: "2",
    name: "Sunset Coastline Walk",
    placeType: "landmark",
    address: "Bai Truoc Promenade",
    city: "Vung Tau",
    country: "Vietnam",
    location: {
      type: "Point",
      coordinates: [107.084, 10.346],
    },
    mainImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.6,
    reviewCount: 203,
    description: "Experience golden hour along a dramatic shoreline filled with hidden coves.",
    tags: [
      { id: "tag-beach", name: "Beach" },
      { id: "tag-sunset", name: "Sunset" },
      { id: "tag-walk", name: "Walk" },
    ],
    priceRange: "$$",
  },
  {
    id: "3",
    name: "Old Quarter Coffee Crawl",
    placeType: "restaurant",
    address: "36 Hang Gai",
    city: "Hanoi",
    country: "Vietnam",
    location: {
      type: "Point",
      coordinates: [105.848, 21.033],
    },
    mainImageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.7,
    reviewCount: 89,
    description: "Discover heritage coffee houses and modern brews in the heart of the city.",
    priceRange: "$$",
    cuisineType: "Cafe",
    openingHours: {
      mon: "7-22",
      tue: "7-22",
      wed: "7-22",
      thu: "7-22",
      fri: "7-23",
      sat: "7-23",
      sun: "7-22",
    },
    tags: [
      { id: "tag-coffee", name: "Coffee" },
      { id: "tag-culture", name: "Culture" },
      { id: "tag-city", name: "City" },
    ],
  },
  {
    id: "4",
    name: "Riverfront Night Market",
    placeType: "restaurant",
    address: "Hoa Binh Street",
    city: "Da Nang",
    country: "Vietnam",
    location: {
      type: "Point",
      coordinates: [108.202, 16.067],
    },
    mainImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    averageRating: 4.5,
    reviewCount: 310,
    description: "Street food, lanterns, and river breezes make this a lively evening stop.",
    priceRange: "$",
    tags: [
      { id: "tag-streetfood", name: "Street Food" },
      { id: "tag-nightlife", name: "Nightlife" },
      { id: "tag-market", name: "Market" },
    ],
  },
]


class SearchService {
  private static instance: SearchService
  private constructor() {
    // Private constructor to prevent instantiation
  }
  
  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }


  async searchPlaces(query: IPlaceSearchQuery): Promise<IPlace[]> {
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    await wait(350)

    const normalizedQuery = (query.q ?? "").trim().toLowerCase()
    const normalizedCategory = this.normalizeCategory(query.category)
    const requestedAmenities = (query.amenities ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)

    let results = mockPlaces.filter((place) => {
      const matchesQuery =
        !normalizedQuery ||
        place.name.toLowerCase().includes(normalizedQuery) ||
        (place.description?.toLowerCase().includes(normalizedQuery) ?? false) ||
        (place.tags?.some((tag) => tag.name.toLowerCase().includes(normalizedQuery)) ?? false) ||
        place.city.toLowerCase().includes(normalizedQuery) ||
        place.country.toLowerCase().includes(normalizedQuery)

      const matchesCategory = !normalizedCategory || place.placeType === normalizedCategory

      const matchesAmenities =
        requestedAmenities.length === 0 ||
        requestedAmenities.every((amenity) =>
          (place.amenities ?? []).some((value) => value.toLowerCase() === amenity),
        )

      const matchesRating = query.rating ? place.averageRating >= query.rating : true

      return matchesQuery && matchesCategory && matchesAmenities && matchesRating
    })

    if (query.sort === "rating_desc") {
      results = [...results].sort((a, b) => b.averageRating - a.averageRating)
    } else if (query.sort === "rating_asc") {
      results = [...results].sort((a, b) => a.averageRating - b.averageRating)
    }

    if (!query.limit) {
      return results
    }

    const page = query.page && query.page > 0 ? query.page : 1
    const start = (page - 1) * query.limit
    return results.slice(start, start + query.limit)
  }

  private normalizeCategory(category?: string): PlaceType | null {
    if (!category) {
      return null
    }

    const normalized = category.toLowerCase()
    const map: Record<string, PlaceType> = {
      hotel: "hotel",
      hotels: "hotel",
      restaurant: "restaurant",
      restaurants: "restaurant",
      cafe: "restaurant",
      cafes: "restaurant",
      landmark: "landmark",
      landmarks: "landmark",
    }

    return map[normalized] ?? null
  }
}

export default SearchService.getInstance()
