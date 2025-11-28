import { UserRole } from "../types/UserRole";

interface ISignUpInput {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
}

export type { ISignUpInput };