export interface ILocation {
  type: "Point";
  coordinates: [number, number];
}

export interface IImage {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface ITag {
  id: string;
  name: string;
}

export type PlaceType = "hotel" | "restaurant" | "landmark";

export interface IPlace {
  id: string;
  ownerId?: string | null;
  name: string;
  placeType: PlaceType;
  address: string;
  city: string;
  country: string;
  location: ILocation;
  mainImageUrl: string;
  averageRating: number;
  reviewCount: number;

  // Detail fields
  images?: IImage[];
  tags?: ITag[];

  // Hotel specific
  starRating?: number;
  pricePerNight?: number;
  amenities?: string[];

  // Restaurant specific
  cuisineType?: string;
  openingHours?: Record<string, string>; // e.g. { "mon": "9-22" }
  priceRange?: string | null;

  // Landmark specific
  description?: string;
  ticketPrice?: number;
}
