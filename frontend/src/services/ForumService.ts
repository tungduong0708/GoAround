import type {
  IApiResponse,
  IPaginatedResponse,
  IMessage,
  IContentReportCreate,
} from "@/utils/interfaces";

import { authInstance, commonInstance } from "@/config";
import type {
  IForumSearchQuery,
  IForumPostCreate,
  IForumPostDetail,
  IForumPostListItem,
  IForumPostUpdate,
  IForumReplyCreate,
  IForumCommentSchema,
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
    query?: IForumSearchQuery,
  ): Promise<IPaginatedResponse<IForumPostListItem[]>> {
    try {
      const response = await commonInstance.get("/forum/posts", {
        params: query,
      });
      return response.data as IPaginatedResponse<IForumPostListItem[]>;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  async getPostById(id: string): Promise<IApiResponse<IForumPostDetail>> {
    try {
      const response = await commonInstance.get(`/forum/posts/${id}`);
      return response.data as IApiResponse<IForumPostDetail>;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }
  async createPost(input: IForumPostCreate): Promise<IForumPostDetail> {
    try {
      const response = await authInstance.post("/forum/posts", input);
      return (response.data as IApiResponse<IForumPostDetail>).data;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }
  async updatePost(
    id: string,
    input: IForumPostUpdate,
  ): Promise<IForumPostDetail> {
    try {
      const response = await authInstance.put(`/forum/posts/${id}`, input);
      return (response.data as IApiResponse<IForumPostDetail>).data;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<IMessage> {
    try {
      const response = await authInstance.delete(`/forum/posts/${id}`);
      return (response.data as IApiResponse<IMessage>).data;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  async createReply(
    id: string,
    input: IForumReplyCreate,
  ): Promise<IForumCommentSchema> {
    try {
      const response = await authInstance.post(
        `/forum/posts/${id}/replies`,
        input,
      );
      return (response.data as IApiResponse<IForumCommentSchema>).data;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }
  async reportPost(id: string, input: IContentReportCreate): Promise<IMessage> {
    try {
      const response = await authInstance.post(
        `/forum/posts/${id}/report`,
        input,
      );
      return (response.data as IApiResponse<IMessage>).data;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }
  async reportReply(post_id: string, reply_id: string, input: IContentReportCreate): Promise<IMessage> {
    try {
      const response = await authInstance.post(
        `/forum/posts/${post_id}/replies/${reply_id}/report`,
        input,
      );
      return (response.data as IApiResponse<IMessage>).data;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }
}

export default ForumService.getInstance();
