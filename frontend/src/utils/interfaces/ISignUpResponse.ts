import type { User, Session } from "@supabase/supabase-js";

interface ISignUpResponse {
  user: User | null;
  session: Session | null;
}

export type { ISignUpResponse };
