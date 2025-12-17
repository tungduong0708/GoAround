import type { UserRole } from "../types/UserRole";

export interface ICurrentUserResponse {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_verified_business: boolean;
  email: string;
}
