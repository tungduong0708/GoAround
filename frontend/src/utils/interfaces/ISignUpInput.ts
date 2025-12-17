import { UserRole } from "../types/UserRole";

export interface ISignUpInput {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: UserRole;
}
