import { CollectStatus } from '../../base/utils/collect-status-map';

export type CollectionType = 'GROUP' | 'ACCOUNT' | 'BOT';

export interface CollectionPayload {
    search?: string;
    platforms?: string[];
    collectionType?: CollectionType;
    folderId?: string;
    subject?: {
        subjectId: string;
        subjectType: CollectionType;
    };
}

export interface CollectionEntity {
    // Common fields
    id: string;
    name: string;
    collectionType: CollectionType;
    source: string;
    sourceType: string;
    platform: string;
    searchParamType: string;
    searchValue: string;

    // Monitoring & collection
    monitor: boolean;
    monitoringType?: string;
    collectStatus: CollectStatus;

    // Content metadata
    contentTopic?: string;
    contentTag?: string;
    tonality?: string;

    // Dates
    createdAt: string;
    lastCollectedAt: string;
    firstCollectedAt?: string;

    // Counts
    postCount: number;
    groupCount?: number;
    subscriberCount?: number;
    memberCount?: number;

    // User info
    createdBy: number;
    global: boolean;
    note?: string;
    accountCount?: string;
    botCount?: string;
    chatCount?: string;

    // Deanon
    deanonRequestId?: string;

    // Display fields
    photo: string;
    username?: string;
    url?: string;
    title?: string;
    accountId?: string;
    groupName?: string;

    // Folder
    folderId?: string;
    isFavorite?: boolean;

    // Type-specific fields
    groupType?: string;
    privacy?: boolean;
    verified?: boolean;
    description?: string;

    // Bot-specific
    botType?: 'CHANNEL' | 'CHAT' | 'USER';
    botStatus?: 'ACTIVE' | 'INACTIVE';

    regularPeriod?: RegularPeriod;
}

export interface RegularPeriod {
    start: string;
    end: string;
}

// Type guards for better type safety
export function isGroupEntity(entity: CollectionEntity): boolean {
    return entity.collectionType === 'GROUP';
}

export function isAccountEntity(entity: CollectionEntity): boolean {
    return entity.collectionType === 'ACCOUNT';
}

export function isBotEntity(entity: CollectionEntity): boolean {
    return entity.collectionType === 'BOT';
}
