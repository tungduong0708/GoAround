import { authInstance } from "@/config";
import type {
    IReport,
    ICreateReportInput,
    IResolveReportInput,
    IReportSearchQuery
} from "@/utils/interfaces";

class ModerationService {
    private static instance: ModerationService;
    private constructor() { }

    public static getInstance(): ModerationService {
        if (!ModerationService.instance) {
            ModerationService.instance = new ModerationService();
        }
        return ModerationService.instance;
    }

    async submitReport(input: ICreateReportInput): Promise<{ message: string }> {
        try {
            const response = await authInstance.post('/reports', input);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async getReports(query?: IReportSearchQuery): Promise<IReport[]> {
        try {
            const response = await authInstance.get('/admin/reports', { params: query });
            return response.data as IReport[];
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async resolveReport(id: string, input: IResolveReportInput): Promise<{ message: string }> {
        try {
            const response = await authInstance.post(`/admin/reports/${id}/resolve`, input);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
}

export default ModerationService.getInstance();
