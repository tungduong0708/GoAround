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
 * - Automatically attach JWT tokens from Supabase auth
 * - Handle 401 errors by signing out the user
 * - Normalize error responses for consistent handling
 * 
 * HMR Support: The instances are properly recreated during hot module replacement
 * to prevent stale interceptors that can cause navigation issues in dev mode.
 */
class AxiosService {
  private static authInstance: AxiosInstance | null = null;
  private static commonInstance: AxiosInstance | null = null;

  public static getAuthInstance(): AxiosInstance {
    if (!AxiosService.authInstance) {
      AxiosService.createAuthInstance();
    }

    return AxiosService.authInstance!;
  }

  public static createAuthInstance() {
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

    AxiosService.authInstance.interceptors.request.use(async (request) => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        request.headers.Authorization = `Bearer ${data.session.access_token}`;
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

  public static createCommonInstance() {
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

    // Add request interceptor to include auth token if available (for optional auth endpoints)
    AxiosService.commonInstance.interceptors.request.use(async (request) => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        request.headers.Authorization = `Bearer ${data.session.access_token}`;
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
