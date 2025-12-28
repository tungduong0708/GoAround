import type { IForumCommentSchema, IForumPostDetail } from "./IForum";

export interface IReportDetail {
  id: string;
  reporter_id: string;
  reason: string;
  created_at: string;
}

export interface IModerationCaseSummary {
  id: string;
  target_type: "post" | "reply";
  target_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  report_count: number;
}

export interface IModerationCaseDetail {
  id: string;
  target_type: "post" | "reply";
  target_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  report_count: number;
  reason: string | null;
  resolved_at: string | null;
  content_snapshot: IForumPostDetail | IForumCommentSchema | null;
  reports: IReportDetail[];
}

export interface IContentReportCreate {
  reason: string;
}

export interface IResolveCaseRequest {
  action: "dismiss" | "remove_content" | "ban_user";
  notes?: string | null;
  ban_duration_days?: number | null;
}

// Deprecated
// export interface IResolveReportInput {
//   action: "delete" | "dismiss" | "ban";
// }

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
// export interface ICreateReportInput {
//   target_type: "post" | "comment" | "review";
//   target_id: string;
//   reason: string;
//   details?: string;
// }
