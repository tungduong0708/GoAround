import { apiDomain } from "@/utils/constants";
import axios, { type AxiosInstance } from "axios";
import { supabase } from "@/config/supabase/supabase";

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

    AxiosService.authInstance.interceptors.request.use(
      async (request) => {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          request.headers.Authorization = `Bearer ${data.session.access_token}`;
        }
        return request;
      }
    )

    AxiosService.authInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          console.error("Unauthorized request:", error);
          await supabase.auth.signOut();
        }
        return Promise.reject(error);
      }
    )
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
  }
}

const authInstance = AxiosService.getAuthInstance();
const commonInstance = AxiosService.getCommonInstance();

export { authInstance, commonInstance };
export default AxiosService;