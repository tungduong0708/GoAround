import type { UserRole } from "../types/UserRole";

export interface IPublicProfileResponse {
  id: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isVerifiedBusiness: boolean;
}
