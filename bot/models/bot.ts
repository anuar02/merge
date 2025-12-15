import { Column } from "../../../../shared/components/data-table/components/table/table";

export type Platform = 'INSTAGRAM' | 'WHATSAPP' | 'FACEBOOK' | 'TELEGRAM' | 'VK' | 'YOUTUBE' | 'TIKTOK';

export interface BotFilterPayload {
    createdAt?: {
        start: string;
        end: string;
    };
    groupCount?: {
        start: number;
        end: number;
    };
    totalSessionCount?: {
        start: number;
        end: number;
    };
    activeSessionCount?: {
        start: number;
        end: number;
    };
    inactiveSessionCount?: {
        start: number;
        end: number;
    };
    active?: boolean;
    search?: string;
}

export interface Bot {
    id: string;
    name: string;
    phone: string;
    platform: Platform;
    active: boolean;
    totalSessionCount: number;
    activeSessionCount: number;
    inactiveSessionCount: number;
    groupCount: number;
    createdAt: string;
    lastCrwDate: string;
}

export interface GrabGroupPayload {
    sessionId?: string;
}

export const columns: Column[] = [
    {  
        key: 'name',
        label: 'bots.botName',
        type: 'default',
        style: 'width: 10rem' 
    },
    {  
        key: 'phone',
        label: 'common.phoneNumber',
        type: 'default',
        style: 'width: 10rem' 
    },
    {  
        key: 'platform',
        label: 'common.platform',
        type: 'platform-badge',
        style: 'width: 10rem' 
    },
    {  
        key: 'active',
        label: 'bots.botStatus',
        type: 'boolean-status',
        style: 'width: 10rem' 
    },
    {  
        key: 'createdAt',
        label: 'status.created',
        type: 'date',
        style: 'width: 12rem',
        data: {
            dateHasIcon: false,
            withSeconds: true,
            highlightSeconds: true,
        }
    },
    {  
        key: 'groupCount',
        label: 'bots.groupsCount',
        type: 'default',
        style: 'width: 10rem' 
    },
    {  
        key: 'totalSessionCount',
        label: 'bots.sessionsCount',
        type: 'default',
        style: 'width: 12rem' 
    },
    {  
        key: 'activeSessionCount',
        label: 'bots.activeSessionsCount',
        type: 'default',
        style: 'width: 12rem' 
    },
    {  
        key: 'inactiveSessionCount',
        label: 'bots.inactiveSessionsCount',
        type: 'default',
        style: 'width: 12rem' 
    },
];