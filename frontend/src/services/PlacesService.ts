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
      const response = await commonInstance.get("/places", { params: query });
      return response.data as IPaginatedResponse<IPlaceSearchResponse>;
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
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

  // Temporarily disable recommendations since this is not documented in the backend yet
  // async getRecommendations(): Promise<IPlace[]> {
  //   const response = await commonInstance.get("/places/recommendations");
  //   return (response.data as IApiResponse<IPlace[]>).data;
  // }

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

}

export default PlacesService.getInstance();
