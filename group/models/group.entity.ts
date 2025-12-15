// probable shared types
import { CollectStatus } from '../../base/utils/collect-status-map';

type Source = 'PUBLIC_SOURCE' | 'PRIVATE_SOURCE';
type SourceType = 'MESSENGER' | 'SOCIAL_NETWORK';
type Platform = 'INSTAGRAM' | 'WHATSAPP' | 'FACEBOOK' | 'TELEGRAM' | 'VK' | 'YOUTUBE' | 'TIKTOK';
type SearchParamType = 'SCREEN_NAME' | 'URL' | 'ID';
type ContentTopic = 'DEVIANT' | 'CRIME' | 'INTER_ETHNIC' | 'EXTREMISM' | 'NOT_DEFINED';
type Tonality = 'NEUTRAL' | 'MODERATE' | 'AGGRESSIVE';
type MonitoringType = 'ONE_TIME' | 'REGULAR';
type PrivacyType = 'PUBLIC' | 'PRIVATE';
type GroupType = 'CHANNEL' | 'GROUP';

export interface GroupEntity {
    id: string;
    source: Source;
    sourceType: SourceType;
    platform: Platform;
    searchParamType: SearchParamType;
    searchValue: string;
    contentTopic: ContentTopic;
    contentTag: string;
    tonality: Tonality;
    monitor: boolean;
    monitoringType: MonitoringType;
    regularPriod: RegularPeriod;
    global: boolean;
    note: string;
    createdAt: string;
    createdBy: number;
    postCount: number;
    subscriberCount: number;
    photo: string;
    title: string;
    username: string;
    url: string;
    collectStatus: CollectStatus;
    lastCollectedAt: string;
    firstCollectedAt: string;
    commentCount: number;
    groupCount?: number;
    verified: boolean;
    privacyType: PrivacyType;
    groupName: string;
    groupType: GroupType;
    additionMethod: string;
    statusModifiedAt: string;
    botCount?: number
}

interface RegularPeriod {
  start: string;
  end: string;
}

export interface Post {
  postId: string,
  text: string,
  createdAt: string,
  commentsCount: number,
  repliesCount: number,
  repostsCount: number,
  likesCount: number,
  dislikesCount: number,
  viewsCount: number,
  deleted: boolean,
  attachPaths: string[],
  username: string,
  actualMediaPath: string[],
  imgUrls: Media[],
  videoUrls: Media[],
  audioUrls: Media[],
  fileUrls: string[],
}

export interface Media {
  url: string, type: string, mediaType: string
}

export interface GetPostsPayload {
  subject: {
    subjectId: string;
    subjectType: 'GROUP' | 'ACCOUNT';
  };
  search?: string;
}

export interface MediaType {
  mediaType: string;
  extensions: string[];
}
