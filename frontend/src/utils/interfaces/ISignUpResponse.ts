import type { User, Session } from "@supabase/supabase-js";

export interface ISignUpResponse {
  user: User | null;
  session: Session | null;
}
