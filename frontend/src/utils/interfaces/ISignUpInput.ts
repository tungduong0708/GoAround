import { UserRole } from "../types/UserRole";

export interface ISignUpInput {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
}
