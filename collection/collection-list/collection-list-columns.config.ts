import { TableColumn } from "../../../../shared/components-new/table/table";
import { BadgeInput, Color } from "../../../../shared/components-new/badge/badge";
import { DatePipe } from "@angular/common";

export class CollectionListColumnsConfig {

    constructor(
        private datePipe: DatePipe,
        private getPhotoUrl: (photo: string, type: any) => string,
        private getItemTags: (item: any) => string[],
        private enableMonitoring: (id: string) => void,
        private disableMonitoring: (id: string) => void,
        private isOnline: boolean
    ) {}

    getGroupsColumns(): TableColumn[] {
        return [
            {
                key: 'name',
                label: 'common.name',
                type: 'avatar',
                sticky: true,
                style: { 'width': '20rem' },
                sort: { key: 'groupName', order: 'asc' },
                hoverable: () => true,
                processValue: (item: any) => item.groupName || item.title || '-',
                processImages: (item: any) => {
                    if (!item.photo) return ['assets/img/misc/default-avatar.png'];
                    return [item.photo];
                },
                processSubValue: (item: any) => {
                    if (item.url) {
                        const match = item.url.match(/t\.me\/([^/?]+)/);
                        return match ? `@${match[1]}` : '';
                    }
                    return '';
                },
                processPopover: (item: any) => {
                    if (item.verified) {
                        return {
                            text: 'common.verified',
                            type: 'success',
                            icon: 'icon-check',
                        };
                    }
                    return null;
                },
            },
            {
                key: 'collectStatus',
                label: 'groups.collectStatus',
                type: 'default',
                style: { 'width': '15rem' },
                sort: { key: 'collectStatus', order: 'desc' },
                processBadgeValues: (item: any): BadgeInput[] => {
                    const statusMap: Record<string, { text: string, iconColor: Color }> = {
                        'FINISHED': {
                            text: 'Сбор завершен',
                            iconColor: 'success',
                        },
                        'IN_PROGRESS': {
                            text: 'Идет сбор',
                            iconColor: 'blue-dark',
                        },
                        'ERROR': {
                            text: 'Ошибка сбора',
                            iconColor: 'error',
                        },
                        'PENDING': {
                            text: 'Ожидание',
                            iconColor: 'warning',
                        },
                    };

                    const status = statusMap[item.collectStatus] || {
                        text: item.collectStatus || '-',
                        iconColor: 'default' as Color,
                    };

                    return [{
                        text: status.text,
                        color: 'default',
                        icon: 'icon-dot',
                        iconType: 'sm',
                        iconColor: status.iconColor,
                    }];
                }
            },
            {
                key: 'monitor',
                label: 'accounts.onMonitoring',
                type: 'default',
                style: { 'width': '12rem' },
                sort: { key: 'monitor', order: 'desc' },
                processBadgeValues: (item: any): BadgeInput[] => {
                    if (!item.monitor) {
                        return [{
                            text: 'Нет',
                            color: 'default',
                        }];
                    }
                    return [{
                        text: 'Да',
                        icon: 'icon-eye',
                        iconColor: 'success',
                        iconType: 'lg',
                        popover: item.monitoringType ? (row: any) => ({
                            text: 'accounts.monitoringActive',
                            parts: [
                                {
                                    label: 'common.type',
                                    value: row.monitoringType,
                                },
                                ...(row.regularPriod?.start ? [{
                                    label: 'common.start_date',
                                    value: this.datePipe.transform(row.regularPriod.start, 'dd.MM.yyyy HH:mm') || '',
                                }] : []),
                                ...(row.regularPriod?.end ? [{
                                    label: 'common.end_date',
                                    value: this.datePipe.transform(row.regularPriod.end, 'dd.MM.yyyy HH:mm') || '',
                                }] : []),
                            ],
                        }) : undefined,
                    }];
                }
            },
            {
                key: 'tags',
                label: 'common.tag',
                type: 'default',
                style: { 'width': '8rem' },
                sort: { key: 'contentTag', order: 'desc' },
                badgeLimitCount: (item: any) => {
                    const tags = this.getItemTags(item);
                    if (!tags || tags.length === 0) return 0;

                    let result = 0;
                    let maxChars = 20;
                    tags.forEach((tag: string) => {
                        maxChars = maxChars - tag.length;
                        if (maxChars > 0) result++;
                    });
                    return result;
                },
                processBadgeValues: (item: any): BadgeInput[] => {
                    const tags = this.getItemTags(item);
                    if (!tags || tags.length === 0) {
                        return [];
                    }

                    return tags.map((tag: string) => ({
                        text: tag,
                        color: 'default' as Color,
                        clickable: false,
                        removable: false,
                    }));
                }
            },
            {
                key: 'subscriberCount',
                label: 'groups.members',
                type: 'default',
                style: { 'width': '8rem' },
                sort: { key: 'subscriberCount', order: 'desc' },
                processValue: (item: any) => {
                    if (item.subscriberCount === null || item.subscriberCount === undefined) {
                        return '-';
                    }
                    return item.subscriberCount.toString();
                },
            },
            {
                key: 'postCount',
                label: 'accounts.publicationsCount',
                type: 'default',
                style: { 'width': '8rem' },
                sort: { key: 'postCount', order: 'desc' },
                processValue: (item: any) => {
                    if (item.postCount === null || item.postCount === undefined) {
                        return '-';
                    }
                    return item.postCount.toString();
                },
            },
            {
                key: 'botsCount',
                label: 'groups.avatars',
                type: 'default',
                style: { 'width': '8rem' },
                sort: { key: 'botsCount', order: 'desc' },
                processValue: (item: any) => {
                    if (item.botsCount === null || item.botsCount === undefined) {
                        return '-';
                    }
                    return item.botsCount.toString();
                },
            },
            {
                key: 'lastCollectedAt', label: 'accounts.lastCollectedAt', type: 'date', style: { 'width': '12rem' },
                sort: { key: 'lastTs', order: 'desc' },
            },
            // {
            //     key: 'lastCollectedAt', label: 'accounts.lastPostTs', type: 'date', style: { 'width': '12rem' },
            //     sort: { key: 'lastTs', order: 'desc' },
            // },
            {
                key: 'actions',
                label: 'common.actions',
                type: 'default',
                stickyRight: true,
                style: { 'width': '8rem' },
                actions: [
                    {
                        key: 'refresh',
                        icon: 'icon-info-circle',
                        class: 'button--secondary-gray',
                        clicked: (item: any) => {
                            console.log('Refresh collection:', item.id);
                        },
                    }
                ],
                dropdownActions: [
                    {
                        label: 'button.enableMonitoring',
                        icon: 'icon-eye',
                        value: 'action.enable_monitoring',
                        onClick: (item: any) => this.enableMonitoring(item.id),
                        isHideOption: (item: any) => item.monitor || !this.isOnline,
                    },
                    {
                        label: 'button.disableMonitoring',
                        icon: 'icon-eye-off',
                        value: 'action.disable_monitoring',
                        onClick: (item: any) => this.disableMonitoring(item.id),
                        isHideOption: (item: any) => !item.monitor || !this.isOnline,
                    },
                    {
                        label: 'button.edit',
                        icon: 'icon-edit',
                        value: 'action.edit',
                        onClick: (item: any) => {
                            console.log('Edit collection:', item.id);
                        },
                    },
                    {
                        label: 'button.delete',
                        icon: 'icon-trash',
                        value: 'action.delete',
                        onClick: (item: any) => {
                            console.log('Delete collection:', item.id);
                        },
                    },
                ]
            }
        ];
    }

    getAccountsColumns(): TableColumn[] {
        return [
            {
                key: 'name',
                label: 'common.name',
                type: 'avatar',
                sticky: true,
                style: { 'width': '20rem' },
                sort: { key: 'groupName', order: 'asc' },
                hoverable: () => true,
                processValue: (item: any) => item.groupName || item.title || '-',
                processImages: (item: any) => {
                    if (!item.photo) return ['assets/img/misc/default-avatar.png'];
                    return [item.photo];
                },
                processSubValue: (item: any) => {
                    if (item.url) {
                        const match = item.url.match(/t\.me\/([^/?]+)/);
                        return match ? `@${match[1]}` : '';
                    }
                    return '';
                },
                processPopover: (item: any) => {
                    if (item.verified) {
                        return {
                            text: 'common.verified',
                            type: 'success',
                            icon: 'icon-check',
                        };
                    }
                    return null;
                },
            },
            {
                key: 'identifiers',
                label: 'accounts.identifiers',
                type: 'default',
                style: { 'width': '15rem' },
                sort: { key: 'searchValue', order: 'desc' },
                processValue: (item: any) => {
                    return item.searchValue || '-';
                },
                clickable: () => true,
                hoverable: () => true,
            },
            {
                key: 'collectStatus',
                label: 'groups.collectStatus',
                type: 'default',
                style: { 'width': '15rem' },
                sort: { key: 'collectStatus', order: 'desc' },
                processBadgeValues: (item: any): BadgeInput[] => {
                    const statusMap: Record<string, { text: string, iconColor: Color }> = {
                        'FINISHED': {
                            text: 'Сбор завершен',
                            iconColor: 'success',
                        },
                        'IN_PROGRESS': {
                            text: 'Идет сбор',
                            iconColor: 'blue-dark',
                        },
                        'ERROR': {
                            text: 'Ошибка сбора',
                            iconColor: 'error',
                        },
                        'PENDING': {
                            text: 'Ожидание',
                            iconColor: 'warning',
                        },
                    };

                    const status = statusMap[item.collectStatus] || {
                        text: item.collectStatus || '-',
                        iconColor: 'default' as Color,
                    };

                    return [{
                        text: status.text,
                        color: 'default',
                        icon: 'icon-dot',
                        iconType: 'sm',
                        iconColor: status.iconColor,
                    }];
                }
            },
            {
                key: 'verified',
                label: 'accounts.identified',
                type: 'default',
                style: { 'width': '15rem' },
                sort: { key: 'verified', order: 'desc' },
                clickable: () => true,
                hoverable: () => true,
            },
            {
                key: 'monitor',
                label: 'accounts.onMonitoring',
                type: 'default',
                style: { 'width': '12rem' },
                sort: { key: 'monitor', order: 'desc' },
                processBadgeValues: (item: any): BadgeInput[] => {
                    if (!item.monitor) {
                        return [{
                            text: 'Нет',
                            color: 'default',
                        }];
                    }
                    return [{
                        text: 'Да',
                        icon: 'icon-eye',
                        iconColor: 'success',
                        iconType: 'sm',
                        popover: item.monitoringType ? (row: any) => ({
                            text: 'accounts.monitoringActive',
                            parts: [
                                {
                                    label: 'common.type',
                                    value: row.monitoringType,
                                },
                                ...(row.regularPriod?.start ? [{
                                    label: 'common.start_date',
                                    value: this.datePipe.transform(row.regularPriod.start, 'dd.MM.yyyy HH:mm') || '',
                                }] : []),
                                ...(row.regularPriod?.end ? [{
                                    label: 'common.end_date',
                                    value: this.datePipe.transform(row.regularPriod.end, 'dd.MM.yyyy HH:mm') || '',
                                }] : []),
                            ],
                        }) : undefined,
                    }];
                }
            },
            {
                key: 'tags',
                label: 'common.tag',
                type: 'default',
                style: { 'width': '15rem' },
                sort: { key: 'contentTag', order: 'desc' },
                badgeLimitCount: (item: any) => {
                    const tags = this.getItemTags(item);
                    if (!tags || tags.length === 0) return 0;

                    let result = 0;
                    let maxChars = 20;
                    tags.forEach((tag: string) => {
                        maxChars = maxChars - tag.length;
                        if (maxChars > 0) result++;
                    });
                    return result;
                },
                processBadgeValues: (item: any): BadgeInput[] => {
                    const tags = this.getItemTags(item);
                    if (!tags || tags.length === 0) {
                        return [];
                    }

                    return tags.map((tag: string) => ({
                        text: tag,
                        color: 'default' as Color,
                        clickable: false,
                        removable: false,
                    }));
                }
            },
            // {
            //     key: 'subscriberCount',
            //     label: 'accounts.subscribers',
            //     type: 'default',
            //     style: { 'width': '10rem' },
            //     sort: { key: 'subscriberCount', order: 'desc' },
            //     processValue: (item: any) => {
            //         if (item.subscriberCount === null || item.subscriberCount === undefined) {
            //             return '-';
            //         }
            //         return item.subscriberCount.toString();
            //     },
            // },
            {
                key: 'subscriberCount',
                label: 'accounts.subscribers',
                type: 'default',
                style: { 'width': '10rem' },
                sort: { key: 'subscriberCount', order: 'desc' },
                processValue: (item: any) => {
                    if (item.subscriberCount === null || item.subscriberCount === undefined) {
                        return '-';
                    }
                    return item.subscriberCount.toString();
                },
            },
            {
                key: 'groupCount',
                label: 'accounts.groups',
                type: 'default',
                style: { 'width': '10rem' },
                sort: { key: 'groupCount', order: 'desc' },
                processValue: (item: any) => {
                    if (item.groupCount === null || item.groupCount === undefined) {
                        return '-';
                    }
                    return item.groupCount.toString();
                },
            },
            // {
            //     key: 'postCount',
            //     label: 'accounts.posts',
            //     type: 'default',
            //     style: { 'width': '10rem' },
            //     sort: { key: 'postCount', order: 'desc' },
            //     processValue: (item: any) => {
            //         if (item.postCount === null || item.postCount === undefined) {
            //             return 'common.no';
            //         }
            //         return item.postCount.toString();
            //     },
            // },
            {
                key: 'postCount',
                label: 'accounts.stories',
                type: 'default',
                style: { 'width': '10rem' },
                sort: { key: 'postCount', order: 'desc' },
                processValue: (item: any) => {
                    if (item.postCount === null || item.postCount === undefined) {
                        return 'common.no';
                    }
                    return item.postCount.toString();
                },
            },
            {
                key: 'lastCollectedAt', label: 'accounts.lastCollectedAt', type: 'date', style: { 'width': '12rem' },
                sort: { key: 'lastTs', order: 'desc' },
            },
            // {
            //     key: 'lastCollectedAt', label: 'accounts.lastPostTs', type: 'date', style: { 'width': '12rem' },
            //     sort: { key: 'lastTs', order: 'desc' },
            // },
            {
                key: 'actions',
                label: 'common.actions',
                type: 'default',
                stickyRight: true,
                style: { 'width': '8rem' },
                actions: [
                    {
                        key: 'refresh',
                        icon: 'icon-info-circle',
                        class: 'button--secondary-gray',
                        clicked: (item: any) => {
                            console.log('Refresh collection:', item.id);
                        },
                    }
                ],
                dropdownActions: [
                    {
                        label: 'button.enableMonitoring',
                        icon: 'icon-eye',
                        value: 'action.enable_monitoring',
                        onClick: (item: any) => this.enableMonitoring(item.id),
                        isHideOption: (item: any) => item.monitor || !this.isOnline,
                    },
                    {
                        label: 'button.disableMonitoring',
                        icon: 'icon-eye-off',
                        value: 'action.disable_monitoring',
                        onClick: (item: any) => this.disableMonitoring(item.id),
                        isHideOption: (item: any) => !item.monitor || !this.isOnline,
                    },
                    {
                        label: 'button.edit',
                        icon: 'icon-edit',
                        value: 'action.edit',
                        onClick: (item: any) => {
                            console.log('Edit collection:', item.id);
                        },
                    },
                    {
                        label: 'button.delete',
                        icon: 'icon-trash',
                        value: 'action.delete',
                        onClick: (item: any) => {
                            console.log('Delete collection:', item.id);
                        },
                    },
                ]
            }
        ];
    }

    getBotsColumns(): TableColumn[] {
        // For now, use the same as accounts
        return this.getAccountsColumns();
    }
}
