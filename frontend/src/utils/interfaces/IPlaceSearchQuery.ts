export interface IPlaceSearchQuery {
  q?: string;
  category?: string;
  amenities?: string;
  price_range?: string;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}
