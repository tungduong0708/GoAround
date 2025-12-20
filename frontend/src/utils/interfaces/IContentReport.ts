export interface IContentReportResponse {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  created_at: string;
}

export interface IContentReportCreate {
  reason: string;
}

export interface IResolveReportRequest {
  // TODO: Use enum later
  action: string;
  notes?: string;
}

// Deprecated
export interface IResolveReportInput {
  action: "delete" | "dismiss" | "ban";
}

export interface IReportSearchQuery {
  status?: string;
}

export interface IReporter {
  id: string;
  username: string;
}

export interface IReport {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter: IReporter;
}
