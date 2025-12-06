import type { UserRole } from "../types/UserRole";

interface ICurrentUserResponse {
    id: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    role: UserRole;
    isVerifiedBusiness: boolean;
    email: string;
}

export type {ICurrentUserResponse}