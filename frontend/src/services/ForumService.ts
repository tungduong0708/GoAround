import { authInstance, commonInstance } from "@/config";
import type {
  IForumPost,
  IForumReply,
  ICreatePostInput,
  ICreateReplyInput,
  IForumSearchQuery,
} from "@/utils/interfaces";

class ForumService {
  private static instance: ForumService;
  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ForumService {
    if (!ForumService.instance) {
      ForumService.instance = new ForumService();
    }
    return ForumService.instance;
  }

  async getPosts(query?: IForumSearchQuery): Promise<IForumPost[]> {
    try {
      const response = await commonInstance.get("/forum/posts", {
        params: query,
      });
      return response.data as IForumPost[];
    } catch (error: any) {
      throw error.response?.data || { message: error.message };
    }
  }

  async createPost(input: ICreatePostInput): Promise<IForumPost> {
    try {
      const response = await authInstance.post("/forum/posts", input);
      return response.data as IForumPost;
    } catch (error: any) {
      throw error.response?.data || { message: error.message };
    }
  }

  async getPostById(id: string): Promise<IForumPost> {
    try {
      const response = await commonInstance.get(`/forum/posts/${id}`);
      return response.data as IForumPost;
    } catch (error: any) {
      throw error.response?.data || { message: error.message };
    }
  }

  async replyToPost(
    postId: string,
    input: ICreateReplyInput
  ): Promise<IForumReply> {
    try {
      const response = await authInstance.post(
        `/forum/posts/${postId}/replies`,
        input
      );
      return response.data as IForumReply;
    } catch (error: any) {
      throw error.response?.data || { message: error.message };
    }
  }
}

export default ForumService.getInstance();
