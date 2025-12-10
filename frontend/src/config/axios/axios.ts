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
    return axiosError.response.data;
  }

  return {
    status: "error",
    message: axiosError.message || "An unexpected error occurred",
  };
}

class AxiosService {
  private static authInstance: AxiosInstance;
  private static commonInstance: AxiosInstance;

  public static getAuthInstance(): AxiosInstance {
    if (!AxiosService.authInstance) {
      AxiosService.createAuthInstance();
    }

    return AxiosService.authInstance;
  }

  public static createAuthInstance() {
    AxiosService.authInstance = axios.create({
      baseURL: apiDomain,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
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

    return AxiosService.commonInstance;
  }

  public static createCommonInstance() {
    AxiosService.commonInstance = axios.create({
      baseURL: apiDomain,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
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

const authInstance = AxiosService.getAuthInstance();
const commonInstance = AxiosService.getCommonInstance();

export { authInstance, commonInstance };
export default AxiosService;
