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
    // const response = await authInstance.post("/forum/posts", input);
    // return (response.data as IApiResponse<IForumPost>).data;

    const { mockForumPosts } = await import("@/utils/constants/mockData");

    const newPost: IForumPost = {
      id: `post-${Date.now()}`,
      title: input.title,
      content: input.content,
      contentSnippet: input.content.substring(0, 100) + "...",
      author: {
        id: "current-user",
        username: "You", // Mock current user
      },
      tags: (input.tags || []).map((t) => ({ id: `tag-${t}`, name: t })),
      createdAt: new Date().toISOString(),
      replyCount: 0,
      likeCount: 0,
      viewCount: 0,
      images: input.images || [],
      replies: [],
    };

    // Add to beginning of mock list
    mockForumPosts.unshift(newPost);

    return newPost;
  }

  async getPostById(id: string): Promise<IApiResponse<IForumPost> | null> {
    // const response = await commonInstance.get(`/forum/posts/${id}`);
    // return response.data as IApiResponse<IForumPost>;

    // Temporary mock implementation
    const { mockForumPosts } = await import("@/utils/constants/mockData");
    const post = mockForumPosts.find((p) => p.id === id);

    if (!post) {
      return null;
    }

    // Enrich post with mock data for detail view
    const enrichedPost: IForumPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      contentSnippet: post.contentSnippet,
      createdAt: post.createdAt,
      tags: post.tags,
      replies: post.replies,
      viewCount: Math.floor(Math.random() * 100000) + 1000,
      likeCount: Math.floor(Math.random() * 50000) + 500,
      author: {
        ...post.author,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`,
      },
      // Ensure images is defined
      images: post.images || [],
    };

    return {
      status: "success",
      data: enrichedPost,
    };
  }

  async updatePost(id: string, input: ICreatePostInput): Promise<IForumPost> {
    // Mock update
    const { mockForumPosts } = await import("@/utils/constants/mockData");
    const index = mockForumPosts.findIndex((p) => p.id === id);

    if (index === -1) throw new Error("Post not found");

    const existingPost = mockForumPosts[index];
    if (!existingPost) throw new Error("Post not found");

    const updatedPost: IForumPost = {
      id: existingPost.id,
      createdAt: existingPost.createdAt,
      replyCount: existingPost.replyCount,
      likeCount: existingPost.likeCount,
      viewCount: existingPost.viewCount,
      author: existingPost.author,
      images: existingPost.images,
      replies: existingPost.replies,
      title: input.title,
      content: input.content,
      contentSnippet: input.content.substring(0, 100) + "...",
      tags: (input.tags || []).map((t) => ({ id: `tag-${t}`, name: t })),
    };

    mockForumPosts[index] = updatedPost;
    return updatedPost;
  }

  async getReplies(
    postId: string,
    page: number = 1,
    limit: number = 5
  ): Promise<IPaginatedResponse<IForumReply[]>> {
    // const response = await commonInstance.get(`/forum/posts/${postId}/replies`, {
    //   params: { page, limit },
    // });
    // return response.data as IPaginatedResponse<IForumReply[]>;

    // Temporary mock implementation
    const { mockForumReplies } = await import("@/utils/constants/mockData");
    const allReplies = mockForumReplies[postId] || [];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReplies = allReplies.slice(startIndex, endIndex);

    return {
      status: "success",
      data: paginatedReplies,
      meta: {
        page,
        limit,
        totalItems: allReplies.length,
      },
    };
  }

  async replyToPost(
    _postId: string,
    input: ICreateReplyInput
  ): Promise<IForumReply> {
    // const response = await authInstance.post(
    //   `/forum/posts/${postId}/replies`,
    //   input
    // );
    // return (response.data as IApiResponse<IForumReply>).data;

    // Temporary mock - simulate creating a reply
    const newReply: IForumReply = {
      id: `reply-${Date.now()}`,
      content: input.content,
      user: {
        id: "current-user",
        username: "CurrentUser",
        avatarUrl:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
      },
      createdAt: new Date().toISOString(),
      parentReplyId: input.parentReplyId,
      likeCount: 0,
    };

    return newReply;
  }

  async reportContent(
    input: ICreateReportInput
  ): Promise<{ success: boolean; message: string }> {
    // const response = await authInstance.post("/reports", input);
    // return response.data;

    // Temporary mock - simulate report submission
    console.log("Report submitted:", input);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    return {
      success: true,
      message: "Thank you for your report. Our team will review it shortly.",
    };
  }

  async incrementViewCount(postId: string): Promise<void> {
    // await commonInstance.post(`/forum/posts/${postId}/view`);

    // Mock - just log for now
    console.log(`View count incremented for post: ${postId}`);
  }
}

export default ForumService.getInstance();
