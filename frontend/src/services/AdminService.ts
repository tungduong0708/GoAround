import { authInstance, commonInstance } from "@/config";
import type { IMessage, IPaginatedResponse, IReportQuery } from "@/utils/interfaces";
import type { IContentReportResponse, IContentReportCreate } from "@/utils/interfaces";

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
    query?: IReportQuery
  ): Promise<IPaginatedResponse<IContentReportResponse[]>> {
    try {
      const response = await authInstance.get("/admin/reports", 
        { params: query }
      );
      return response.data as IPaginatedResponse<IContentReportResponse[]>;
    } catch (error: any) {
      // Handle error
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      else if (error.response && error.response.status === 422) {
        console.error("Validation Error: ", error.response.data.detail);
        // Handle specific logic here (e.g., show validation messages)
      }
      throw error;
    }
  }
  async resolveReport(
    reportId: string,
    reportRequest: IResolveReportRequest
  ) : Promise<IMessage> {
    try {
      const response = await authInstance.post(`/admin/reports/${reportId}/resolve`, reportRequest);
      return response.data as IMessage;
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

}

export default AdminService.getInstance();
