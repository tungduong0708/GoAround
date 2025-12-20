import type { ILocation } from "./IHelper";

export interface IPlacePublic {
  id: string;
  name: string;
  // TODO: Use enum later
  place_type: string;

  address: string;
  city: string;
  country: string;

  location: ILocation;

  main_image_url: string;

  average_rating: number;
  review_count: number;

  opening_hours: string;
  tags: string[];

  // TODO: Use enum later
  verification_status: string;

  // TODO: Use datetime type later
  created_at: string;

  // Temporary commented out fields
  // owner_id?: string | null;

  // // Detail fields
  // images?: IImage[];

  // // Hotel specific
  // star_rating?: number;
  // price_per_night?: number;
  // amenities?: string[];

  // // Restaurant specific
  // cuisine_type?: string;
  // // opening_hours?: Record<string, string>; // e.g. { "mon": "9-22" }
  // price_range?: string | null;

  // // Landmark specific
  // description?: string;
  // ticket_price?: number;
}
// TODO: This is not payloaded interface, need to do later

export interface IPlaceCreate {
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  opening_hours: string;
  place_type: string;
  main_image_url: string;
  images: string[];
  tags: string[];

  // Optional fields
  hotel_class: string;
  price_per_night: string;
  amenities: string;

  cuisine_type: string;
  price_range: string;

  ticket_price: string;
  coffee_specialities: string;

  location: ILocation;

  // Temporary commented out older fields
  // place_type: PlaceType;
  // main_image_url?: string;

  // // Hotel specific
  // star_rating?: number;
  // price_per_night?: number;
  // amenities?: string[];

  // // Restaurant specific
  // cuisine_type?: string;
  // opening_hours?: Record<string, string>;
  // price_range?: string;

  // // Landmark specific
  // description?: string;
  // ticket_price?: number;
}

export interface IPlaceDetail {
  id: string;
  name: string;
  // TODO: Use enum later
  place_type: string;

  address: string;
  city: string;
  country: string;

  location: ILocation;

  main_image_url: string;

  opening_hours: string;
  price_range: string;
  tags: string[];

  verification_status: string;
  created_at: string;

  description: string;

  hotel_class: string;
  price_per_night: string;

  cuisine_type: string;
  ticket_price: string;

  coffee_specialities: string;
  amenities: string;

  images: string[];
  owner: string;

  my_review: string;
}
export interface IPlaceUpdate {
  name: string;
  address: string;

  location: ILocation;

  description: string;
  opening_hours: string;
  city: string;
  country: string;

  main_image_url: string;
  images: string[];
  tags: string[];

  hotel_class: string;
  price_per_night: string;
  amenities: string;

  cuisine_type: string;
  price_range: string;

  ticket_price: string;
  coffee_specialities: string;

  // Commented out fields to be check later
  // name: string;
  // place_type: PlaceType;
  // address?: string;
  // city?: string;
  // country?: string;
  // location?: { lat: number; lng: number };
  // main_image_url?: string;

  // // Hotel specific
  // star_rating?: number;
  // price_per_night?: number;
  // amenities?: string[];

  // // Restaurant specific
  // cuisine_type?: string;
  // opening_hours?: Record<string, string>;
  // price_range?: string;

  // // Landmark specific
  // description?: string;
  // ticket_price?: number;
}
export interface ITransferOwnershipRequest {
  new_owner_email: string;
}
export interface IPlaceMinimal {
  id: string;
  name: string;
  main_image_url: string;
}

// ------------------------ Decaprated Interfaces -----------------------

export interface IImage {
  id: string;
  image_url: string;
  caption?: string;
}
