import { Component, computed, DestroyRef, HostBinding, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';
import {BasePageableListComponent} from "../../base/base-pageable-list/base-pageable-list.component";
import {CollectionFilterComponent} from "../shared/filter/filter.component";
import {CollectionCardComponent} from "../shared/card/card.component";
import {TableComponent} from "../../../../shared/components/data-table/components/table/table.component";
import {SvgIconComponent} from "../../../../shared/components/svg-icon/svg-icon.component";
import {CollectionFilterService, CollectionFilterType} from "../shared/filter/filter.service";
import {MONITORING_API_TOKEN} from "../../base/ui/monitoring-modal/monitoring-api.token";
import {AccountApiService} from "../../account/shared/api/group-api.service";
import {CollectionType} from "../models/collection.entity";
import {FacadeCollectionsService} from "../store/facade-collections.service";
import {CollectionsApiService} from "../shared/api/api.service";
import {ModalService} from "../../../../shared/components/modal/modal.service";
import {NotificationsService} from "../../../../shared/services/notifications.service";
import {getPlatforms} from "../../mocks/allowed-platforms.mock";
import {environment} from "../../../../../environments/environment";
import {Folder, FolderTreeComponent} from "../../../../shared/components/folder-tree/folder-tree.component";
import {SortingItem} from "../../../../shared/components/sorting/sorting";
import {Column} from "../../../../shared/components/data-table/components/table/table";
import {PageParams} from "../../../../shared/components/pagination-panel/pagination-panel";
import {MonitoringModalComponent} from "../../base/ui/monitoring-modal/monitoring-modal.component";
import {TabsComponent} from "../../../../shared/components/tabs/tabs.component";
import {Tab} from "../../../../shared/components/tabs/tabs";
import {ViewSelectorComponent} from "../../../../shared/components/view-selector/view-selector.component";

@Component({
    selector: 'app-collection-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TranslocoPipe,
        BasePageableListComponent,
        CollectionFilterComponent,
        CollectionCardComponent,
        TableComponent,
        SvgIconComponent,
        TabsComponent,
        FolderTreeComponent,
        ViewSelectorComponent,
    ],
    templateUrl: './collection-list.component.html',
    providers: [
        CollectionFilterService,
        {
            provide: MONITORING_API_TOKEN,
            useClass: AccountApiService,
        }
    ]
})
export class CollectionListComponent implements OnInit {
    @HostBinding('class') public class = 'body';

    private route = inject(ActivatedRoute);

    // Get collection type from route data
    public collectionType = toSignal(
        this.route.data.pipe(map(data => data['collectionType'] as CollectionType)),
        { initialValue: 'GROUP' as CollectionType }
    );

    public filterType = computed<CollectionFilterType>(() => {
        const type = this.collectionType();
        return type === 'GROUP' ? 'groups' : type === 'ACCOUNT' ? 'accounts' : 'bots';
    });

    // Services
    private facadeService = inject(FacadeCollectionsService);
    private filterService = inject(CollectionFilterService);
    private apiService = inject(CollectionsApiService);
    private modalService = inject(ModalService);
    private notificationService = inject(NotificationsService);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private monitoringApi = inject(MONITORING_API_TOKEN);

    // State
    public allowedPlatforms = signal(getPlatforms());
    public isOnline = environment.appType.toUpperCase() === 'ONLINE';
    public selectedFolder: Folder | null = null;

    // Source types for filter
    public sourceTypes = toSignal(
        this.apiService.getSourceTypes().pipe(takeUntilDestroyed()),
        { initialValue: [] }
    );

    // Filter form
    public filterForm = computed(() => {
        return this.filterService.createFilterForm(this.filterType());
    });

    // Data from store
    public collections = computed(() => {
        return this.facadeService.getCollectionsByType(this.collectionType())();
    });

    public pageInfo = computed(() => {
        return this.facadeService.getPageInfoByType(this.collectionType())();
    });

    public isLoading = computed(() => {
        return this.facadeService.getIsLoadingByType(this.collectionType())();
    });

    public queryParams = computed(() => {
        return this.facadeService.getQueryParamsByType(this.collectionType())();
    });

    // Mapped collections for table with platform IDs
    public collectionsMapped = computed(() => {
        return this.collections().map((collection) => ({
            ...collection,
            platform: this.allowedPlatforms().find((p) =>
                p?.name?.toLowerCase() === collection?.platform?.toLowerCase()
            )?.id || 0
        }));
    });

    tabs: Tab[] = [
        new Tab('navbar.groups', 'collections/groups', true, '', 'groups'),
        new Tab('navbar.accounts', 'collections/accounts', true, '', 'accounts'),
        new Tab('navbar.bots', 'collections/bots', true, '', 'bots'),
    ];

    get activeTabKey(): string {
        const url = this.router.url;
        if (url.includes('groups')) return 'groups';
        if (url.includes('accounts')) return 'accounts';
        if (url.includes('bots')) return 'bots';
        return '';
    }

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

    // Table columns
    public columns: Column[] = [
        {
            key: 'name',
            label: 'common.name',
            type: 'account',
            style: 'width: 30rem',
            data: {
                imgSize: 'lg',
                username: 'username',
                url: 'url',
                id: 'searchValue',
                platform: 'platform',
                type: 'collections'
            },
            sticky: true,
        } as Column,
        new Column('groupCount', 'accounts.groups'),
        new Column('postCount', 'accounts.publicationsCount'),
    ];

    ngOnInit(): void {
        // Set active collection type in the store
        this.facadeService.setActiveCollectionType(this.collectionType());

        // Load collections
        this.getCollections();


        // Add monitoring column if online
        if (this.isOnline && !this.columns.some(obj => obj.key === 'actions')) {
            this.addMonitoringColumn();
        }
    }

    getCollections(): void {
        const form = this.filterForm();
        const payload = {
            ...form.getRawValue(),
            folderId: this.selectedFolder?.id !== 'favorites' ? this.selectedFolder?.id : undefined,
            isFavorite: this.selectedFolder?.id === 'favorites' ? true : undefined,
        };

        this.facadeService.getCollections(this.collectionType(), payload).subscribe();
    }

    handleChangePageParams(pageParams: PageParams): void {
        const current = this.queryParams();
        this.facadeService.setQueryParams(this.collectionType(), {
            ...current,
            page: pageParams.page,
            size: pageParams.size,
        });
        this.getCollections();
    }

    onSortingChange(sortingParams: string): void {
        const current = this.queryParams();
        this.facadeService.setQueryParams(this.collectionType(), {
            ...current,
            sort: sortingParams,
        });
        this.getCollections();
    }

    handleFilter(): void {
        this.getCollections();
    }

    handleSearch(searchText: string): void {
        const form = this.filterForm();
        form.patchValue({ search: searchText });
        const current = this.queryParams();
        this.facadeService.setQueryParams(this.collectionType(), {
            page: 0,
            size: current.size,
            sort: current.sort,
        });
        this.getCollections();
    }

    handleFolderSelected(folder: Folder | null): void {
        this.selectedFolder = folder;
        this.getCollections();
    }

    public goToDetails(id: string): void {
        const typeRoutes: Record<CollectionType, string> = {
            'GROUP': 'collections/groups',
            'ACCOUNT': 'collections/accounts',
            'BOT': 'collections/bots'
        };
        this.router.navigate([typeRoutes[this.collectionType()], 'card', id]);
    }

    enableMonitoring(collectionId: string): void {
        this.modalService.showModal(MonitoringModalComponent, {
            allowOverlayClick: true,
            data: { accountId: collectionId },
            whenClosed: (monitoringDetails) => {
                this.monitoringApi.createMonitoring(collectionId, monitoringDetails).pipe(
                    takeUntilDestroyed(this.destroyRef),
                ).subscribe(() => {
                    this.notificationService.addNotification(
                        'success',
                        'accounts.monitoringCreatedSuccess',
                        ''
                    );
                    this.getCollections();
                });
            }
        });
    }

    disableMonitoring(collectionId: string): void {
        this.monitoringApi.removeMonitoring(collectionId).pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
            this.notificationService.addNotification(
                'success',
                'accounts.monitoringDeletedSuccess',
                ''
            );
            this.getCollections();
        });
    }

    private addMonitoringColumn(): void {
        this.columns.push({
            key: 'actions',
            label: 'common.actions',
            type: 'buttons',
            style: 'width: 5rem',
            data: {
                buttons: [{
                    icon: 'icon-eye',
                    action: ((row: any, event: MouseEvent) => {
                        if (event) event.stopPropagation();
                        this.enableMonitoring(row.id);
                    }),
                    isButtonVisible: ((row: any): boolean => !row?.monitor),
                }, {
                    icon: 'icon-eye-off',
                    action: ((row: any, event: MouseEvent) => {
                        if (event) event.stopPropagation();
                        this.disableMonitoring(row.id);
                    }),
                    isButtonVisible: ((row: any): boolean => row?.monitor ?? false),
                }]
            }
        });
    }

    // Get title based on collection type
    getPageTitle(): string {
        const titles: Record<CollectionType, string> = {
            'GROUP': 'navbar.groups',
            'ACCOUNT': 'navbar.accounts',
            'BOT': 'navbar.bots'
        };
        return titles[this.collectionType()];
    }
}
