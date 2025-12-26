import type { IUserPublic } from "./IUser";

export interface IBussinessVerificationDetail {
  user: IUserPublic;
  verification_id: string;
  business_image_url: string;
  business_description: string;

  status: "pending" | "approved" | "rejected";

  created_at: string;
  reviewed_at?: string | null;
}


export interface IVerifyBusinessRequest {
  action: "approve" | "reject";
  notes?: string | null;
} 