import { authInstance, commonInstance } from "@/config";
import type {
  IForumPost,
  IForumReply,
  ICreatePostInput,
  ICreateReplyInput,
  IForumSearchQuery,
  IApiResponse,
  IPaginatedResponse,
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

  async getPosts(
    query?: IForumSearchQuery
  ): Promise<IPaginatedResponse<IForumPost[]>> {
    const response = await commonInstance.get("/forum/posts", {
      params: query,
    });
    return response.data as IPaginatedResponse<IForumPost[]>;
  }

  async createPost(input: ICreatePostInput): Promise<IForumPost> {
    const response = await authInstance.post("/forum/posts", input);
    return (response.data as IApiResponse<IForumPost>).data;
  }

  async getPostById(id: string): Promise<IPaginatedResponse<IForumPost>> {
    const response = await commonInstance.get(`/forum/posts/${id}`);
    return response.data as IPaginatedResponse<IForumPost>;
  }

  async replyToPost(
    postId: string,
    input: ICreateReplyInput
  ): Promise<IForumReply> {
    const response = await authInstance.post(
      `/forum/posts/${postId}/replies`,
      input
    );
    return (response.data as IApiResponse<IForumReply>).data;
  }
}

export default ForumService.getInstance();
