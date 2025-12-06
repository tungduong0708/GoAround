export interface ICreateReportInput {
    targetType: 'post' | 'comment' | 'review';
    targetId: string;
    reason: string;
    details?: string;
}
