import type { ITag } from "./IPlace";

export interface IForumUser {
  id: string;
  username: string;
}

export interface IForumReply {
  id: string;
  content: string;
  user: IForumUser;
  createdAt: string;
}

export interface IForumPost {
  id: string;
  title: string;
  contentSnippet?: string; // For list view
  content?: string; // For detail view
  author: IForumUser;
  tags: ITag[];
  replyCount?: number;
  createdAt: string;
  images?: string[];
  replies?: IForumReply[];
}
