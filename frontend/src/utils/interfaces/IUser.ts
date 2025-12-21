import type { IPlaceMinimal } from "./IPlace";
import type { IReviewImageSchema } from "./IReview";

export interface IUserDetail {
  username: string;
  full_name: string;
  avatar_url: string | null;
  id: string;

  role: "admin" | "traveler" | "business";

  is_verified_business: boolean;
  stats: IUserStats;

  created_at: string;
  email?: string | null;
}

export interface IUserStats {
  reviews_count: number;
  posts_count: number;
  photos_count: number;
  public_trips_count: number;
  replies_count: number;
}

export interface IUserUpdate {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface IUserPublic {
  username: string;
  full_name: string;
  avatar_url: string | null;
  id: string;

  role: "admin" | "traveler" | "business";
  is_verified_business: boolean;
  stats: IUserStats;
  created_at: string;
}

export interface IUserCreate {
  username: string;
  full_name: string;
  avatar_url: string | null;

  signup_type: "traveler" | "business";
  business_image_url?: string | null;
  business_description?: string | null;
}

export interface IUserReviewResponse {
  id: string;
  place: IPlaceMinimal;
  rating: number;
  review_text?: string | null;
  created_at: string;
  images?: IReviewImageSchema[];
}

export interface IUserPostResponse {
  id: string;
  title: string;
  content_snippet: string;
  reply_count?: number;
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
  source_type: "review" | "post";
  source_id: string;
}

export interface IUserReplyResponse {
  id: string;
  post_id: string;
  post_title: string;
  content: string;
  created_at: string;
}

// -------------------------------------------- Deprecated --------------------------------------------
// This interface is replaced by IUserPublic/IUserDetail
export interface IUserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string;
}
