import type { ITag } from "./IPlace";

export interface IForumUser {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface IForumReply {
  id: string;
  content: string;
  user: IForumUser;
  created_at: string;
  parent_reply_id?: string;
  like_count?: number;
}

export interface IForumPost {
  id: string;
  title: string;
  content_snippet?: string; // For list view
  content?: string; // For detail view
  author: IForumUser;
  tags: ITag[];
  reply_count?: number;
  view_count?: number;
  like_count?: number;
  created_at: string;
  images?: string[];
  replies?: IForumReply[];
}
