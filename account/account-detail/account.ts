import {Media} from "../../group/models/group.entity";

export interface AccountGeneralInfo {
  id: string;
  username: string;
  url: string;
  private: boolean;
  verified: boolean;
  publications: number;
  subscribers: number;
  groupType: string;
  createdAt: string;
  lastCollectedAt: string;
  link: string;
  tags: string[];
  description: string;
}

export interface AccountNote {
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterPostsPayload {
  subject?: {
    subjectId: string;
    subjectType: 'GROUP' | 'ACCOUNT';
  };
  search?: string;
}

export interface Post {
  postId: string;
  text: string;
  createdAt: string;
  commentsCount: number;
  repliesCount: number;
  repostsCount: number;
  likesCount: number;
  dislikesCount: number;
  viewsCount: number;
  deleted: boolean;
  attachPaths: string[];
  username: string;
  imgUrls: Media[],
  videoUrls: Media[],
  audioUrls: Media[],
  fileUrls: string[],
}
