// Temporarily done for refactoring API call
import { authInstance, commonInstance } from "@/config";
import type {
  IReviewSchema,
  IReviewCreate,
  IReviewUpdate,
  IApiResponse,
  IPaginatedResponse,
  IMessage,
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
  async createReview(input: IReviewCreate): Promise<IReviewSchema> {
    try {
      const response = await authInstance.post("/reviews", input);
      return (response.data as IApiResponse<IReviewSchema>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }
  async getReviews(
    placeId: string,
  ): Promise<IPaginatedResponse<IReviewSchema>> {
    try {
      const response = await commonInstance.get(`/places/${placeId}/reviews`);
      return response.data as IPaginatedResponse<IReviewSchema>;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async updateReview(id: string, input: IReviewUpdate): Promise<IReviewSchema> {
    try {
      const response = await authInstance.put(`/reviews/${id}`, input);
      return (response.data as IApiResponse<IReviewSchema>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async deleteReview(id: string): Promise<IMessage> {
    try {
      const response = await authInstance.delete(`/reviews/${id}`);
      return (response.data as IApiResponse<IMessage>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }
}

export default ReviewsService.getInstance();
