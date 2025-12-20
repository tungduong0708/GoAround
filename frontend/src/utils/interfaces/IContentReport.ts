export interface IContentReportResponse {
    id: string; 
    reporter_id: string; 
    target_type: string; 
    target_id: string;
    reason: string;
    created_at: string;
}

export interface IContentReportCreate{
    reason: string; 
}

export interface IResolveReportRequest {
    // TODO: Use enum later
    action: string; 
    notes?: string;
}