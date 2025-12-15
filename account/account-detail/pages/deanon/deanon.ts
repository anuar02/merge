import { Method } from '../../../../../deanon/deanon';

export interface DeanonInitPayload {
    accountId: string;
    deanonMethod: Method;
}

export interface SendToDeanonPayload {
    accountId?: string;
    search?: string;
    minTs?: string;
    maxTs?: string;
    ids?: string[];
    deanonMethod?: Method;
    sent?: boolean | null;
}

export interface SendToDeanonWithParamsPayload {
    accountId?: string;
    deanonMethod?: Method;
    callParams?: {
        eventTs: string;
        caller: string;
    }[];
    pingVpnParams?: {
        eventTs: string;
        pushDelete: boolean;
    }[]; 
}

export interface Call {
    id: string;
    eventTs: string;
    caller: string;
    sent: boolean;
    sentAt: string;
    accepted: boolean;
    acceptedAt: string;
}

export interface PingVpnTask {
    accountId: string;
    taskId: number;
    status: 'EXECUTING' | 'DONE' | 'FAILE';
    sent: boolean;
    sentAt: string;
    createdAt: string;
}

export interface AccountDeanonInfo {
    accountId: string;
    totalCount: number;
    sentCount: number;
    readyCount: number;
    minTs: string;
    maxTs: string;
    totalPhotos?: number;
}

export interface PingVpnTaskPayload {
    accountId: string;
    // botTaskId: string;
    startTime?: string;
    username: string;
    defaultInterval?: boolean;
    interval?: number;
    includedOther?: boolean;
}

export interface PingVpnNotificationPayload {
    accountId?: string;
    taskId?: string;
    sent?: boolean;
}

export interface PingVpnNotification {
    id: string;
    eventTs: string;
    pushDeleted: boolean;
    sent: boolean;
    sentAt: string;
    accepted: boolean;
    acceptedAt: string;
}

export interface Activity {
    id: string;
    refId: string;
    eventTs: string;
    contentType: string;
    activityType: string;
    sent: boolean;
    sentAt: boolean;
    accepted: true,
    acceptedAt: string;
}

export interface Photo {
    id: string;
    postId: string;
    section: 'GENERAL_INFO' | 'MEMBERS' | 'POSTS';
    path: string;
    createdAt: string;
}

export interface CropsPayload {
    refId?: string;
    sent?: boolean;
}

export interface IdentifiedFace {
    id: string;
    path: string;
}

export interface PhotoSentToDeanon {
    sentAt: string;
    refId: string;
    refPath: string;
    section: 'GENERAL_INFO' | 'MEMBERS' | 'POSTS';
    crops: string[];
    status?: string;
}