import { authInstance } from "@/config";
import type {
    ITrip,
    ITripStop,
    ICreateTripInput,
    IGenerateTripInput,
    IAddPlaceToTripInput,
    IUpdateTripStopInput
} from "@/utils/interfaces";

class TripService {
    private static instance: TripService;
    private constructor() { }

    public static getInstance(): TripService {
        if (!TripService.instance) {
            TripService.instance = new TripService();
        }
        return TripService.instance;
    }

    async getTrips(): Promise<ITrip[]> {
        try {
            const response = await authInstance.get('/trips');
            return response.data as ITrip[];
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async createTrip(input: ICreateTripInput): Promise<ITrip> {
        try {
            const response = await authInstance.post('/trips', input);
            return response.data as ITrip;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async generateTrip(input: IGenerateTripInput): Promise<ITrip> {
        try {
            const response = await authInstance.post('/trips/generate', input);
            return response.data as ITrip;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async getTripById(id: string): Promise<ITrip> {
        try {
            const response = await authInstance.get(`/trips/${id}`);
            return response.data as ITrip;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async addPlaceToTrip(tripId: string, input: IAddPlaceToTripInput): Promise<ITripStop> {
        try {
            const response = await authInstance.post(`/trips/${tripId}/places`, input);
            return response.data as ITripStop;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async updateTripStop(tripId: string, stopId: string, input: IUpdateTripStopInput): Promise<ITripStop> {
        try {
            const response = await authInstance.put(`/trips/${tripId}/places/${stopId}`, input);
            return response.data as ITripStop;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async removePlaceFromTrip(tripId: string, stopId: string): Promise<{ message: string }> {
        try {
            const response = await authInstance.delete(`/trips/${tripId}/places/${stopId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
}

export default TripService.getInstance();
