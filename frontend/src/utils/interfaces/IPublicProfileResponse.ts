import type { UserRole } from "../types/UserRole";

interface IPublicProfileResponse {
    id: string;
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    role: UserRole;
    isVerifiedBusiness: boolean;
}

export type {IPublicProfileResponse}
