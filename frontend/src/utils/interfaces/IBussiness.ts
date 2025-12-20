import { IUserPublic } from "./IUser";

export interface IBussinessVerificationDetail {
  user: IUserPublic;
  verification_id: string;
  business_image_url: string;
  business_description: string;

  // TODO: using Enum
  status: string;

  created_at: string;
  reviewed_at: string;
}
