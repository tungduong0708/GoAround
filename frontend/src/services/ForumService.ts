// TODO: WIP
// Imports removed
import type {
  IForumPost,
  IForumReply,
  ICreatePostInput,
  ICreateReplyInput,
  ICreateReportInput,
  IForumSearchQuery,
  IApiResponse,
  IPaginatedResponse,
} from "@/utils/interfaces";

import { authInstance, commonInstance } from "@/config";

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
    query?: IForumSearchQuery,
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

  async getPostById(id: string): Promise<IApiResponse<IForumPost> | null> {
    const response = await commonInstance.get(`/forum/posts/${id}`);
    return response.data as IApiResponse<IForumPost>;
  }

  async updatePost(id: string, input: ICreatePostInput): Promise<IForumPost> {
    const response = await authInstance.put(`/forum/posts/${id}`, input);
    return (response.data as IApiResponse<IForumPost>).data;
  }

  async getReplies(
    postId: string,
    page: number = 1,
    limit: number = 5,
  ): Promise<IPaginatedResponse<IForumReply[]>> {
    const response = await commonInstance.get(
      `/forum/posts/${postId}/replies`,
      {
        params: { page, limit },
      },
    );
    return response.data as IPaginatedResponse<IForumReply[]>;
  }

  async replyToPost(
    postId: string,
    input: ICreateReplyInput,
  ): Promise<IForumReply> {
    const response = await authInstance.post(
      `/forum/posts/${postId}/replies`,
      input,
    );
    return (response.data as IApiResponse<IForumReply>).data;
  }

  async reportContent(
    input: ICreateReportInput,
  ): Promise<{ success: boolean; message: string }> {
    const response = await authInstance.post("/reports", input);
    return response.data;
  }

  async incrementViewCount(postId: string): Promise<void> {
    await commonInstance.post(`/forum/posts/${postId}/view`);
  }
}

export default ForumService.getInstance();
