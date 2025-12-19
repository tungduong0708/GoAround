import type { IPlaceMinimal } from "./IPlace";
export interface IUserDetail {
    username: string; 
    full_name: string;
    avatar_url: string;
    id: string; 

    //TODO: Use enum later
    role: string;

    is_verified_business: boolean;
    stats: IUserStats; 

    joined_at: string;
    email: string;
}

export interface IUserStats {
    reviews_count: number;
    posts_count: number;
    photos_count: number;
    public_trips_count: number;
}

export interface IUserUpdate {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface IUserPublic {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;

  // TODO: Use enum later
  role: string;
  is_verified_business: boolean;
}

export interface IUserCreate {
  username: string;
  full_name: string;
  avatar_url: string;

  // TODO: Use enum later
  signup_type: string;
}

export interface IUserReviewResponse {
    id: string; 
    place: IPlaceMinimal; 
    rating: number; 
    review_text: string;
    created_at: string;
    images: string[];
}

export interface IUserPostResponse {
    id: string; 
    title: string; 
    content_snippet: string; 
    reply_count: number;
    created_at: string; 
}

export interface IUserTripResponse {
    id: string; 
    trip_name: string; 
    start_date: string; 
    end_date: string; 
    stop_count: number;
}

export interface IUserPhotoResponse {
    id: string; 
    image_url: string; 
    // TODO: Use enum later
    source_type: string; 
    source_id: string; 
}