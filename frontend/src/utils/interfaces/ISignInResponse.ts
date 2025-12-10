import type { User, Session } from "@supabase/supabase-js";

export interface ISignInResponse {
  user: User | null;
  session: Session | null;
}
