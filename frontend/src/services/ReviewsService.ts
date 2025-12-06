import { authInstance, commonInstance } from "@/config";
import type {
    IReview,
    ICreateReviewInput,
    IUpdateReviewInput,
    IReviewSearchQuery
} from "@/utils/interfaces";

class ReviewsService {
    private static instance: ReviewsService;
    private constructor() { }

    public static getInstance(): ReviewsService {
        if (!ReviewsService.instance) {
            ReviewsService.instance = new ReviewsService();
        }
        return ReviewsService.instance;
    }

    async getReviews(placeId: string, query?: IReviewSearchQuery): Promise<IReview[]> {
        try {
            const response = await commonInstance.get(`/places/${placeId}/reviews`, { params: query });
            return response.data as IReview[];
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async createReview(input: ICreateReviewInput): Promise<IReview> {
        try {
            const response = await authInstance.post('/reviews', input);
            return response.data as IReview;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async updateReview(id: string, input: IUpdateReviewInput): Promise<IReview> {
        try {
            const response = await authInstance.put(`/reviews/${id}`, input);
            return response.data as IReview;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async deleteReview(id: string): Promise<{ message: string }> {
        try {
            const response = await authInstance.delete(`/reviews/${id}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
}

export default ReviewsService.getInstance();
