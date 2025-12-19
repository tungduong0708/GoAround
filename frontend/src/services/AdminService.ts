import { authInstance, commonInstance } from "@/config";
import type {} from "@/utils/interfaces";

class AdminService {
  private static instance: AdminService;
  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

}

export default AdminService.getInstance();
