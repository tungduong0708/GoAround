// Temporarily done
import { authInstance, commonInstance } from "@/config";
import type {
  // IBanUserInput,
  // IBanUserResponse,
  IUserDetail,
  IUserUpdate,
  IApiResponse,
  IPaginatedResponse,
  IUserPublic,
  IUserCreate,
  IUserReviewResponse,
  IUserPostResponse,
  IUserTripResponse,
  IUserPhotoResponse,
  IPagingQuery,
} from "@/utils/interfaces";

class UserService {
  private static instance: UserService;
  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getCurrentUser(): Promise<IUserDetail> {
    try {
      const response = await authInstance.get("/users/me");
      return (response.data as IApiResponse<IUserDetail>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async updateProfile(input: IUserUpdate): Promise<IUserDetail> {
    const response = await authInstance.put("/users/me", input);
    return (response.data as IApiResponse<IUserDetail>).data;
  }

  async createUser(input: IUserCreate): Promise<IUserDetail> {
    try {
      const response = await commonInstance.post("/users", input);
      return (response.data as IApiResponse<IUserDetail>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        console.error("Conflict: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async publicProfile(userId: string): Promise<IUserPublic> {
    try {
      const response = await commonInstance.get(`/users/${userId}`);
      return (response.data as IApiResponse<IUserPublic>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async getUserReviews(
    userId: string,
    query: IPagingQuery
  ): Promise<IPaginatedResponse<IUserReviewResponse[]>> {
    const response = await commonInstance.get(`/users/${userId}/reviews`, { params: query });
    return response.data as IPaginatedResponse<IUserReviewResponse[]>;
  }
  async getUserPosts(
    userId: string,
    query: IPagingQuery
  ): Promise<IPaginatedResponse<IUserPostResponse[]>> {
    const response = await commonInstance.get(`/users/${userId}/posts`, { params: query });
    return response.data as IPaginatedResponse<IUserPostResponse[]>;
  }

  async getUserTrips(
    userId: string,
    query: IPagingQuery
  ): Promise<IPaginatedResponse<IUserTripResponse[]>> {
    const response = await commonInstance.get(`/users/${userId}/trips`, { params: query });
    return response.data as IPaginatedResponse<IUserTripResponse[]>;
  }
  async getUserPhotos(
    userId: string,
    query: IPagingQuery
  ): Promise<IPaginatedResponse<IUserPhotoResponse[]>> {
    const response = await commonInstance.get(`/users/${userId}/photos`, { params: query });
    return response.data as IPaginatedResponse<IUserPhotoResponse[]>;
  }
  // Temporarily commented out based on the new interface changes
  // async banUser(
  //   userId: string,
  //   input: IBanUserInput
  // ): Promise<IBanUserResponse> {
  //   const response = await authInstance.post(`/users/${userId}/ban`, input);
  //   return (response.data as IApiResponse<IBanUserResponse>).data;
  // }
}

export default UserService.getInstance();
