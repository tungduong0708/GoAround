import { authInstance } from "@/config";
import type {
  IReport,
  ICreateReportInput,
  IResolveReportInput,
  IReportSearchQuery,
  IApiResponse,
  IPaginatedResponse,
} from "@/utils/interfaces";

class ModerationService {
  private static instance: ModerationService;
  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ModerationService {
    if (!ModerationService.instance) {
      ModerationService.instance = new ModerationService();
    }
    return ModerationService.instance;
  }

  async submitReport(input: ICreateReportInput): Promise<{ message: string }> {
    const response = await authInstance.post("/reports", input);
    return (response.data as IApiResponse<{ message: string }>).data;
  }

  async getReports(
    query?: IReportSearchQuery
  ): Promise<IPaginatedResponse<IReport[]>> {
    const response = await authInstance.get("/admin/reports", {
      params: query,
    });
    return response.data as IPaginatedResponse<IReport[]>;
  }

  async resolveReport(
    id: string,
    input: IResolveReportInput
  ): Promise<{ message: string }> {
    const response = await authInstance.post(
      `/admin/reports/${id}/resolve`,
      input
    );
    return (response.data as IApiResponse<{ message: string }>).data;
  }
}

export default ModerationService.getInstance();
