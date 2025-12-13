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
    // const response = await commonInstance.get("/forum/posts", {
    //   params: query,
    // });
    // return response.data as IPaginatedResponse<IForumPost[]>;
    // Temporary mock
    const { mockForumPosts } = await import("@/utils/constants/mockData");

    let filtered = mockForumPosts;

    if (query?.q) {
      const lowerQ = query.q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQ) ||
          p.contentSnippet?.toLowerCase().includes(lowerQ) ||
          p.tags.some((t) => t.name.toLowerCase().includes(lowerQ))
      );
    }

    if (query?.tag) {
      const lowerTag = query.tag.toLowerCase();
      filtered = filtered.filter((p) =>
        p.tags.some((t) => t.name.toLowerCase() === lowerTag)
      );
    }

    if (query?.tags && query.tags.length > 0) {
      // Filter posts that have AT LEAST ONE of the selected tags (OR logic)
      // If you want AND logic (post must have ALL selected tags), change .some to .every
      const lowerTags = query.tags.map((t) => t.toLowerCase());
      filtered = filtered.filter((p) =>
        p.tags.some((t) => lowerTags.includes(t.name.toLowerCase()))
      );
    }

    // sort handling
    if (query?.sort === "Newest") {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (query?.sort === "Most Replies") {
      filtered = [...filtered].sort(
        (a, b) => (b.replyCount || 0) - (a.replyCount || 0)
      );
    } else if (query?.sort === "Popular") {
      // Popular = Replies + (Views/1000) for mock
      // Since we don't have views in IForumPost interface widely used yet (it was just in the card mock),
      // let's stick to replies for now but maybe weight recent ones higher?
      // For simplicity in mock: Popular == Most Replies for now, or maybe random seed?
      // Let's make it distinct by also checking ID or just same as replies.
      filtered = [...filtered].sort(
        (a, b) => (b.replyCount || 0) - (a.replyCount || 0)
      );
    }

    // Pagination Logic
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filtered.slice(startIndex, endIndex);

    return {
      status: "success",
      data: paginatedItems,
      meta: {
        page: page,
        limit: limit,
        totalItems: filtered.length,
      },
    };
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
