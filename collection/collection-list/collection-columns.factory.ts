import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableColumn } from '../../../../shared/components-new/table/table';
import { BadgeInput, Color } from '../../../../shared/components-new/badge/badge';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

export interface ColumnFactoryConfig {
    isOnline: boolean;
    apiService: any;
    onRefresh?: () => void;
    onEnableMonitoring?: (item: any) => void;
    onDisableMonitoring?: (item: any) => void;
    onUpdateAIProfile?: (item: any) => void;
    onStartCollection?: (item: any) => void;
    onStopCollection?: (item: any) => void;
    onAddToFavorites?: (item: any) => void;
    onDelete?: (item: any) => void;
    onShowInfo?: (item: any) => void;
    showInfoButton?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CollectionColumnsFactory {
    constructor(
        private datePipe: DatePipe,
        private modalService: ModalService,
    ) {}

    createGroupsColumns(config: ColumnFactoryConfig): TableColumn[] {
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
                    return this.getCollectStatusBadge(item);
                }
            },
            {
                key: 'monitor',
                label: 'accounts.onMonitoring',
                type: 'default',
                style: { 'width': '12rem' },
                sort: { key: 'monitor', order: 'desc' },
                processBadgeValues: (item: any): BadgeInput[] => {
                    return this.getMonitorBadge(item);
                }
            },
            {
                key: 'tags',
                label: 'common.tag',
                type: 'default',
                style: { 'width': '12rem' },
                sort: { key: 'contentTag', order: 'desc' },
                badgeLimitCount: (item: any) => this.getTagsLimitCount(item),
                processBadgeValues: (item: any): BadgeInput[] => {
                    return this.getTagsBadges(item);
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
                style: { 'width': '11rem' },
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
                key: 'lastCollectedAt',
                label: 'accounts.lastCollectedAt',
                type: 'date',
                style: { 'width': '12rem' },
                sort: { key: 'lastTs', order: 'desc' },
            },
            {
                key: 'actions',
                label: 'common.actions',
                type: 'default',
                style: { 'width': '8rem' },
                stickyRight: true,
                customActionButton: config.onShowInfo && config.showInfoButton !== false ? {
                    icon: 'icon-info-circle',
                    class: 'secondary-gray',
                    hideAction: (item: any) => !item.id,
                    clicked: config.onShowInfo
                } : undefined,
                dropdownActions: this.getUnifiedActions(config),
            },
        ];
    }

    createAccountsColumns(config: ColumnFactoryConfig): TableColumn[] {
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
                    return this.getCollectStatusBadge(item);
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
                    return this.getMonitorBadge(item);
                }
            },
            {
                key: 'tags',
                label: 'common.tag',
                type: 'default',
                style: { 'width': '15rem' },
                sort: { key: 'contentTag', order: 'desc' },
                badgeLimitCount: (item: any) => this.getTagsLimitCount(item),
                processBadgeValues: (item: any): BadgeInput[] => {
                    return this.getTagsBadges(item);
                }
            },
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
            {
                key: 'postCount',
                label: 'accounts.posts',
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
                key: 'lastCollectedAt',
                label: 'accounts.lastCollectedAt',
                type: 'date',
                style: { 'width': '12rem' },
                sort: { key: 'lastTs', order: 'desc' },
            },
            {
                key: 'actions',
                label: 'common.actions',
                type: 'default',
                stickyRight: true,
                style: { 'width': '8rem' },
                customActionButton: config.onShowInfo && config.showInfoButton !== false ? {
                    icon: 'icon-info-circle',
                    class: 'secondary-gray',
                    hideAction: (item: any) => !item.id,
                    clicked: config.onShowInfo
                } : undefined,
                dropdownActions: this.getUnifiedActions(config),
            }
        ];
    }

    createBotsColumns(config: ColumnFactoryConfig): TableColumn[] {
        return this.createAccountsColumns(config);
    }

    private getCollectStatusBadge(item: any): BadgeInput[] {
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

    private getMonitorBadge(item: any): BadgeInput[] {
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

    private getTagsLimitCount(item: any): number {
        const tags = this.getItemTags(item);
        if (!tags || tags.length === 0) return 0;

        let result = 0;
        let maxChars = 20;
        tags.forEach((tag: string) => {
            maxChars = maxChars - tag.length;
            if (maxChars > 0) result++;
        });
        return result;
    }

    private getTagsBadges(item: any): BadgeInput[] {
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

    private getItemTags(item: any): string[] {
        const tags: string[] = [];
        if (item.contentTag) tags.push(item.contentTag);
        if (item.contentTopic) tags.push(item.contentTopic);
        return tags;
    }

    private getUnifiedActions(config: ColumnFactoryConfig) {
        return [
            {
                label: 'accounts.start_collection',
                icon: 'icon-play-triangle',
                value: 'action.start_collection',
                onClick: (item: any) => {
                    if (config.onStartCollection) {
                        config.onStartCollection(item);
                    }
                },
            },
            {
                label: 'accounts.stop_collection',
                icon: 'icon-stop-square',
                value: 'action.stop_collection',
                isHideOption: (item: any) => item.collectStatus === 'FINISHED',
                //TODO: CHANGE THE LOGIC BASED ON BACKEND
                onClick: (item: any) => {
                    if (config.onStopCollection) {
                        config.onStopCollection(item);
                    }
                },
            },
            {
                label: 'button.start_monitoring',
                icon: 'icon-eye',
                value: 'action.start_monitoring',
                isHideOption: (item: any) => item.monitor,
                //TODO: CHANGE THE LOGIC BASED ON BACKEND

                onClick: (item: any) => {
                    if (config.onEnableMonitoring) {
                        config.onEnableMonitoring(item);
                    }
                },
            },
            {
                label: 'button.stop_monitoring',
                icon: 'icon-eye-off',
                value: 'action.stop_monitoring',
                isHideOption: (item: any) => !item.monitor,
                //TODO: CHANGE THE LOGIC BASED ON BACKEND

                onClick: (item: any) => {
                    this.modalService.showModal(ConfirmModalComponent, {
                        allowOverlayClick: false,
                        data: {
                            icon: 'icon-eye-off',
                            title: 'button.stop_monitoring',
                            subTitle: 'common.are_you_sure_to_discard_changes',
                            cancelBtnText: 'button.cancel',
                            confirmBtnText: 'button.confirm',
                            isExpand: true,
                        },
                        whenClosed: (confirm) => {
                            if (confirm && config.onDisableMonitoring) {
                                config.onDisableMonitoring(item);
                            }
                        }
                    });
                },
            },
            {
                label: 'common.addToFavorites',
                icon: 'icon-bookmark',
                value: 'action.add_to_favorites',
                onClick: (item: any) => {
                    if (config.onAddToFavorites) {
                        config.onAddToFavorites(item);
                    }
                },
            },
        ];
    }
}
