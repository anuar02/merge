import {
    Component,
    computed,
    EventEmitter,
    inject,
    Output,
    input,
    DestroyRef,
} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {TranslocoPipe} from '@jsverse/transloco';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PlatformIconComponent} from '../../../../../shared/components/platform-icon/platform-icon.component';
import {BadgeComponent} from "../../../../../shared/components/badge/badge.component";
import {CollectionEntity, CollectionType} from '../../models/collection.entity';
import {environment} from '../../../../../../environments/environment';
import {COLLECT_STATUS_MAP} from '../../../base/utils/collect-status-map';
import {AccountEntity} from "../../../account/models/account.entity";
import {GroupEntity} from "../../../group/models/group.entity";
import {ActionsDropdownComponent} from "../../../../../shared/components/actions-dropdown/actions-dropdown.component";
import {DropdownItem} from "../../../../../shared/components/dropdown/dropdown";
import {AppButtonComponent} from "../../../../../shared/components-new/button/button.component";
import {GroupInfoModalComponent} from "../../../group/components/group-info-modal/group-info-modal.component";
import {ModalService} from "../../../../../shared/components/modal/modal.service";
import {
    MonitoringModalComponent,
    MonitoringMode,
    MonitoringSection
} from "../../../base/ui/monitoring-modal/monitoring-modal.component";
import {NotificationsService} from "../../../../../shared/services/notifications.service";
import {MONITORING_API_TOKEN} from "../../../base/ui/monitoring-modal/monitoring-api.token";

export interface Platform {
    id: number;
    name: string;
    title?: string;
}

@Component({
    selector: 'app-collection-card',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        TranslocoPipe,
        PlatformIconComponent,
        BadgeComponent,
        ActionsDropdownComponent,
        AppButtonComponent,
    ],
    templateUrl: 'card.component.html',
    styleUrls: ['card.component.scss'],
    host: {
        class: 'card',
        '(click)': '$event.stopPropagation(); onClick()',
    },
})
export class CollectionCardComponent {
    private router = inject(Router);
    private modalService = inject(ModalService);
    private notificationService = inject(NotificationsService);
    private monitoringApi = inject(MONITORING_API_TOKEN);
    private destroyRef = inject(DestroyRef);

    public collection = input.required<CollectionEntity | AccountEntity | GroupEntity>();
    public platforms = input<Platform[]>([]);
    public showMonitoring = input<boolean>(true);
    public bindingList = input<any[]>([]);

    @Output() clicked = new EventEmitter<CollectionEntity | AccountEntity | GroupEntity>();
    @Output() refetchData = new EventEmitter<void>();

    @Output() actionPerformed = new EventEmitter<{
        action: string;
        item: CollectionEntity | AccountEntity | GroupEntity
    }>();

    public isOnline = environment.appType.toUpperCase() === 'ONLINE';

    public dropdownActions: DropdownItem[] = [
        {
            label: 'accounts.start_collection',
            icon: 'icon-play-triangle',
            value: 'action.start_collection',
            onClick: () => {
                this.startCollection(this.collection().id);
            },
            isHideOption: (item: any) => this.collection().collectStatus === 'IN_PROGRESS',
        },
        {
            label: 'accounts.stop_collection',
            icon: 'icon-stop-square',
            value: 'action.stop_collection',
            isHideOption: (item: any) => this.collection().collectStatus === 'FINISHED' || this.collection().collectStatus === null,
            onClick: () => this.stopCollection(this.collection().id),
        },
        {
            label: 'button.start_monitoring',
            icon: 'icon-eye',
            value: 'action.start_monitoring',
            isHideOption: (item: any) => this.collection().monitor,
            onClick: () => {
                this.enableMonitoring(this.collection().id);
            },
        },
        {
            label: 'button.stop_monitoring',
            icon: 'icon-eye-off',
            value: 'action.stop_monitoring',
            isHideOption: (item: any) => !this.collection().monitor,
            onClick: () => this.disableMonitoring(this.collection().id),
        },
        {
            label: 'common.addToFavorites',
            icon: 'icon-bookmark',
            value: 'action.add_to_favorites',
            onClick: () => this.addToFavorites(this.collection().id),
        }
    ];

    public platformId = computed(() => {
        return (
            this.platforms().find(
                (p) =>
                    p?.name?.toLowerCase() ===
                    this.collection()?.platform?.toLowerCase(),
            )?.id || 0
        );
    });

    public tags = computed(() => {
        const contentTag = this.collection()?.contentTag;
        if (!contentTag) return [];
        return contentTag.split(' ').filter(tag => tag.trim().length > 0);
    });

    public collectStatus = computed(() => {
        const status = this.collection()?.collectStatus;
        return COLLECT_STATUS_MAP[status];
    });

    private getEntityType(): CollectionType | string {
        const collection = this.collection();
        if ('collectionType' in collection) {
            return collection.collectionType;
        }
        return 'ACCOUNT'; // Default fallback
    }

    public getPhotoUrl(photo: string): string {
        if (!photo || photo.startsWith('blob:') || photo.startsWith('assets/') || photo.startsWith('http')) {
            return photo;
        }
        return `${environment.apiUrl}/resources-v2/media?path=${encodeURIComponent(photo)}`;
    }

    public onAvatarClick(): void {
        this.router.navigate(this.getDetailRoute());
    }

    public openInfoModal(): void {
        this.modalService.showModal(GroupInfoModalComponent, {
            data: {
                id: this.collection().id,
                groupUrl: this.collection().url,
                privacy: 'Приватность - Открытый',
                description: 'Description',
                groupType: 'Тип сообщества - Группа',
                inviteLine: 'Ссылка для приглашения - telegram.com/aktivist_dvk',
                createdBy: this.collection().createdBy,
                aiProfile: 'ИИ Профиль - Вывод:......',
            }
        });
    }

    public onActionClick(action: DropdownItem): void {
        console.log('Card action clicked:', action.value);

        this.actionPerformed.emit({
            action: action.value,
            item: this.collection()
        });
    }

    public getDetailRoute(): string[] {
        const collection = this.collection();

        if ('collectionType' in collection) {
            const typeRoutes: Record<CollectionType, string> = {
                GROUP: 'collections-v2/groups',
                ACCOUNT: 'collections-v2/accounts',
                BOT: 'collections-v2/bots',
            };
            return [typeRoutes[collection.collectionType], 'card', collection.id];
        }

        return ['collections-v2/accounts', 'card', collection.id];
    }

    public startCollection(collectionId: string): void {
        const mode: MonitoringMode = 'collection';

        this.modalService.showModal(MonitoringModalComponent, {
            allowOverlayClick: true,
            data: {
                accountId: collectionId,
                mode: mode,
                sections: this.getDefaultSections(),
                title: `common.${mode}`
            },
            whenClosed: (monitoringDetails) => {
                if (!monitoringDetails || monitoringDetails === 'close') {
                    console.log('Collection modal closed without action');
                    return;
                }

                console.log(monitoringDetails)

                this.monitoringApi.createMonitoring(collectionId, monitoringDetails).pipe(
                    takeUntilDestroyed(this.destroyRef),
                ).subscribe({
                    next: () => {
                        this.notificationService.addNotification(
                            'success',
                            'accounts.collectionStartedSuccess',
                            ''
                        );
                        this.refetchData.emit();
                    },
                    error: (error) => {
                        console.error('Error starting collection:', error);
                        this.notificationService.addNotification(
                            'error',
                            'accounts.collectionStartedError',
                            ''
                        );
                    }
                });
            }
        });
    }

    public stopCollection(collectionId: string): void {
        console.log('stopCollection called with ID:', collectionId);

        // TODO: Implement stop collection API call
        // For now, just show a notification
        this.notificationService.addNotification(
            'info',
            'accounts.collectionStoppedSuccess',
            ''
        );
        this.refetchData.emit();
    }

    public enableMonitoring(collectionId: string): void {

        this.modalService.showModal(MonitoringModalComponent, {
            allowOverlayClick: true,
            data: {
                accountId: collectionId,
                mode: 'monitoring',
                sections: this.getDefaultSections(),
                title: `common.monitoring`
            },
            whenClosed: (monitoringDetails) => {
                if (!monitoringDetails || monitoringDetails === 'close') {
                    console.log('Monitoring modal closed without action');
                    return;
                }

                this.monitoringApi.createMonitoring(collectionId, monitoringDetails).pipe(
                    takeUntilDestroyed(this.destroyRef),
                ).subscribe({
                    next: () => {
                        this.notificationService.addNotification(
                            'success',
                            'accounts.monitoringCreatedSuccess',
                            ''
                        );
                        this.refetchData.emit();
                    },
                    error: (error) => {
                        console.error('Error creating monitoring:', error);
                        this.notificationService.addNotification(
                            'error',
                            'accounts.monitoringCreatedError',
                            ''
                        );
                    }
                });
            }
        });
    }

    public disableMonitoring(collectionId: string): void {
        console.log('disableMonitoring called with ID:', collectionId);

        this.monitoringApi.removeMonitoring(collectionId).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: () => {
                this.notificationService.addNotification(
                    'success',
                    'accounts.monitoringDeletedSuccess',
                    ''
                );
                this.refetchData.emit();
            },
            error: (error) => {
                console.error('Error removing monitoring:', error);
                this.notificationService.addNotification(
                    'error',
                    'accounts.monitoringDeletedError',
                    ''
                );
            }
        });
    }

    public addToFavorites(collectionId: string): void {
        // TODO: Implement add to favorites API call
        this.notificationService.addNotification(
            'success',
            'common.addedToFavorites',
            ''
        );
        this.refetchData.emit();
    }

    public onClick(): void {
        this.clicked.emit(this.collection());
    }

    private getDefaultSections(): MonitoringSection[] {
        return [
            { value: 'POSTS', label: 'accounts.publications', defaultChecked: true },
            { value: 'MEMBERS', label: 'accounts.participants', defaultChecked: true },
        ];
    }
}
