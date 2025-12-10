import { authInstance, commonInstance } from "@/config";
import type {
  IPlace,
  ICreatePlaceInput,
  IUpdatePlaceInput,
  ITransferOwnershipInput,
  IPlaceSearchQuery,
  IApiResponse,
  IPaginatedResponse,
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
    query?: IPlaceSearchQuery
  ): Promise<IPaginatedResponse<IPlace[]>> {
    const response = await commonInstance.get("/places", { params: query });
    return response.data as IPaginatedResponse<IPlace[]>;
  }

  async getPlaceById(id: string): Promise<IPlace> {
    const response = await commonInstance.get(`/places/${id}`);
    return (response.data as IApiResponse<IPlace>).data;
  }

  async createPlace(input: ICreatePlaceInput): Promise<IPlace> {
    const response = await authInstance.post("/places", input);
    return (response.data as IApiResponse<IPlace>).data;
  }

  async updatePlace(id: string, input: IUpdatePlaceInput): Promise<IPlace> {
    const response = await authInstance.put(`/places/${id}`, input);
    return (response.data as IApiResponse<IPlace>).data;
  }

  async deletePlace(id: string): Promise<{ message: string }> {
    const response = await authInstance.delete(`/places/${id}`);
    return (response.data as IApiResponse<{ message: string }>).data;
  }

  async transferOwnership(
    id: string,
    input: ITransferOwnershipInput
  ): Promise<{ message: string }> {
    const response = await authInstance.post(`/places/${id}/transfer`, input);
    return (response.data as IApiResponse<{ message: string }>).data;
  }
}

export default PlacesService.getInstance();
