export interface ICreateReportInput {
  target_type: "post" | "comment" | "review";
  target_id: string;
  reason: string;
  details?: string;
}
