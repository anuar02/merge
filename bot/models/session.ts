import { Column } from "../../../../shared/components/data-table/components/table/table";

export interface Session {
    id: string;
    status: string;
    botId: string;
    inUse: boolean;
    active: boolean;
    lockToken: string;
    createdAt: string;
    updatedAt: string;
}

export const columns: Column[] = [
    // {  
    //     key: 'updatedAt',
    //     label: 'common.lastChange',
    //     type: 'date',
    //     style: 'width: 10rem',
    //     data: {
    //         dateHasIcon: false,
    //         withSeconds: true,
    //         highlightSeconds: true,
    //     } 
    // },
    {  
        key: 'createdAt',
        label: 'bots.created',
        type: 'date',
        style: 'width: 10rem',
        data: {
            dateHasIcon: false,
            withSeconds: true,
            highlightSeconds: true,
        } 
    },
    {  
        key: 'status',
        label: 'common.status',
        type: 'session-auth-badge',
        style: 'width: 10rem' 
    },
    // {  
    //     key: 'active',
    //     label: 'common.status',
    //     type: 'boolean-status',
    //     style: 'width: 12rem',
    //     data: {
    //         gender: 'feminine'
    //     }
    // },
    {  
        key: 'inUse',
        label: 'bots.sign',
        type: 'collection-badge',
        style: 'width: 10rem' 
    }
];