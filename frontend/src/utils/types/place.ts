export interface Review {
  id: string
  author: string
  avatar?: string
  rating: number
  date: string
  content: string
}

export interface PlaceDetails {
  id: string
  name: string
  location: string
  description: string
  rating: number
  reviewCount: number
  images: string[]
  highlights: string[]
  price: string
  openHours: string
  recommendedDuration: string
  coordinates: {
    lat: number
    lng: number
  }
  reviews: Review[]
}
