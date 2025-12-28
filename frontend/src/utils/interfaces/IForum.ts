export interface IForumAuthorSchema {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
}
export interface IForumTagSchema {
  id: string;
  name: string;
}
export interface IForumCommentUserSchema {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
}
export interface IForumCommentSchema {
  id: string;
  content: string;
  user: IForumCommentUserSchema;
  created_at: string;
  parent_id?: string | null;
  like_count?: number;
  is_liked?: boolean;
}

export interface IForumReplyCreate {
  content: string;
  parent_reply_id?: string | null;
}

export interface IForumReplyUpdate {
  content: string;
}
// Deprecated, using IForumCommentSchema
// export interface IForumReply {
//   id: string;
//   content: string;
//   user: IForumUser;
//   created_at: string;
//   parent_reply_id?: string;
//   like_count?: number;
// }

export interface IForumPostImageSchema {
  id: string;
  image_url: string;
}

export interface IForumPostListItem {
  id: string;
  title: string;
  content_snippet: string; // For list view
  author: IForumAuthorSchema;
  tags: IForumTagSchema[];
  images?: IForumPostImageSchema[];
  reply_count?: number;
  like_count?: number;
  view_count?: number;
  created_at: string;
  is_liked?: boolean;
}

export interface IForumPostDetail {
  id: string;
  title: string;
  content: string;
  author: IForumAuthorSchema;
  images?: IForumPostImageSchema[];
  tags?: IForumTagSchema[];
  replies?: IForumCommentSchema[];
  reply_count?: number;
  like_count?: number;
  view_count?: number;
  created_at: string;
  is_liked?: boolean;
}

export interface IForumPostCreate {
  title: string;
  content: string;
  tags?: string[];
  images?: string[];
}

export interface IForumPostUpdate {
  title?: string | null;
  content?: string | null;
  tags?: string[] | null;
  images?: string[] | null;
}
