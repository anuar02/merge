import {Component, computed, DestroyRef, inject, input, OnInit, signal, effect} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {CommonModule} from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
    PaginationPanelComponent
} from '../../../../../../../shared/components/pagination-panel/pagination-panel.component';
import {SortingComponent} from '../../../../../../../shared/components/sorting/sorting.component';
import {SortingItem} from '../../../../../../../shared/components/sorting/sorting';
import {NotFoundComponent} from '../../../../../../../shared/components/not-found/not-found.component';
import {SearchBarComponent} from '../../../../../../../shared/components/search-bar/search-bar.component';
import {ViewSwitchComponent} from '../../../../../../../shared/components/view-switch/view-switch.component';
import {ViewSwitch} from '../../../../../../../shared/components/view-switch/view-switch';
import {getPlatforms} from '../../../../../mocks/allowed-platforms.mock';
import {FacadeAccountsService} from '../../../../store/facade-accounts.service';
import {PageParams} from '../../../../../../../shared/components/pagination-panel/pagination-panel';
import {TranslocoPipe} from '@jsverse/transloco';
import { MONITORING_API_TOKEN } from '../../../../../base/ui/monitoring-modal/monitoring-api.token';
import { AccountApiService } from '../../../../shared/api/group-api.service';
import { ModalService } from '../../../../../../../shared/components/modal/modal.service';
import { NotificationsService } from '../../../../../../../shared/services/notifications.service';
import { MonitoringModalComponent } from '../../../../../base/ui/monitoring-modal/monitoring-modal.component';
import {CollectionCardComponent} from "../../../../../collection/shared/card/card.component";
import {AppTableComponent} from "../../../../../../../shared/components-new/table/table.component";
import {ViewSelectorComponent} from "../../../../../../../shared/components/view-selector/view-selector.component";
import {Tab} from "../../../../../../../shared/components/tabs/tabs";
import {
    CollectionColumnsFactory,
    ColumnFactoryConfig
} from "../../../../../collection/collection-list/collection-columns.factory";
import {environment} from "../../../../../../../../environments/environment";
import {GroupInfoModalComponent} from "../../../../../group/components/group-info-modal/group-info-modal.component";
import {FilterFormService} from "../../../../../collection/shared/collection-filter/filter-form.service";

type TabType = 'followers' | 'following' | 'mutual';

@Component({
    selector: 'app-account-members',
    imports: [
        CommonModule,
        PaginationPanelComponent, SortingComponent,
        AppTableComponent,
        NotFoundComponent,
        SearchBarComponent,
        ViewSwitchComponent,
        RouterModule, TranslocoPipe, CollectionCardComponent,
        ViewSelectorComponent
    ],
    templateUrl: './messenger-members.component.html',
    styleUrl: './messenger-members.component.scss',
    standalone: true,
    providers: [
        FilterFormService,
        CollectionColumnsFactory,
        {
            provide: MONITORING_API_TOKEN,
            useClass: AccountApiService,
        }
    ]
})
export class AccountMembersComponent implements OnInit {
    private columnsFactory = inject(CollectionColumnsFactory);

    tabType = input.required<TabType>();

    public tabs: Tab[] = [
        new Tab('accounts.followers', 'followers', true, '', 'followers'),
        new Tab('accounts.following', 'following', true, '', 'following'),
        new Tab('accounts.mutual', 'mutual', true, '', 'mutual'),
    ];

    public activeTabKey = computed(() => this.tabType());

    public basePath = computed(() => {
        const accountId = this.getAccountId();
        if (!accountId) return [];
        return ['/collections-v2/accounts', accountId, 'audience'];
    });

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

    public isOnline = environment.appType.toUpperCase() === 'ONLINE';
    public dataView = signal<ViewSwitch>('list');
    public allowedPlatforms = signal(getPlatforms());

    private facadeStoreService = inject(FacadeAccountsService);
    private modalService = inject(ModalService);
    private notificationService = inject(NotificationsService);
    private destroyRef = inject(DestroyRef);
    private monitoringApi = inject(MONITORING_API_TOKEN);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);

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

    // Store filters per tab type
    private tabFilters = new Map<TabType, any>();
    private previousTab: TabType | null = null;

    public filterForm = inject(FilterFormService).form;

    constructor() {
        effect(() => {
            const currentTab = this.tabType();

            if (this.previousTab !== currentTab) {
                this.previousTab = currentTab;
                this.restoreFiltersForTab(currentTab);
                this.getAccounts();
            }
        });
    }

    ngOnInit() {
    }

    public tableColumns = computed(() => {
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
                    privacy: 'Приватность - Открытый',
                    description: 'Description',
                    groupType: 'Тип сообщества - Группа',
                    inviteLine: 'Ссылка для приглашения - telegram.com/aktivist_dvk',
                    createdBy: item.createdBy,
                    aiProfile: 'ИИ Профиль - Вывод:......',
                }
            }),

            onStartCollection: (item: any) => {
                console.log('Start collection:', item.id);
                // TODO: Implement for account audience
            },
            onAddToFavorites: (item: any) => {
                console.log('Add to favorites:', item.id);
                // TODO: Implement add to favorites logic
            },
            // onDelete: (item: any) => {
            //     this.facadeStoreService.deleteAccount(item.id).subscribe(() => {
            //         this.notificationService.addNotification('success', 'Deleted successfully', '');
            //         this.getAccounts(false);
            //     });
            // }
        };

        return this.columnsFactory.createAccountsColumns(config);
    });

    private saveFiltersForTab(tabType: TabType): void {
        this.tabFilters.set(tabType, {
            formValues: this.filterForm.getRawValue(),
            queryParams: this.queryParams()
        });
    }

    private restoreFiltersForTab(tabType: TabType): void {
        const savedFilters = this.tabFilters.get(tabType);
        if (savedFilters) {
            // Restore form values
            this.filterForm.patchValue(savedFilters.formValues);
            // Restore query params
            this.facadeStoreService.setQueryParams(savedFilters.queryParams);
        } else {
            // Reset to defaults for new tab
            this.filterForm.reset();
            this.facadeStoreService.setQueryParams({
                page: 0,
                size: 10,
                sort: 'firstCollectedAt,desc'
            });
        }
    }

    getAccounts(saveFilters: boolean = false) {
        // Only save filters when explicitly requested (like when switching tabs or applying filters)
        if (saveFilters) {
            this.saveFiltersForTab(this.tabType());
        }

        const accountId = this.getAccountId();

        // TODO: When backend is ready, add type parameter to the request
        // For now, this is just a placeholder comment
        // The API call should include: type: this.tabType()

        this.facadeStoreService.getAccounts({
            ...this.filterForm.getRawValue(),
            subject: {
                subjectId: accountId,
                subjectType: 'ACCOUNT',
            },
            // TODO: Uncomment when backend is ready
            // type: this.tabType()
        });
    }

    private getAccountId(): string | null {
        let route = this.activatedRoute;
        while (route) {
            if (route.snapshot.params['id']) {
                return route.snapshot.params['id'];
            }
            route = route.parent as any;
        }
        return null;
    }

    onViewChange(event: ViewSwitch): void {
        this.dataView.set(event);
    }

    handleSearch(searchText: string): void {
        this.filterForm.controls.search.setValue(searchText);
        this.facadeStoreService.setQueryParams({
            page: 0,
            size: this.pageInfo().pageParams.size,
            sort: this.queryParams().sort
        });
        this.getAccounts(true);
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
        this.getAccounts(true);
    }

    onSortingChange(sortingParams: string): void {
        this.facadeStoreService.setQueryParams({
            ...this.queryParams(),
            sort: sortingParams,
        });
        this.getAccounts(true);
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
        this.getAccounts(false);
    }
}
