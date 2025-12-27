import type { IForumPostListItem } from "./IForum";
import type { ILocation, IOwnerSchema } from "./IHelper";
import type { ITripListSchema } from "./ITrip";

export interface IPlacePublic {
  id: string;
  name: string;

  place_type: "hotel" | "restaurant" | "landmark" | "cafe";

  address?: string | null;
  city?: string | null;
  country?: string | null;

  location?: ILocation | null;

  main_image_url?: string | null;

  average_rating: number;
  review_count: number;

  opening_hours?: Record<string, unknown> | null;
  price_range?: string | null;
  tags?: string[];

  created_at: string;
}

export interface IPlaceSearchResponse {
  places: IPlacePublic[];
  posts: IForumPostListItem[];
  trips: ITripListSchema[];

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
  address?: string | null;
  city?: string | null;
  country?: string | null;
  location?: ILocation | null;

  description?: string | null;
  opening_hours?: Record<string, unknown> | null;
  place_type: "hotel" | "restaurant" | "landmark" | "cafe";
  main_image_url?: string | null;
  images?: string[];
  tags?: string[];

  // Optional fields
  hotel_class?: number | null;
  price_per_night?: number | null;
  amenities?: string[] | null;

  cuisine_type?: string | null;
  price_range?: string | null;

  ticket_price?: number | null;
  coffee_specialties?: string | null;

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
  place_type: "hotel" | "restaurant" | "landmark" | "cafe";

  address?: string | null;
  city?: string | null;
  country?: string | null;

  location?: ILocation | null;

  main_image_url?: string | null;
  average_rating?: number;
  review_count?: number;

  opening_hours?: Record<string, unknown> | null;
  price_range?: string | null;
  tags?: string[];

  // verification_status: string;
  created_at: string;

  description?: string | null;

  hotel_class?: number | null;
  price_per_night?: number | null;

  cuisine_type?: string | null;
  ticket_price?: number | null;

  coffee_specialties?: string | null;
  amenities?: string[] | null;

  images?: IPlaceImageSchema[] | null;
  owner?: IOwnerSchema | null;

  my_review?: Record<string, unknown> | null;
}

export interface IPlaceUpdate {
  name?: string | null;
  address?: string | null;

  location?: ILocation | null;

  description?: string | null;
  opening_hours?: Record<string, unknown> | null;
  city?: string | null;
  country?: string | null;

  main_image_url?: string | null;
  // Why images are string?
  images?: string[] | null;
  tags?: string[] | null;

  hotel_class?: number | null;
  price_per_night?: number | null;
  amenities?: string[] | null;

  cuisine_type?: string | null;
  price_range?: string | null;

  ticket_price?: number | null;
  coffee_specialties?: string | null;

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
  main_image_url?: string | null;
}

export interface IPlaceImageSchema {
  id: string;
  image_url: string;
  caption?: string;
}
