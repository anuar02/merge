import {CollectStatus} from '../../base/utils/collect-status-map';

export interface AccountPayload {
    search?: string;
    platforms?: string[];
    subject?: {
        subjectId: string;
        subjectType: 'ACCOUNT' | 'GROUP',
    };
}

export interface AccountEntity {
    id: string
    source: string;
    sourceType: string
    platform: string
    searchParamType: string
    searchValue: string
    contentTopic: string
    contentTag: string
    tonality: string
    monitor: boolean
    monitoringType: string
    regularPriod: RegularPriod
    global: boolean
    note: string
    createdAt: string
    lastCollectedAt: string
    postCount: number
    groupCount: number
    createdBy: number
    deanonRequestId: string
    photo: string;
    username: string;
    url: string;
    title: string;
    accountId: string;
    collectStatus: CollectStatus;
    firstCollectedAt?: string;
    verified?: boolean;
    additionMethod?: any;

    subscriberCount?: number;
    botCount?: string;
    memberCount?: number;
    groupName?: string;
}

export interface RegularPriod {
    start: string
    end: string
}
