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
  action: "dismiss" | "remove_content" | "ban_user";
  notes?: string | null;
  ban_duration_days?: number | null;
}

// Deprecated
export interface IResolveReportInput {
  action: "delete" | "dismiss" | "ban";
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

// Deprecated
export interface ICreateReportInput {
  target_type: "post" | "comment" | "review";
  target_id: string;
  reason: string;
  details?: string;
}
