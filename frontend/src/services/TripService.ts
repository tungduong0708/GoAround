import { authInstance } from "@/config";
import { mockTrips } from "@/utils/constants/mockData";
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
    // TODO: Waiting for API implementation
    // Currently, just use the mock data
    // const response = await authInstance.get("/trips");
    // return response.data as IPaginatedResponse<ITrip[]>;
    return {
      status: "success",
      data: mockTrips,
      meta: {
        page: 1,
        limit: 10,
        totalItems: mockTrips.length,
      },
    };
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
    // TODO: Waiting for API implementation
    // Currently, just use the mock data
    // const response = await authInstance.get(`/trips/${id}`);
    // return (response.data as IApiResponse<ITrip>).data;
    const trip = mockTrips.find((trip) => trip.id === id);
    if (!trip) throw new Error(`Trip with id ${id} not found`);
    return trip;
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
