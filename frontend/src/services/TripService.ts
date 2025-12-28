// Temporarily done for refactoring API call
import { authInstance, commonInstance } from "@/config";
import type {
  ITripListSchema,
  // ITripStopSchema,
  ITripUpdate,
  // IGenerateTripInput,
  // ITripStopCreate,
  // ITripStopUpdate,
  IApiResponse,
  IPaginatedResponse,
  ITripSchema,
  ITripCreate,
  IPagingQuery,
  IMessage,
  ITripGenerateRequest,
} from "@/utils/interfaces";

class TripService {
  private static instance: TripService;
  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): TripService {
    if (!TripService.instance) {
      TripService.instance = new TripService();
    }
    return TripService.instance;
  }

  async getTrips(
    query?: IPagingQuery,
  ): Promise<IPaginatedResponse<ITripListSchema[]>> {
    console.log("Fetching trips with query:", query);
    const response = await authInstance.get("/trips", { params: query });
    return response.data as IPaginatedResponse<ITripListSchema[]>;
  }

  async getPublicTrips(
    query?: IPagingQuery,
  ): Promise<IPaginatedResponse<ITripListSchema[]>> {
    console.log("Fetching public trips with query:", query);
    const response = await commonInstance.get("/utils/public-trips", { 
      params: query 
    });
    return response.data as IPaginatedResponse<ITripListSchema[]>;
  }

  async createTrip(input: ITripCreate): Promise<ITripSchema> {
    try {
      const response = await authInstance.post("/trips", input);
      return (response.data as IApiResponse<ITripSchema>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }
  async getTripById(id: string): Promise<ITripSchema> {
    try {
      const response = await authInstance.get(`/trips/${id}`);
      return (response.data as IApiResponse<ITripSchema>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async updateTrip(id: string, input: ITripUpdate): Promise<ITripSchema> {
    try {
      const response = await authInstance.put(`/trips/${id}`, input);
      return (response.data as IApiResponse<ITripSchema>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      } else if (error.response && error.response.status === 404) {
        console.error("Not Found: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async deleteTrip(id: string): Promise<IMessage> {
    try {
      const response = await authInstance.delete(`/trips/${id}`);
      return (response.data as IApiResponse<IMessage>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async generateTrip(input: ITripGenerateRequest): Promise<ITripSchema> {
    try {
      // AI generation can take a while, so disable timeout (set to 0)
      const response = await authInstance.post("/trips/generate", input, {
        timeout: 0, // No timeout - wait for server response
      });
      console.log('Generate trip API raw response:', response);
      console.log('Generate trip API response.data:', response.data);
      
      // Backend returns APIResponse[TripSchema] = { data: TripSchema, meta: null }
      const apiResponse = response.data as IApiResponse<ITripSchema>;
      console.log('Parsed API response:', apiResponse);
      console.log('Trip data:', apiResponse.data);
      
      if (!apiResponse.data || !apiResponse.data.id) {
        console.error('Invalid trip data received. Full response:', response.data);
        throw new Error('Invalid response from server: missing trip data');
      }
      
      return apiResponse.data;
    } catch (error: any) {
      console.error("Generate trip error:", error);
      
      if (error.response && error.response.status === 400) {
        console.error("Bad Request: ", error.response.data);
        throw new Error(error.response.data.detail || 'Bad request');
      } else if (error.response && error.response.status === 500) {
        console.error("Server Error: ", error.response.data);
        throw new Error(error.response.data.detail || 'Server error');
      }
      
      throw error;
    }
  }
  // Commented out trip stop APIs since they are handled by updateTrip now.
  // async addTripStop(
  //   tripId: string,
  //   input: ITripStopCreate,
  // ): Promise<ITripStopSchema> {
  //   try {
  //     const response = await authInstance.post(
  //       `/trips/${tripId}/places`,
  //       input,
  //     );
  //     return (response.data as IApiResponse<ITripStopSchema>).data;
  //   } catch (error: any) {
  //     if (error.response && error.response.status === 403) {
  //       console.error("Access Forbidden: ", error.response.data.detail);
  //       // Handle specific logic here (e.g., redirect to home, show a toast)
  //     } else if (error.response && error.response.status === 404) {
  //       console.error("Not Found: ", error.response.data.detail);
  //       // Handle specific logic here (e.g., redirect to home, show a toast)
  //     }
  //     throw error; // Re-throw so the calling component knows the request failed
  //   }
  // }
  // async updateTripStop(tripId: string, stopId: string, input: ITripStopUpdate) {
  //   try {
  //     const response = await authInstance.put(
  //       `/trips/${tripId}/places/${stopId}`,
  //       input,
  //     );
  //     return (response.data as IApiResponse<ITripStopSchema>).data;
  //   } catch (error: any) {
  //     if (error.response && error.response.status === 403) {
  //       console.error("Access Forbidden: ", error.response.data.detail);
  //       // Handle specific logic here (e.g., redirect to home, show a toast)
  //     } else if (error.response && error.response.status === 404) {
  //       console.error("Not Found: ", error.response.data.detail);
  //       // Handle specific logic here (e.g., redirect to home, show a toast)
  //     }
  //     throw error; // Re-throw so the calling component knows the request failed
  //   }
  // }
  // async removeTripStop(tripId: string, stopId: string) {
  //   try {
  //     const response = await authInstance.delete(
  //       `/trips/${tripId}/places/${stopId}`,
  //     );
  //     return (response.data as IApiResponse<{ message: string }>).data;
  //   } catch (error: any) {
  //     if (error.response && error.response.status === 403) {
  //       console.error("Access Forbidden: ", error.response.data.detail);
  //       // Handle specific logic here (e.g., redirect to home, show a toast)
  //     }
  //     throw error; // Re-throw so the calling component knows the request failed
  //   }
  // }

  // Temporarily commented out APIs for refactoring based on new interfaces.
  // async generateTrip(input: IGenerateTripInput): Promise<ITrip> {
  //   const response = await authInstance.post("/trips/generate", input);
  //   return (response.data as IApiResponse<ITrip>).data;
  // }

  // async getTripById(id: string): Promise<ITrip> {
  //   const response = await authInstance.get(`/trips/${id}`);
  //   return (response.data as IApiResponse<ITrip>).data;
  // }

  // async addPlaceToTrip(
  //   tripId: string,
  //   input: IAddPlaceToTripInput,
  // ): Promise<ITripStop> {
  //   const response = await authInstance.post(`/trips/${tripId}/places`, input);
  //   return (response.data as IApiResponse<ITripStop>).data;
  // }

  // async updateTripStop(
  //   tripId: string,
  //   stopId: string,
  //   input: IUpdateTripStopInput,
  // ): Promise<ITripStop> {
  //   const response = await authInstance.put(
  //     `/trips/${tripId}/places/${stopId}`,
  //     input,
  //   );
  //   return (response.data as IApiResponse<ITripStop>).data;
  // }

  // async removePlaceFromTrip(
  //   tripId: string,
  //   stopId: string,
  // ): Promise<{ message: string }> {
  //   const response = await authInstance.delete(
  //     `/trips/${tripId}/places/${stopId}`,
  //   );
  //   return (response.data as IApiResponse<{ message: string }>).data;
  // }
}

export default TripService.getInstance();
