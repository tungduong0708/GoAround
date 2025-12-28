import type { ILocation } from "./IHelper";

export interface IPlaceSearchQuery {
  // Common filters
  // For main query
  q?: string | null;
  rating?: number | null;

  // For geographical filtering
  location?: ILocation | null;
  radius?: number;

  place_type?: "hotel" | "restaurant" | "landmark" | "cafe" | null;

  tags?: string | null;
  sort_by?: "rating" | "distance" | "newest";

  page?: number;
  limit?: number;

  // Specific filters
  // Only for hotels
  hotel_class?: number | null;
  price_per_night_min?: number | null;
  price_per_night_max?: number | null;

  // Only for hotels and cafes
  amenities?: string | null;

  // Only for restaurants and cafes.
  price_range?: string | null;




}


export interface IReportQuery {
  page?: number;
  limit?: number;
  status_filter?: string | null;
}

export interface IPagingQuery {
  page?: number;
  limit?: number;
  public_only?: boolean;
}

export interface IForumSearchQuery {
  q?: string | null;
  tags?: string[] | null;
  sort?: "newest" | "oldest" | "popular";
  page?: number;
  limit?: number;
} 
export interface IReportSearchQuery {
  status?: string;
}
