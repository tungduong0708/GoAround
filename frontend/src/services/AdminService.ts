import { authInstance, commonInstance } from "@/config";
import type {
  IApiResponse,
  IMessage,
  IPaginatedResponse,
  IReportQuery,
} from "@/utils/interfaces";
import type {
  IContentReportResponse,
  IContentReportCreate,

  IResolveReportRequest,
} from "@/utils/interfaces";
import type { 
  IBussinessVerificationDetail,
  IVerifyBusinessRequest } from "@/utils/interfaces";

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

  async getAdminReports(
    query?: IReportQuery,
  ): Promise<IPaginatedResponse<IContentReportResponse[]>> {
    try {
      const response = await authInstance.get("/admin/reports", {
        params: query,
      });
      return response.data as IPaginatedResponse<IContentReportResponse[]>;
    } catch (error: any) {
      // Handle error
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 422) {
        console.error("Validation Error: ", error.response.data.detail);
        // Handle specific logic here (e.g., show validation messages)
      }
      throw error;
    }
  }
  async resolveReport(
    reportId: string,
    reportRequest: IResolveReportRequest,
  ): Promise<IApiResponse<IMessage>> {
    try {
      const response = await authInstance.post(
        `/admin/reports/${reportId}/resolve`,
        reportRequest,
      );
      return response.data as IApiResponse<IMessage>;
    } catch (error: any) {
      // Handle error
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 404) {
        console.error("Report Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., show not found message)
      } else if (error.response && error.response.status === 422) {
        console.error("Validation Error: ", error.response.data.detail);
        // Handle specific logic here (e.g., show validation messages)
      }
      throw error;
    }
  }
  async getUnverifiedBussinesses(
    page: number,
    limit: number,
  ): Promise<IApiResponse<IBussinessVerificationDetail>> {
    try {
      const response = await authInstance.get(
        `/admin/businesses/unverified?page=${page}&limit=${limit}`,
      );
      return response.data as IApiResponse<IBussinessVerificationDetail>;
    } catch (error: any) {
      // Handle error
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 404) {
        console.error("Businesses Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., show not found message)
      } else if (error.response && error.response.status === 422) {
        console.error("Validation Error: ", error.response.data.detail);
        // Handle specific logic here (e.g., show validation messages)
      }
      throw error;
    }
  }
  async verifyBusiness(
    id: string,
    input: IVerifyBusinessRequest,
  ): Promise<IMessage> {
    try {
      const response = await authInstance.post(
        `/admin/businesses/${id}/verify`,
        input,
      );
      return (response.data as IApiResponse<IMessage>).data;
    } catch (error: any) {
      // Handle error
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 404) {
        console.error("Business Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., show not found message)
      } else if (error.response && error.response.status === 422) {
        console.error("Validation Error: ", error.response.data.detail);
        // Handle specific logic here (e.g., show validation messages)
      }
      throw error;
    }
  }
}

export default AdminService.getInstance();
