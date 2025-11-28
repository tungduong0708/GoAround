import type { User, Session } from "@supabase/supabase-js";

interface ISignInResponse {
    user: User | null;
    session: Session | null;
}

export type { ISignInResponse };
