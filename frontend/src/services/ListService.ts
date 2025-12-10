import { authInstance } from "@/config";
import type {
  ISavedList,
  ICreateListInput,
  IAddPlaceToListInput,
  IApiResponse,
  IPaginatedResponse,
} from "@/utils/interfaces";

class ListService {
  private static instance: ListService;
  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ListService {
    if (!ListService.instance) {
      ListService.instance = new ListService();
    }
    return ListService.instance;
  }

  async getLists(): Promise<IPaginatedResponse<ISavedList[]>> {
    const response = await authInstance.get("/lists");
    return response.data as IPaginatedResponse<ISavedList[]>;
  }

  async createList(input: ICreateListInput): Promise<ISavedList> {
    const response = await authInstance.post("/lists", input);
    return (response.data as IApiResponse<ISavedList>).data;
  }

  async getListById(id: string): Promise<IPaginatedResponse<ISavedList>> {
    const response = await authInstance.get(`/lists/${id}`);
    return response.data as IPaginatedResponse<ISavedList>;
  }

  async addPlaceToList(
    listId: string,
    input: IAddPlaceToListInput
  ): Promise<{ message: string }> {
    const response = await authInstance.post(`/lists/${listId}/places`, input);
    return (response.data as IApiResponse<{ message: string }>).data;
  }

  async removePlaceFromList(
    listId: string,
    placeId: string
  ): Promise<{ message: string }> {
    const response = await authInstance.delete(
      `/lists/${listId}/places/${placeId}`
    );
    return (response.data as IApiResponse<{ message: string }>).data;
  }
}

export default ListService.getInstance();
