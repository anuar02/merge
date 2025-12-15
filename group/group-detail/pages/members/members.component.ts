import {Component, computed, DestroyRef, inject, Input, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CommonModule, DatePipe} from '@angular/common';
import {
    PaginationPanelComponent
} from '../../../../../../shared/components/pagination-panel/pagination-panel.component';
import {SortingComponent} from '../../../../../../shared/components/sorting/sorting.component';
import {SortingItem} from '../../../../../../shared/components/sorting/sorting';
import {NotFoundComponent} from '../../../../../../shared/components/not-found/not-found.component';
import {SearchBarComponent} from '../../../../../../shared/components/search-bar/search-bar.component';
import {ViewSwitchComponent} from '../../../../../../shared/components/view-switch/view-switch.component';
import {ViewSwitch} from '../../../../../../shared/components/view-switch/view-switch';
import {getPlatforms} from '../../../../mocks/allowed-platforms.mock';
import {FacadeAccountsService} from '../../../../account/store/facade-accounts.service';
import {PageParams} from '../../../../../../shared/components/pagination-panel/pagination-panel';
import {RouterModule} from '@angular/router';
import {TranslocoPipe} from '@jsverse/transloco';
import {ModalService} from '../../../../../../shared/components/modal/modal.service';
import {MonitoringModalComponent} from '../../../../base/ui/monitoring-modal/monitoring-modal.component';
import {NotificationsService} from '../../../../../../shared/services/notifications.service';
import {MONITORING_API_TOKEN} from '../../../../base/ui/monitoring-modal/monitoring-api.token';
import {AccountApiService} from '../../../../account/shared/api/group-api.service';
import {CollectionCardComponent} from "../../../../collection/shared/card/card.component";
import {AppTableComponent} from "../../../../../../shared/components-new/table/table.component";
import {TableColumn} from "../../../../../../shared/components-new/table/table";
import {environment} from "../../../../../../../environments/environment";
import {
    CollectionColumnsFactory,
    ColumnFactoryConfig
} from "../../../../collection/collection-list/collection-columns.factory";
import {GroupInfoModalComponent} from "../../../components/group-info-modal/group-info-modal.component";
import {FilterFormService} from "../../../../collection/shared/collection-filter/filter-form.service";

@Component({
    selector: 'app-members',
    imports: [
        CommonModule,
        PaginationPanelComponent,
        SortingComponent,
        NotFoundComponent,
        SearchBarComponent,
        ViewSwitchComponent,
        RouterModule,
        AppTableComponent,
        TranslocoPipe,
        CollectionCardComponent,
    ],
    templateUrl: './members.component.html',
    styleUrl: './members.component.scss',
    standalone: true,
    providers: [
        FilterFormService,
        DatePipe,
        {
            provide: MONITORING_API_TOKEN,
            useClass: AccountApiService,
        }
    ]
})
export class MembersComponent implements OnInit {
    private columnsFactory = inject(CollectionColumnsFactory);

    @Input() groupId: string | null = null;

    public sortingItems: SortingItem[] = [
        {
            label: 'common.firstCollectedDateSortLabel',
            value: 'firstCollectedAt',
            icon: ''
        },
        {
            label: 'common.lastCollectedDateSortLabel',
            value: 'lastCollectedAt',
            icon: ''
        },
        {
            label: 'common.fullNameSortLabel',
            value: 'title',
            icon: '',
            labelDesc: 'common.sortDesc',
            labelAsc: 'common.sortAsc'
        },
        {
            label: 'common.usernameSortLabel',
            value: 'username',
            icon: '',
            labelDesc: 'common.sortDesc',
            labelAsc: 'common.sortAsc'
        }
    ];
    public columns: TableColumn[] = [];

    public dataView = signal<ViewSwitch>('list');
    public allowedPlatforms = signal(getPlatforms());

    private facadeStoreService = inject(FacadeAccountsService);
    private modalService = inject(ModalService);
    private notificationService = inject(NotificationsService);
    private destroyRef = inject(DestroyRef);
    private monitoringApi = inject(MONITORING_API_TOKEN);
    private datePipe = inject(DatePipe);
    public isOnline = environment.appType.toUpperCase() === 'ONLINE';


    public pageInfo = this.facadeStoreService.pageInfo;
    public isLoading = this.facadeStoreService.isLoading;
    public accounts = this.facadeStoreService.accounts;
    public queryParams = this.facadeStoreService.queryParams;

    public accountsMapped = computed(() => {
        return this.accounts().map((account) => {
            return {
                ...account,
                platform: this.allowedPlatforms().find((p) => p?.name?.toLowerCase() === account?.platform?.toLowerCase())?.id || 0
            };
        });
    })

    public filterForm = inject(FilterFormService).form;

    ngOnInit() {
        if (this.groupId) {
            this.getAccounts();
        }

        const config: ColumnFactoryConfig = {
            isOnline: this.isOnline,
            apiService: this.facadeStoreService,
            onRefresh: () => this.getAccounts(),
            onEnableMonitoring: (item: any) => this.enableMonitoring(item.id),
            onDisableMonitoring: (item: any) => this.disableMonitoring(item.id),
            onShowInfo: (item: any) => this.modalService.showModal(GroupInfoModalComponent, {
                data: {
                    id: item.id,
                    groupUrl: item.url,
                    privacy: item.privacy || 'Приватность - Открытый',
                    description: item.description || 'Description',
                    groupType: item.groupType || 'Тип сообщества - Группа',
                    inviteLine: item.inviteLine || `Ссылка для приглашения - ${item.url}`,
                    createdBy: item.createdBy,
                    aiProfile: item.aiProfile || 'ИИ Профиль - Вывод:......',
                }
            }),
            onStartCollection: (item: any) => {
                console.log('Start collection:', item.id);
                // TODO: Implement start collection logic
            },
            onAddToFavorites: (item: any) => {
                console.log('Add to favorites:', item.id);
                // TODO: Implement add to favorites logic
            },
        };

        this.columns = this.columnsFactory.createGroupsColumns(config);
    }

    getAccounts() {
        if (!this.groupId) {
            console.error('MembersComponent: groupId is required');
            return;
        }

        this.facadeStoreService.getAccounts({
            ...this.filterForm.getRawValue(),
            subject: {
                subjectId: this.groupId,
                subjectType: 'GROUP',
            }
        });
    }

    private getItemTags(item: any): string[] {
        const tags: string[] = [];

        if (item.contentTag) {
            tags.push(item.contentTag);
        }

        if (item.contentTopic) {
            tags.push(item.contentTopic);
        }

        return tags;
    }

    onViewChange(event: ViewSwitch): void {
        this.dataView.set(event);
    }

    handleSearch(searchText: string): void {
        this.filterForm.controls.search.setValue(searchText);
        this.facadeStoreService.setQueryParams({
            page: 0,
            size: this.pageInfo().pageParams.size,
            sort: this.pageInfo().pageParams.sort,
        });
        this.getAccounts();
    }

    handleChangePage(target: EventTarget | null | number) {
        const newPage = typeof target === 'number' ? target : Number((target as HTMLSelectElement)?.value);
        if (newPage < 0 || newPage >= this.pageInfo().totalPages) return;
        const nextPageParams = new PageParams(newPage, this.pageInfo().pageParams.size);
        this.handleChangePageParams(nextPageParams);
    }

    handleItemsPerPageChange(target: EventTarget | null | number) {
        const perPage = typeof target === 'number' ? target : Number((target as HTMLSelectElement)?.value);
        const newPageParams = new PageParams(0, perPage);
        this.handleChangePageParams(newPageParams);
    }

    handleChangePageParams(pageParams: PageParams): void {
        this.facadeStoreService.setQueryParams({
            ...this.queryParams(),
            page: pageParams.page,
            size: pageParams.size,
        });
        this.getAccounts();
    }

    onSortingChange(sortingParams: string): void {
        this.facadeStoreService.setQueryParams({
            ...this.queryParams(),
            sort: sortingParams,
        });
        this.getAccounts();
    }

    enableMonitoring(accountId: string): void {
        this.modalService.showModal(MonitoringModalComponent, {
            allowOverlayClick: true,
            data: {
                accountId,
            },
            whenClosed: (monitoringDetails) => {
                this.monitoringApi.createMonitoring(accountId, monitoringDetails).pipe(
                    takeUntilDestroyed(this.destroyRef),
                ).subscribe(() => {
                    this.notificationService.addNotification(
                        'success',
                        'accounts.monitoringCreatedSuccess',
                        ''
                    );
                    this.updateGeneralInfo();
                })
            }
        });
    }

    disableMonitoring(accountId: string): void {
        this.monitoringApi.removeMonitoring(accountId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.notificationService.addNotification(
                'success',
                'accounts.monitoringDeletedSuccess',
                ''
            );
            this.updateGeneralInfo();
        });
    }

    updateGeneralInfo(): void {
        this.getAccounts();
    }
}
