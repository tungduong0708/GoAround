import type { ILocation } from "./IHelper";
export interface IPlaceSearchQuery {
  q: string;
  category: string;
  location: ILocation;

  radius: number;
  tags: string;

  amenities: string;
  price_range: string;
  rating: number;
  sort_by: string;
  page: number;
  limit: number;

  // TODO: Use enum later
  place_type: string;
}

export interface ITripSearchQuery {
    page: number;
    limit: number;
}