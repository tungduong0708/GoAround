import { authInstance } from "@/config";
import type {
  IApiResponse,
  IMessage,
  IModerationCaseDetail,
  IPaginatedResponse,
  IReportQuery,
} from "@/utils/interfaces";
import type {
  IModerationCaseSummary,
  IResolveCaseRequest,
} from "@/utils/interfaces";
import type {
  IBusinessVerificationDetail,
  IVerifyBusinessRequest,
} from "@/utils/interfaces";

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

  async getModerationCases(
    query?: IReportQuery
  ): Promise<IPaginatedResponse<IModerationCaseSummary[]>> {
    try {
      const response = await authInstance.get("/admin/cases", {
        params: query,
      });
      return response.data as IPaginatedResponse<IModerationCaseSummary[]>;
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

  async getCaseDetail(
    caseId: string
  ): Promise<IApiResponse<IModerationCaseDetail>> {
    try {
      const response = await authInstance.get(`/admin/cases/${caseId}`);
      return response.data as IApiResponse<IModerationCaseDetail>;
    } catch (error: any) {
      // Handle error
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 404) {
        console.error("Case Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., show validation messages)
      } else if (error.response && error.response.status === 422) {
        console.error("Validation Error: ", error.response.data.detail);
        // Handle specific logic here (e.g., show validation messages)
      }
      throw error;
    }
  }

  async resolveCase(
    caseId: string,
    reportRequest: IResolveCaseRequest
  ): Promise<IApiResponse<IMessage>> {
    try {
      const response = await authInstance.post(
        `/admin/cases/${caseId}/resolve`,
        reportRequest
      );
      return response.data as IApiResponse<IMessage>;
    } catch (error: any) {
      // Handle error
      if (error.response && error.response.status === 400) {
        console.error("Bad Request: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 404) {
        console.error("Case Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., show not found message)
      } else if (error.response && error.response.status === 422) {
        console.error("Validation Error: ", error.response.data.detail);
        // Handle specific logic here (e.g., show validation messages)
      }
      throw error;
    }
  }
  
  async getUnverifiedBusinesses(
    page: number,
    limit: number
  ): Promise<IPaginatedResponse<IBusinessVerificationDetail[]>> {
    try {
      const response = await authInstance.get(
        `/admin/businesses/unverified?page=${page}&limit=${limit}`
      );
      return response.data as IPaginatedResponse<IBusinessVerificationDetail[]>;
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
    input: IVerifyBusinessRequest
  ): Promise<IMessage> {
    try {
      const response = await authInstance.post(
        `/admin/businesses/${id}/verify`,
        input
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
