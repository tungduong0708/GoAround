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
  IUserPhotoResponse,
  IPagingQuery,
  ITripListSchema,
  IUserReplyResponse,
  IMessage
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

  async getCurrentUser(signal?: AbortSignal): Promise<IUserDetail> {
    try {
      const response = await authInstance.get("/users/me", { signal });
      return (response.data as IApiResponse<IUserDetail>).data;
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
         throw error;
      }
      if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
      }
      throw error; 
    }
  }

  async updateProfile(input: IUserUpdate): Promise<IUserDetail> {
    const response = await authInstance.put("/users/me", input);
    return (response.data as IApiResponse<IUserDetail>).data;
  }

  async createUser(input: IUserCreate): Promise<IUserDetail> {
    try {
      const response = await authInstance.post("/users", input);
      return (response.data as IApiResponse<IUserDetail>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        console.error("Conflict: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async publicProfile(
    userId: string,
    signal?: AbortSignal
  ): Promise<IUserPublic> {
    try {
      const response = await commonInstance.get(`/users/${userId}`, { signal });
      return (response.data as IApiResponse<IUserPublic>).data;
    } catch (error: any) {
      if (error.code === "ERR_CANCELED") {
        throw error;
      }
      if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
      }
      throw error;
    }
  }

  async getUserReviews(
    userId: string,
    query: IPagingQuery
  ): Promise<IPaginatedResponse<IUserReviewResponse[]>> {
    const response = await commonInstance.get(`/users/${userId}/reviews`, {
      params: query,
    });
    return response.data as IPaginatedResponse<IUserReviewResponse[]>;
  }
  async getUserPosts(
    userId: string,
    query: IPagingQuery
  ): Promise<IPaginatedResponse<IUserPostResponse[]>> {
    const response = await commonInstance.get(`/users/${userId}/posts`, {
      params: query,
    });
    return response.data as IPaginatedResponse<IUserPostResponse[]>;
  }

  async getUserTrips(
    userId: string,
    query: IPagingQuery
  ): Promise<IPaginatedResponse<ITripListSchema[]>> {
    const response = await commonInstance.get(`/users/${userId}/trips`, {
      params: query,
    });
    return response.data as IPaginatedResponse<ITripListSchema[]>;
  }
  async getUserPhotos(
    userId: string,
    query: IPagingQuery
  ): Promise<IPaginatedResponse<IUserPhotoResponse[]>> {
    const response = await commonInstance.get(`/users/${userId}/photos`, {
      params: query,
    });
    return response.data as IPaginatedResponse<IUserPhotoResponse[]>;
  }

  async getUserReplies(
    userId: string,
    query: IPagingQuery
  ): Promise<IPaginatedResponse<IUserReplyResponse[]>> {
    const response = await commonInstance.get(`/users/${userId}/replies`, {
      params: query,
    });
    return response.data as IPaginatedResponse<IUserReplyResponse[]>;
  }
  // Temporarily commented out based on the new interface changes
  // async banUser(
  //   userId: string,
  //   input: IBanUserInput
  // ): Promise<IBanUserResponse> {
  //   const response = await authInstance.post(`/users/${userId}/ban`, input);
  //   return (response.data as IApiResponse<IBanUserResponse>).data;
  // }
  async verifyBusiness(input: {
    business_image_url: string;
    business_description: string;
  }): Promise<IMessage> {
    try {
      const response = await authInstance.post(`/users/me/verify-business`, input);
      return (response.data as IApiResponse<IMessage>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        console.error("Bad Request: ", error.response.data.detail);
      }
      throw error;
    }
  }
}

export default UserService.getInstance();
