import { apiDomain } from "@/utils/constants";
import axios, { type AxiosInstance, type AxiosError } from "axios";
import { supabase } from "@/config/supabase/supabase";
import type { IErrorResponse } from "@/utils/interfaces";

/**
 * Helper to extract a typed error response from an Axios error.
 * Returns the API error response if available, otherwise creates a generic error.
 */
export function extractApiError(error: unknown): IErrorResponse {
  const axiosError = error as AxiosError<IErrorResponse>;

  if (axiosError.response?.data) {
    return {
      ...axiosError.response.data,
      statusCode: axiosError.response.status,
    };
  }

  return {
    status: "error",
    message: axiosError.message || "An unexpected error occurred",
    statusCode: axiosError.response?.status,
  };
}

/**
 * Axios Service - Manages HTTP client instances with automatic auth token injection
 * 
 * This service creates and manages two axios instances:
 * - authInstance: For authenticated requests (requires valid session)
 * - commonInstance: For public/optional auth requests
 * 
 * Both instances include interceptors that:
 * - Automatically attach JWT tokens from Supabase auth (cached for performance)
 * - Handle 401 errors by signing out the user
 * - Normalize error responses for consistent handling
 * 
 * Performance: Uses cached access token that's updated via auth state listener
 * to avoid async getSession() calls on every request.
 * 
 * HMR Support: The instances are properly recreated during hot module replacement
 * to prevent stale interceptors that can cause navigation issues in dev mode.
 */
class AxiosService {
  private static authInstance: AxiosInstance | null = null;
  private static commonInstance: AxiosInstance | null = null;
  private static cachedAccessToken: string | null = null;
  private static isListenerSetup = false;

  /**
   * Initialize auth state listener to cache access token
   * This eliminates the need for async getSession() calls on every request
   */
  private static async setupAuthListener() {
    if (this.isListenerSetup) return;
    
    // Get initial session and wait for it to ensure token is cached before any API calls
    const { data } = await supabase.auth.getSession();
    this.cachedAccessToken = data.session?.access_token ?? null;

    // Listen for auth state changes to keep token fresh
    supabase.auth.onAuthStateChange((event, session) => {
      this.cachedAccessToken = session?.access_token ?? null;
      
      // Explicitly clear token on sign out to prevent stale token issues
      if (event === 'SIGNED_OUT') {
        this.cachedAccessToken = null;
      }
    });

    this.isListenerSetup = true;
  }

  /**
   * Get cached access token (synchronous, no await needed)
   */
  private static getAccessToken(): string | null {
    return this.cachedAccessToken;
  }

  /**
   * Manually clear cached access token (used on sign out)
   */
  public static clearCachedToken(): void {
    this.cachedAccessToken = null;
  }

  /**
   * Initialize axios instances with proper token caching
   * Should be called during app initialization before any API calls
   */
  public static async initialize(): Promise<void> {
    await this.setupAuthListener();
    // Ensure both instances are created after token is cached
    if (!this.authInstance) {
      await this.createAuthInstance();
    }
    if (!this.commonInstance) {
      await this.createCommonInstance();
    }
  }

  public static getAuthInstance(): AxiosInstance {
    if (!AxiosService.authInstance) {
      // Create synchronously but setup listener will handle token caching
      AxiosService.createAuthInstance();
    }

    return AxiosService.authInstance!;
  }

  public static async createAuthInstance() {
    // Setup listener on first creation and wait for initial token
    await this.setupAuthListener();

    // Clear old interceptors if instance exists
    if (AxiosService.authInstance) {
      AxiosService.authInstance.interceptors.request.clear();
      AxiosService.authInstance.interceptors.response.clear();
    }

    AxiosService.authInstance = axios.create({
      baseURL: apiDomain,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // Increased for AI recommendations
      withCredentials: true,
    });

    // Synchronous token injection - much faster than async getSession()
    AxiosService.authInstance.interceptors.request.use((request) => {
      const token = this.getAccessToken();
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
      return request;
    });

    AxiosService.authInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<IErrorResponse>) => {
        if (error?.response?.status === 401) {
          console.error("Unauthorized request:", error);
          await supabase.auth.signOut();
        }
        // Reject with the typed error response for consistent handling
        return Promise.reject(extractApiError(error));
      }
    );
  }

  public static getCommonInstance(): AxiosInstance {
    if (!AxiosService.commonInstance) {
      AxiosService.createCommonInstance();
    }

    return AxiosService.commonInstance!;
  }

  public static async createCommonInstance() {
    // Setup listener on first creation and wait for initial token
    await this.setupAuthListener();

    // Clear old interceptors if instance exists
    if (AxiosService.commonInstance) {
      AxiosService.commonInstance.interceptors.request.clear();
      AxiosService.commonInstance.interceptors.response.clear();
    }

    AxiosService.commonInstance = axios.create({
      baseURL: apiDomain,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
      withCredentials: true,
    });

    // Synchronous token injection - much faster than async getSession()
    AxiosService.commonInstance.interceptors.request.use((request) => {
      const token = this.getAccessToken();
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
      return request;
    });

    // Add response interceptor to common instance as well for consistent error handling
    AxiosService.commonInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<IErrorResponse>) => {
        return Promise.reject(extractApiError(error));
      }
    );
  }
}

// Create a proxy that always returns the current instance
// This ensures services get the fresh instance after HMR
const authInstanceProxy = new Proxy({} as AxiosInstance, {
  get(_target, prop) {
    const instance = AxiosService.getAuthInstance();
    const value = instance[prop as keyof AxiosInstance];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

const commonInstanceProxy = new Proxy({} as AxiosInstance, {
  get(_target, prop) {
    const instance = AxiosService.getCommonInstance();
    const value = instance[prop as keyof AxiosInstance];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

// Handle HMR (Hot Module Replacement) to recreate axios instances
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('[HMR] Recreating axios instances...');
    AxiosService.createAuthInstance();
    AxiosService.createCommonInstance();
  });
  
  // Cleanup old interceptors on dispose
  import.meta.hot.dispose(() => {
    console.log('[HMR] Disposing axios instances...');
    // Clear all interceptors before recreating
    const auth = AxiosService.getAuthInstance();
    const common = AxiosService.getCommonInstance();
    if (auth) {
      auth.interceptors.request.clear();
      auth.interceptors.response.clear();
    }
    if (common) {
      common.interceptors.request.clear();
      common.interceptors.response.clear();
    }
  });
}

export { authInstanceProxy as authInstance, commonInstanceProxy as commonInstance };
export default AxiosService;
