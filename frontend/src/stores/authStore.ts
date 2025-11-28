import type { ISignInInput, ISignUpInput } from "@/utils/interfaces";
import { UserRole } from "@/utils/types/UserRole";
import { defineStore } from "pinia";
import { AuthenticationService } from "@/services";
import { supabase } from "@/config/supabase/supabase";
import type { User, Session } from "@supabase/supabase-js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    session: null as Session | null,
    role: null as UserRole | null,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async initialize() {
      this.isLoading = true;
      try {
        const session = await AuthenticationService.getSession();
        if (session) {
          this.session = session;
          this.user = session.user;
          this.role = (session.user.user_metadata.role as UserRole) || UserRole.TRAVELLER;
          this.isAuthenticated = true;
        } else {
          this.session = null;
          this.user = null;
          this.role = null;
          this.isAuthenticated = false;
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          this.session = session;
          this.user = session?.user ?? null;
          this.role = (session?.user?.user_metadata?.role as UserRole) || (session ? UserRole.TRAVELLER : null);
          this.isAuthenticated = !!session;
        });
      } catch (error: any) {
        // If session check fails, try to sign out to clear state
        try {
          await AuthenticationService.signOut();
        } catch (e) {
          // Ignore sign out error
        }
        this.session = null;
        this.user = null;
        this.isAuthenticated = false;
        this.role = null;
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    async register(input: ISignUpInput) {
      this.isLoading = true;
      this.error = null;
      try {
        const data = await AuthenticationService.signUp(input);
        if (data.user) {
          this.user = data.user;
          this.session = data.session;
          this.role = (data.user?.user_metadata.role as UserRole) || UserRole.TRAVELLER;
          this.isAuthenticated = !!data.session;
        }
      } catch (error: any) {
        if (error.name === "SignUpFailedException") {
          this.error = error.message;
        } else {
          this.error = "An unexpected error occurred during registration.";
        }
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async login(input: ISignInInput) {
      this.isLoading = true;
      this.error = null;
      try {
        const data = await AuthenticationService.signIn(input);
        if (data.session) {
          this.session = data.session;
          this.user = data.user;
          this.role = (data.user?.user_metadata.role as UserRole) || UserRole.TRAVELLER;
          this.isAuthenticated = true;
        }
      } catch (error: any) {
        if (error.name === "SignInFailedException") {
          this.error = error.message;
        } else {
          this.error = "An unexpected error occurred during login.";
        }
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      this.isLoading = true;
      this.error = null;
      try {
        await AuthenticationService.signOut();
        this.session = null;
        this.user = null;
        this.isAuthenticated = false;
        this.role = null;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async upgradeToBusinessOwner() {
      this.isLoading = true;
      this.error = null;
      try {
        const user = await AuthenticationService.updateUserMetadata({
          role: UserRole.BUSINESS_OWNER,
        });
        if (user) {
          this.user = user;
          this.role = UserRole.BUSINESS_OWNER;
        }
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});