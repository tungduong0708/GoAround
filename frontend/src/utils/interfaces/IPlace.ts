export interface ILocation {
  lat: number;
  lng: number;
}

export interface IImage {
  id: string;
  image_url: string;
  caption?: string;
}

export interface ITag {
  id: string;
  name: string;
}

export type PlaceType = "hotel" | "restaurant" | "landmark";

export interface IPlace {
  id: string;
  owner_id?: string | null;
  name: string;
  place_type: PlaceType;
  address: string;
  city: string;
  country: string;
  location: ILocation;
  main_image_url: string;
  average_rating: number;
  review_count: number;

  // Detail fields
  images?: IImage[];
  tags?: string[];

  // Hotel specific
  star_rating?: number;
  price_per_night?: number;
  amenities?: string[];

  // Restaurant specific
  cuisine_type?: string;
  opening_hours?: Record<string, string>; // e.g. { "mon": "9-22" }
  price_range?: string | null;

  // Landmark specific
  description?: string;
  ticket_price?: number;
}
