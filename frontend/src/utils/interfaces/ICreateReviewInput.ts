export interface ICreateReviewInput {
    placeId: string;
    rating: number;
    reviewText?: string;
    images?: string[];
}
