// collection-list.component.ts

import {Component, computed, DestroyRef, effect, HostBinding, inject, OnInit, signal} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';
import {BasePageableListComponent} from "../../base/base-pageable-list/base-pageable-list.component";
import {CollectionFilterComponent} from "../shared/filter/filter.component";
import {CollectionCardComponent} from "../shared/card/card.component";
import {AppTableComponent} from "../../../../shared/components-new/table/table.component";
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
import {PageParams} from "../../../../shared/components/pagination-panel/pagination-panel";
import {MonitoringModalComponent} from "../../base/ui/monitoring-modal/monitoring-modal.component";
import {TabsComponent} from "../../../../shared/components/tabs/tabs.component";
import {Tab} from "../../../../shared/components/tabs/tabs";
import {ViewSelectorComponent} from "../../../../shared/components/view-selector/view-selector.component";
import {ColumnSort, TableColumn} from "../../../../shared/components-new/table/table";
import { CollectionListColumnsConfig } from './collection-list-columns.config';

@Component({
    selector: 'app-collection-list',
    standalone: true,
    templateUrl: 'collection-list.component.html',
    imports: [
        CommonModule,
        RouterModule,
        TranslocoPipe,
        BasePageableListComponent,
        CollectionFilterComponent,
        CollectionCardComponent,
        AppTableComponent,
        SvgIconComponent,
        TabsComponent,
        FolderTreeComponent,
        ViewSelectorComponent,
    ],
    providers: [
        CollectionFilterService,
        DatePipe,
        {
            provide: MONITORING_API_TOKEN,
            useClass: AccountApiService,
        }
    ]
})
export class CollectionListComponent implements OnInit {
    @HostBinding('class') public class = 'body';

    private route = inject(ActivatedRoute);
    private datePipe = inject(DatePipe);
    private columnsConfig!: CollectionListColumnsConfig;

    public collectionType = toSignal(
        this.route.data.pipe(map(data => data['collectionType'] as CollectionType)),
        { initialValue: 'GROUP' as CollectionType }
    );

    public filterType = computed<CollectionFilterType>(() => {
        const type = this.collectionType();
        return type === 'GROUP' ? 'groups' : type === 'ACCOUNT' ? 'accounts' : 'bots';
    });

    private facadeService = inject(FacadeCollectionsService);
    private filterService = inject(CollectionFilterService);
    private apiService = inject(CollectionsApiService);
    private modalService = inject(ModalService);
    private notificationService = inject(NotificationsService);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private monitoringApi = inject(MONITORING_API_TOKEN);

    public allowedPlatforms = signal(getPlatforms());
    public isOnline = environment.appType.toUpperCase() === 'ONLINE';
    public selectedFolder: Folder | null = null;

    public sourceTypes = toSignal(
        this.apiService.getSourceTypes().pipe(takeUntilDestroyed()),
        { initialValue: [] }
    );

    public filterForm = computed(() => {
        return this.filterService.createFilterForm(this.filterType());
    });

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

    public collectionsMapped = computed(() => {
        return this.collectionsWithPhotoUrls().map((collection) => ({
            ...collection,
            platform: this.allowedPlatforms().find((p) =>
                p?.name?.toLowerCase() === collection?.platform?.toLowerCase()
            )?.id || 0
        }));
    });

    public collectionsWithPhotoUrls = computed(() => {
        return this.collections().map((collection) => ({
            ...collection,
            photo: this.getPhotoUrl(collection.photo, collection.collectionType)
        }));
    });

    public selectedRows = signal<number[]>([]);

    public tableColumns = computed(() => {
        const type = this.collectionType();
        if (type === 'GROUP') {
            return this.columnsConfig.getGroupsColumns();
        } else if (type === 'ACCOUNT') {
            return this.columnsConfig.getAccountsColumns();
        } else {
            return this.columnsConfig.getBotsColumns();
        }
    });

    tabs: Tab[] = [
        new Tab('navbar.groups', 'collections/groups', true, '', 'groups'),
        new Tab('navbar.accounts', 'collections/accounts', true, '', 'accounts'),
        new Tab('navbar.bots', 'collections/bots', true, '', 'bots'),
    ];

    private getPhotoUrl(photo: string, type: CollectionType): string {
        if (!photo || photo.startsWith('blob:') || photo.startsWith('assets/') || photo.startsWith('http')) {
            return photo;
        }
        return `${environment.apiUrl}/resources/media?path=${encodeURIComponent(photo)}`;
    }

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
            value: 'groupName',
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

    public activeSort = signal<ColumnSort>({
        key: 'groupName',
        order: 'asc',
    });
    constructor() {
        effect(() => {
            console.log('pageInfo:', this.pageInfo());
        });
    }

    ngOnInit(): void {
        // Initialize columns config
        this.columnsConfig = new CollectionListColumnsConfig(
            this.datePipe,
            this.getPhotoUrl.bind(this),
            this.getItemTags.bind(this),
            this.enableMonitoring.bind(this),
            this.disableMonitoring.bind(this),
            this.isOnline
        );



        this.facadeService.setActiveCollectionType(this.collectionType());
        this.getCollections();

        console.log(this.pageInfo())
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
        this.router.navigate([`${typeRoutes[this.collectionType()]}`, id]);
    }

    enableMonitoring(collectionId: string): void {
        this.modalService.showModal(MonitoringModalComponent, {
            allowOverlayClick: true,
            data: { accountId: collectionId },
            whenClosed: (monitoringDetails) => {
                if (!monitoringDetails) return;

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

    onSortClicked(event: ColumnSort): void {
        this.activeSort.set(event);
        const sortParam = `${event.key},${event.order}`;
        this.onSortingChange(sortParam);
    }

    onRowSelected(index: number): void {
        const current = this.selectedRows();
        const indexPos = current.indexOf(index);

        if (indexPos > -1) {
            this.selectedRows.set(current.filter(i => i !== index));
        } else {
            this.selectedRows.set([...current, index]);
        }
    }

    onAllSelected(): void {
        const current = this.selectedRows();
        const allCount = this.collections().length;

        if (current.length === allCount) {
            this.selectedRows.set([]);
        } else {
            this.selectedRows.set(this.collections().map((_, i) => i));
        }
    }

    getPageTitle(): string {
        const titles: Record<CollectionType, string> = {
            'GROUP': 'navbar.groups',
            'ACCOUNT': 'navbar.accounts',
            'BOT': 'navbar.bots'
        };
        return titles[this.collectionType()];
    }
}
