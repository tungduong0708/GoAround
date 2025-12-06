export interface IReporter {
    id: string;
    username: string;
}

export interface IReport {
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    status: string;
    createdAt: string;
    reporter: IReporter;
}
