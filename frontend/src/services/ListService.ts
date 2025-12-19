// Temporarily done for refactoring api calls and error handling
import { authInstance } from "@/config";
import type {
  ISavedListDetailedSchema,
  ISavedListSchema,
  ISavedListCreate,
  IAddPlaceToListRequest,
  IApiResponse,
  IPaginatedResponse,
  IMessage,
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

  async getLists(): Promise<IPaginatedResponse<ISavedListSchema[]>> {
    const response = await authInstance.get("/lists");
    return response.data as IPaginatedResponse<ISavedListSchema[]>;
  }

  async createList(input: ISavedListCreate): Promise<ISavedListSchema> {
    const response = await authInstance.post("/lists", input);
    return (response.data as IApiResponse<ISavedListSchema>).data;
  }

  async getListById(id: string): Promise<IPaginatedResponse<ISavedListDetailedSchema>> {
    try {
      const response = await authInstance.get(`/lists/${id}`);
      return response.data as IPaginatedResponse<ISavedListDetailedSchema>;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async addPlaceToList(
    listId: string,
    input: IAddPlaceToListRequest
  ): Promise<{ message: string }> {
    try {
      const response = await authInstance.post(`/lists/${listId}/places`, input);
      return (response.data as IApiResponse<{ message: string }>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }

  async removePlaceFromList(
    listId: string,
    placeId: string
  ): Promise<{ message: string }> {
    try {
    const response = await authInstance.delete(
      `/lists/${listId}/places/${placeId}`
    );
    return (response.data as IApiResponse<IMessage>).data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("Access Forbidden: ", error.response.data.detail);
        // Handle specific logic here (e.g., redirect to home, show a toast)
      }
      throw error; // Re-throw so the calling component knows the request failed
    }
  }
}

export default ListService.getInstance();
