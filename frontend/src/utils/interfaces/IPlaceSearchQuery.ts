export interface IPlaceSearchQuery {
  q?: string;
  category?: string;
  amenities?: string;
  priceRange?: string;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}
