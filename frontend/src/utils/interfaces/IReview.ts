export interface IReviewUserSchema {
  id: string;
  username: string;
  avatar_url: string;
}

export interface IReviewImageSchema {
  id: string;
  image_url: string;
  created_at: string;
}

export interface IReviewSchema {
  id: string;
  place_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  images: IReviewImageSchema[];
  user: IReviewUserSchema;
}
export interface IReviewCreate {
  place_id: string;
  rating: number;
  review_text?: string;
  images?: string[];
}
export interface IReviewUpdate {
  rating: number;
  review_text: string;
  images: string[];
}

//-------------------------------------------- Deprecated --------------------------------------------
export interface IReviewSearchQuery {
  sort?: string;
  page?: number;
  limit?: number;
}
