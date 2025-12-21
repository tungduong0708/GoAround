// Temporarily done for refactoring API call
import { authInstance } from "@/config";
import type { ITokenPayload, IApiResponse } from "@/utils/interfaces";

class PrivateService {
  private static instance: PrivateService;
  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): PrivateService {
    if (!PrivateService.instance) {
      PrivateService.instance = new PrivateService();
    }
    return PrivateService.instance;
  }

  async getDecodedToken(): Promise<ITokenPayload> {
    const response = await authInstance.get("/private/me");
    return (response.data as IApiResponse<ITokenPayload>).data;
  }
}

export default PrivateService.getInstance();
