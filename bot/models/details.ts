import { Column } from "../../../../shared/components/data-table/components/table/table";

export interface GetGroupsPayload {
    accountId?: string;
    search?: string;
    subscriberCount?: {
        start: number;
        end: number;
    },
    botCount?: {
        start: number;
        end: number;
    },
    monitor?: boolean;
}

export const columns: Column[] = [
    {  
        key: 'groupName',
        label: 'bots.groupName',
        type: 'default',
        style: 'width: 14rem' 
    },
    {  
        key: 'username',
        label: 'Username',
        type: 'default',
        style: 'width: 10rem' 
    },
    {  
        key: 'id',
        label: 'ID',
        type: 'default',
        style: 'width: 10rem' 
    },
    {  
        key: 'url',
        label: 'bots.link',
        type: 'default',
        style: 'width: 14rem' 
    },
    {  
        key: 'platform',
        label: 'common.platform',
        type: 'platform-badge',
        style: 'width: 10rem' 
    },
    {  
        key: 'subscriberCount',
        label: 'bots.membersCount',
        type: 'default',
        style: 'width: 10rem' 
    },
    {  
        key: 'postCount',
        label: 'bots.publicationsCount',
        type: 'default',
        style: 'width: 10rem' 
    },
    {  
        key: 'botCount',
        label: 'bots.botsCount',
        type: 'default',
        style: 'width: 10rem' 
    }
];