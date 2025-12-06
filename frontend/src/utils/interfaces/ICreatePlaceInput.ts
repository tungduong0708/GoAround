import type { PlaceType } from "./IPlace";

export interface ICreatePlaceInput {
  name: string;
  placeType: PlaceType;
  address?: string;
  city?: string;
  country?: string;
  location?: { lat: number; lng: number };
  mainImageUrl?: string;

  // Hotel specific
  starRating?: number;
  pricePerNight?: number;
  amenities?: string[];

  // Restaurant specific
  cuisineType?: string;
  openingHours?: Record<string, string>;
  priceRange?: string;

  // Landmark specific
  description?: string;
  ticketPrice?: number;
}
