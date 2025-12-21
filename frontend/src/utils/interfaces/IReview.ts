export interface IReviewerSchema {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
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
  review_text?: string | null;
  created_at: string;
  images?: IReviewImageSchema[] | null;
  user?: IReviewerSchema | null;
}
export interface IReviewCreate {
  place_id: string;
  rating: number;
  review_text?: string | null;
  images?: string[];
}
export interface IReviewUpdate {
  rating?: number | null;
  review_text?: string | null;
  images?: string[] | null;
}

//-------------------------------------------- Deprecated --------------------------------------------
export interface IReviewSearchQuery {
  sort?: string;
  page?: number;
  limit?: number;
}
