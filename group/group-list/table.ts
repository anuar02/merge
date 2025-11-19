import { Column } from '../../../../shared/components/data-table/components/table/table';

export const columns: Column[] = [
    {
        key: 'name',
        label: 'common.name',
        type: 'account',
        data: {
            imgUrl: 'assets/img/misc/person-avatar.png',
            imgSize: 'lg',
            username: 'profileName',
            url: 'profileUrl',
            id: 'profileId',
            platform: 'platform'
        },
        sticky: true
    } as Column,
    {
        key: 'actions',
        label: 'common.actions',
        type: 'buttons',
        style: 'width: 5.625rem',
        data: {
            buttons: [
                // {
                //     icon: 'icon-dots-vertical',
                //     action: ((row: any, event: MouseEvent) => {
                //         if (event) {
                //             event.stopPropagation();
                //             console.log('event btn', event)
                //         }
                //         console.log(row);
                //     }),
                // },
            ]
        }
    } as Column
]