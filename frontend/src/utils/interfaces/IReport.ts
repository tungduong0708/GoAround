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
