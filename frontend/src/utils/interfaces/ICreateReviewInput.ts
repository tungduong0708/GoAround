export interface ICreateReviewInput {
  place_id: string;
  rating: number;
  review_text?: string;
  images?: string[];
}
