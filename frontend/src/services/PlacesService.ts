import { authInstance, commonInstance } from "@/config";
import type {
  IPlace,
  ICreatePlaceInput,
  IUpdatePlaceInput,
  ITransferOwnershipInput,
  IPlaceSearchQuery,
} from "@/utils/interfaces";

class PlacesService {
  private static instance: PlacesService;
  private constructor() {}

  public static getInstance(): PlacesService {
    if (!PlacesService.instance) {
      PlacesService.instance = new PlacesService();
    }
    return PlacesService.instance;
  }

  async getPlaces(query?: IPlaceSearchQuery): Promise<IPlace[]> {
    try {
      const response = await commonInstance.get("/places", { params: query });
      return response.data as IPlace[];
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  async getPlaceById(id: string): Promise<IPlace> {
    try {
      const response = await commonInstance.get(`/places/${id}`);
      return response.data as IPlace;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  async createPlace(input: ICreatePlaceInput): Promise<IPlace> {
    try {
      const response = await authInstance.post("/places", input);
      return response.data as IPlace;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  async updatePlace(id: string, input: IUpdatePlaceInput): Promise<IPlace> {
    try {
      const response = await authInstance.put(`/places/${id}`, input);
      return response.data as IPlace;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  async deletePlace(id: string): Promise<{ message: string }> {
    try {
      const response = await authInstance.delete(`/places/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  async transferOwnership(
    id: string,
    input: ITransferOwnershipInput
  ): Promise<{ message: string }> {
    try {
      const response = await authInstance.post(`/places/${id}/transfer`, input);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
}

export default PlacesService.getInstance();
