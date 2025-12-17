export interface IReviewUser {
  id: string;
  username: string;
  avatar_url: string;
}

export interface IReviewImage {
  id: string;
  image_url: string;
}

export interface IReview {
  id: string;
  place_id: string;
  user: IReviewUser;
  rating: number;
  review_text: string;
  created_at: string;
  images: IReviewImage[];
}
