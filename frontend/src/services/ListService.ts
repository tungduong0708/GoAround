import { authInstance } from "@/config";
import type {
    ISavedList,
    ICreateListInput,
    IAddPlaceToListInput
} from "@/utils/interfaces";

class ListService {
    private static instance: ListService;
    private constructor() { }

    public static getInstance(): ListService {
        if (!ListService.instance) {
            ListService.instance = new ListService();
        }
        return ListService.instance;
    }

    async getLists(): Promise<ISavedList[]> {
        try {
            const response = await authInstance.get('/lists');
            return response.data as ISavedList[];
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async createList(input: ICreateListInput): Promise<ISavedList> {
        try {
            const response = await authInstance.post('/lists', input);
            return response.data as ISavedList;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async getListById(id: string): Promise<ISavedList> {
        try {
            const response = await authInstance.get(`/lists/${id}`);
            return response.data as ISavedList;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async addPlaceToList(listId: string, input: IAddPlaceToListInput): Promise<{ message: string }> {
        try {
            const response = await authInstance.post(`/lists/${listId}/places`, input);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }

    async removePlaceFromList(listId: string, placeId: string): Promise<{ message: string }> {
        try {
            const response = await authInstance.delete(`/lists/${listId}/places/${placeId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
}

export default ListService.getInstance();
