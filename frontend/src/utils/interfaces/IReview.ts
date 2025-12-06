export interface IReviewUser {
    id: string;
    username: string;
    avatarUrl: string;
}

export interface IReviewImage {
    id: string;
    imageUrl: string;
}

export interface IReview {
    id: string;
    placeId: string;
    user: IReviewUser;
    rating: number;
    reviewText: string;
    createdAt: string;
    images: IReviewImage[];
}
