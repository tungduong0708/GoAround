export interface SearchResult {
  id: string
  name: string
  description: string
  location: string
  category: string
  image: string
  rating: number
  tags: string[]
}

export interface SearchFilters {
  category?: string
  location?: string
  tags?: string[]
}
