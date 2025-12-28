// TODO: WIP
import { supabase } from "@/config/supabase/supabase";
import type {
  ISignInInput,
  ISignUpInput,
  ISignInResponse,
  ISignUpResponse,
} from "@/utils/interfaces";
import {
  SignInFailedException,
  SignUpFailedException,
} from "@/utils/exceptions";

class AuthenticationService {
  private static instance: AuthenticationService;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  async signUp(input: ISignUpInput): Promise<ISignUpResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
          phone: input.phone,
          username: input.username,
          role: input.role,
        },
      },
    });
    if (error) throw new SignUpFailedException(error.message);
    return {
      user: data.user,
      session: data.session,
    };
  }

  async signIn(input: ISignInInput): Promise<ISignInResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error) throw new SignInFailedException(error.message);
    return {
      user: data.user,
      session: data.session,
    };
  }

  async signOut() {
    // Sign out with 'local' scope removes the session from the current browser
    // This clears the access token and refresh token from storage
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
    
    // Force clear the session from memory
    await supabase.auth.getSession();
  }

  async getMe() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async updateUserMetadata(metadata: object) {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });
    if (error) throw error;
    return data.user;
  }
}

export default AuthenticationService.getInstance();
