import { authInstance, commonInstance } from "@/config";
import type {
  IReview,
  ICreateReviewInput,
  IUpdateReviewInput,
  IReviewSearchQuery,
  IApiResponse,
  IPaginatedResponse,
} from "@/utils/interfaces";

class ReviewsService {
  private static instance: ReviewsService;
  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ReviewsService {
    if (!ReviewsService.instance) {
      ReviewsService.instance = new ReviewsService();
    }
    return ReviewsService.instance;
  }

  async getReviews(
    placeId: string,
    query?: IReviewSearchQuery
  ): Promise<IPaginatedResponse<IReview[]>> {
    const response = await commonInstance.get(`/places/${placeId}/reviews`, {
      params: query,
    });
    return response.data as IPaginatedResponse<IReview[]>;
  }

  async createReview(input: ICreateReviewInput): Promise<IReview> {
    const response = await authInstance.post("/reviews", input);
    return (response.data as IApiResponse<IReview>).data;
  }

  async updateReview(id: string, input: IUpdateReviewInput): Promise<IReview> {
    const response = await authInstance.put(`/reviews/${id}`, input);
    return (response.data as IApiResponse<IReview>).data;
  }

  async deleteReview(id: string): Promise<{ message: string }> {
    const response = await authInstance.delete(`/reviews/${id}`);
    return (response.data as IApiResponse<{ message: string }>).data;
  }
}

export default ReviewsService.getInstance();
