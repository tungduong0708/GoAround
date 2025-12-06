import { authInstance, commonInstance } from "@/config";
import type {
  IBanUserInput,
  IBanUserResponse,
  ICurrentUserResponse,
  IPublicProfileResponse,
  IUpdateProfileInput,
} from "@/utils/interfaces";

class UserService {
  private static instance: UserService;
  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getCurrentUser(): Promise<ICurrentUserResponse> {
    try {
      const response = await authInstance.get("/users/me");
      return response.data as ICurrentUserResponse;
    } catch (error: any) {
      throw error.response.data;
    }
  }

  async updateProfile(
    input: IUpdateProfileInput
  ): Promise<ICurrentUserResponse> {
    try {
      const response = await authInstance.put("/users/me", input);
      return response.data as ICurrentUserResponse;
    } catch (error: any) {
      throw error.response.data;
    }
  }

  async publicProfile(userId: string): Promise<IPublicProfileResponse> {
    try {
      const response = await commonInstance.get(`/users/${userId}`);
      return response.data as IPublicProfileResponse;
    } catch (error: any) {
      throw error.response.data;
    }
  }

  async banUser(
    userId: string,
    input: IBanUserInput
  ): Promise<IBanUserResponse> {
    try {
      const response = await authInstance.post(`/users/${userId}/ban`, input);
      return response.data as IBanUserResponse;
    } catch (error: any) {
      throw error.response.data;
    }
  }
}

export default UserService.getInstance();
