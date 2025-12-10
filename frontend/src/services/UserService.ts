import { authInstance, commonInstance } from "@/config";
import type {
  IBanUserInput,
  IBanUserResponse,
  ICurrentUserResponse,
  IPublicProfileResponse,
  IUpdateProfileInput,
  IApiResponse,
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

  async getCurrentUser(): Promise<ICurrentUserResponse> {
    const response = await authInstance.get("/users/me");
    return (response.data as IApiResponse<ICurrentUserResponse>).data;
  }

  async updateProfile(
    input: IUpdateProfileInput
  ): Promise<ICurrentUserResponse> {
    const response = await authInstance.put("/users/me", input);
    return (response.data as IApiResponse<ICurrentUserResponse>).data;
  }

  async publicProfile(userId: string): Promise<IPublicProfileResponse> {
    const response = await commonInstance.get(`/users/${userId}`);
    return (response.data as IApiResponse<IPublicProfileResponse>).data;
  }

  async banUser(
    userId: string,
    input: IBanUserInput
  ): Promise<IBanUserResponse> {
    const response = await authInstance.post(`/users/${userId}/ban`, input);
    return (response.data as IApiResponse<IBanUserResponse>).data;
  }
}

export default UserService.getInstance();
