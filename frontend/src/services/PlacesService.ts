// Temporarily done for refactoring api calls and error handling
import { authInstance, commonInstance } from "@/config";
import type {
  IPlacePublic,
  IPlaceCreate as IPlaceCreate,
  IPlaceUpdate,
  IPlaceSearchQuery,
  IApiResponse,
  IPaginatedResponse,
  IPlaceDetail,
  IMessage,
  ITransferOwnershipRequest,
  IReviewSchema,
  IPagingQuery,
  IPlaceSearchResponse,
} from "@/utils/interfaces";

class PlacesService {
  private static instance: PlacesService;
  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): PlacesService {
    if (!PlacesService.instance) {
      PlacesService.instance = new PlacesService();
    }
    return PlacesService.instance;
  }

  async getPlaces(
    query?: IPlaceSearchQuery,
  ): Promise<IPaginatedResponse<IPlaceSearchResponse>> {
    try {
      // 1. Initialize search params
      const params = new URLSearchParams();

      if (query) {
        // 2. Iterate through the query object
        Object.entries(query).forEach(([key, value]) => {
          // Skip null or undefined values
          if (value !== null && value !== undefined) {
            // Special handling for nested location object if necessary
            if (key === 'location' && typeof value === 'object') {
              // Example: flat format like ?lat=...&lng=...
              if (value.lat) params.append('location', value.lat.toString() + ',' + value.lng.toString());
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      // 3. Construct the manual URL
      const queryString = params.toString();
      const url = `/places${queryString ? `?${queryString}` : ""}`;

      // 4. Perform the request
      const response = await commonInstance.get(url);
      return response.data as IPaginatedResponse<IPlaceSearchResponse>;

    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        console.error("Access Forbidden: ", error.response.data.detail);
      }
      throw error;
    } 
  }
  async createPlace(input: IPlaceCreate): Promise<IPlaceDetail> {
    try {
      const response = await authInstance.post("/places", input);
      return (response.data as IApiResponse<IPlaceDetail>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }


  async getOwnedPlaces(): Promise<IPaginatedResponse<IPlacePublic[]>> {
    const response = await authInstance.get("/places/me");
    return (response.data as IPaginatedResponse<IPlacePublic[]>); 
  }

  async getPlaceById(id: string): Promise<IPlaceDetail> {
    try{
      const response = await commonInstance.get(`/places/${id}`);
      return (response.data as IApiResponse<IPlaceDetail>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }


  
  async updatePlace(id: string, input: IPlaceUpdate): Promise<IPlaceDetail> {
    try {
      const response = await authInstance.put(`/places/${id}`, input);
      return (response.data as IApiResponse<IPlaceDetail>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      else if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async deletePlace(id: string): Promise<IMessage> {
    try {
      const response = await authInstance.delete(`/places/${id}`);
      return (response.data as IApiResponse<IMessage>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      else if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  /**
   * Get AI-powered personalized place recommendations
   * @param query - Natural language search query (e.g., "romantic dinner spots")
   * @param city - Optional city filter
   * @param maxResults - Maximum number of recommendations (1-50)
   */
  async getAIRecommendations(params?: {
    query?: string;
    city?: string;
    maxResults?: number;
  }): Promise<IPlacePublic[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.query) {
      queryParams.append('query', params.query);
    }
    if (params?.city) {
      queryParams.append('city', params.city);
    }
    if (params?.maxResults) {
      queryParams.append('max_results', params.maxResults.toString());
    }

    const response = await authInstance.get(
      `/places/recommendations?${queryParams.toString()}`
    );
    
    return (response.data as IApiResponse<IPlacePublic[]>).data;
  }

  async getReviewsForPlace(
    placeId: string,
    query: IPagingQuery 
  ): Promise<IPaginatedResponse<IReviewSchema[]>> { 
    // TODO: Check the query params later 
    try {
      const response = await commonInstance.get(`/places/${placeId}/reviews`, {
        params: query,
      });
      return response.data as IPaginatedResponse<IReviewSchema[]>;
    }
    catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }


  async transferOwnership(
    id: string,
    input: ITransferOwnershipRequest,
  ): Promise<IMessage> {
    try {
      const response = await authInstance.post(`/places/${id}/transfer`, input);
      return (response.data as IApiResponse<IMessage>).data;
    }
    catch (error: any) {
      if (error.response && error.response.status === 400) {
        console.error("Bad Request: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      else if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      else if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async getCities(): Promise<string[]> {
    try {
      const response = await commonInstance.get<IApiResponse<string[]>>("/places/cities/list");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      throw error;
    }
  }
}

export default PlacesService.getInstance();
