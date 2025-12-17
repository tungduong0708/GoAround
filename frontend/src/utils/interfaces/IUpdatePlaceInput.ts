import type { PlaceType } from "./IPlace";

export interface IUpdatePlaceInput {
  name?: string;
  place_type?: PlaceType;
  address?: string;
  city?: string;
  country?: string;
  location?: { lat: number; lng: number };
  main_image_url?: string;

  // Hotel specific
  star_rating?: number;
  price_per_night?: number;
  amenities?: string[];

  // Restaurant specific
  cuisine_type?: string;
  opening_hours?: Record<string, string>;
  price_range?: string;

  // Landmark specific
  description?: string;
  ticket_price?: number;
}
