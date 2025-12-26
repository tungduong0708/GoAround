import type { ILocation } from "./IHelper";

export interface IPlaceSearchQuery {
  q?: string | null;
  location?: ILocation | null;

  radius?: number;
  tags?: string | null;

  amenities?: string | null;
  price_range?: string | null;
  rating?: number | null;
  sort_by?: "rating" | "distance" | "newest";
  page?: number;
  limit?: number;
  
  place_type?: "hotel" | "restaurant" | "landmark" | "cafe" | null;
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
