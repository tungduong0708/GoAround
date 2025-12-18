import { authInstance } from "@/config";
import type {
  ITrip,
  ITripStop,
  ICreateTripInput,
  IGenerateTripInput,
  IAddPlaceToTripInput,
  IUpdateTripStopInput,
  IApiResponse,
  IPaginatedResponse,
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

  async getTrips(): Promise<IPaginatedResponse<ITrip[]>> {
    const response = await authInstance.get("/trips");
    console.log(response.data);
    return response.data as IPaginatedResponse<ITrip[]>;
  }

  async createTrip(input: ICreateTripInput): Promise<ITrip> {
    const response = await authInstance.post("/trips", input);
    return (response.data as IApiResponse<ITrip>).data;
  }

  async generateTrip(input: IGenerateTripInput): Promise<ITrip> {
    const response = await authInstance.post("/trips/generate", input);
    return (response.data as IApiResponse<ITrip>).data;
  }

  async getTripById(id: string): Promise<ITrip> {
    const response = await authInstance.get(`/trips/${id}`);
    return (response.data as IApiResponse<ITrip>).data;
  }

  async addPlaceToTrip(
    tripId: string,
    input: IAddPlaceToTripInput,
  ): Promise<ITripStop> {
    const response = await authInstance.post(`/trips/${tripId}/places`, input);
    return (response.data as IApiResponse<ITripStop>).data;
  }

  async updateTripStop(
    tripId: string,
    stopId: string,
    input: IUpdateTripStopInput,
  ): Promise<ITripStop> {
    const response = await authInstance.put(
      `/trips/${tripId}/places/${stopId}`,
      input,
    );
    return (response.data as IApiResponse<ITripStop>).data;
  }

  async removePlaceFromTrip(
    tripId: string,
    stopId: string,
  ): Promise<{ message: string }> {
    const response = await authInstance.delete(
      `/trips/${tripId}/places/${stopId}`,
    );
    return (response.data as IApiResponse<{ message: string }>).data;
  }
}

export default TripService.getInstance();
