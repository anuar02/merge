import {
    Component,
    computed,
    DestroyRef,
    effect,
    HostBinding,
    inject,
    OnInit,
    Signal,
    signal,
    untracked
} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {TranslocoPipe} from '@jsverse/transloco';
import {map} from 'rxjs';
import {BasePageableListComponent} from "../../base/base-pageable-list/base-pageable-list.component";
import {CollectionFilterComponent} from "../shared/collection-filter/filter.component";
import {CollectionCardComponent} from "../shared/card/card.component";
import {AppTableComponent} from "../../../../shared/components-new/table/table.component";
import {SvgIconComponent} from "../../../../shared/components/svg-icon/svg-icon.component";
import {CollectionFilterService, CollectionFilterType} from "../shared/collection-filter/filter.service";
import {MONITORING_API_TOKEN} from "../../base/ui/monitoring-modal/monitoring-api.token";
import {AccountApiService} from "../../account/shared/api/group-api.service";
import {CollectionType} from "../models/collection.entity";
import {FacadeCollectionsService} from "../store/facade-collections.service";
import {CollectionsApiService} from "../shared/api/api.service";
import {ModalService} from "../../../../shared/components/modal/modal.service";
import {NotificationsService} from "../../../../shared/services/notifications.service";
import {getPlatforms} from "../../mocks/allowed-platforms.mock";
import {environment} from "../../../../../environments/environment";
import {SortingItem} from "../../../../shared/components/sorting/sorting";
import {PageParams} from "../../../../shared/components/pagination-panel/pagination-panel";
import {
    MonitoringModalComponent,
    MonitoringMode,
    MonitoringSection
} from "../../base/ui/monitoring-modal/monitoring-modal.component";
import {Tab} from "../../../../shared/components/tabs/tabs";
import {ViewSelectorComponent} from "../../../../shared/components/view-selector/view-selector.component";
import {ColumnSort} from "../../../../shared/components-new/table/table";
import {
    AddOpenAccountModalComponent
} from "../../account/shared/add-open-account-modal/add-open-account-modal.component";
import {
    AddOpenGroupsModalComponent
} from "../../group/group-list/components/add-open-groups-modal/add-open-groups-modal.component";
import {GroupInfoModalComponent} from "../../group/components/group-info-modal/group-info-modal.component";
import {CollectionColumnsFactory, ColumnFactoryConfig} from "./collection-columns.factory";
import {DirectoryTreeComponent} from "../../../directory/presentation/ui";
import {DirectoryCatalogStore} from "../../../directory/presentation/store/directory-catalog-store";
import {DirectoryItemEntity} from "../../../directory/domain/entities";

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
        DirectoryTreeComponent,
        AppTableComponent,
        SvgIconComponent,
        ViewSelectorComponent,
    ],
    providers: [
        CollectionFilterService,
        CollectionColumnsFactory,
        DatePipe,
        {
            provide: MONITORING_API_TOKEN,
            useClass: AccountApiService,
        }
    ]
})
export class CollectionListComponent implements OnInit {
    private columnsFactory = inject(CollectionColumnsFactory);
    private readonly directoryCatalogStore = inject(DirectoryCatalogStore);
    protected readonly selectedDirectory: Signal<DirectoryItemEntity | null> = this.directoryCatalogStore.selectedDirectory;

    @HostBinding('class') public class = 'body';

    private route = inject(ActivatedRoute);
    private currentFilters = signal<any>({});


    public collectionType = toSignal(
        this.route.data.pipe(map(data => data['collectionType'] as CollectionType)),
        {initialValue: 'GROUP' as CollectionType}
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

    public sourceTypes = toSignal(
        this.apiService.getSourceTypes().pipe(takeUntilDestroyed()),
        {initialValue: []}
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
        const config: ColumnFactoryConfig = {
            isOnline: this.isOnline,
            apiService: this.apiService,
            onRefresh: () => this.getCollections(),
            onEnableMonitoring: (item: any) => this.enableMonitoring(item.id, 'monitoring'),
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
                this.enableMonitoring(item.id, 'collection')
            },
            onAddToFavorites: (item: any) => {
                console.log('Add to favorites:', item.id);
                // TODO: Implement add to favorites logic
            },
        };

        const type = this.collectionType();
        if (type === 'GROUP') {
            return this.columnsFactory.createGroupsColumns(config);
        } else if (type === 'ACCOUNT') {
            return this.columnsFactory.createAccountsColumns(config);
        } else {
            return this.columnsFactory.createBotsColumns(config);
        }
    });

    tabs: Tab[] = [
        new Tab('navbar.groups', 'collections-v2/groups', true, '', 'groups'),
        new Tab('navbar.accounts', 'collections-v2/accounts', true, '', 'accounts'),
        new Tab('navbar.bots', 'collections-v2/bots', true, '', 'bots'),
    ];

    constructor() {
        effect(() => {
            const selectedDirectory = this.selectedDirectory();

            untracked(() => {
                const current = this.queryParams();
                if (selectedDirectory === null && !current.folderId) {
                    return
                }

                this.facadeService.setQueryParams(this.collectionType(), {
                    ...current,
                    folderId: selectedDirectory?.id === current.folderId ? '' : selectedDirectory?.id
                })
                this.handleFilter();
            });
        });
    }

    private getPhotoUrl(photo: string, type: CollectionType): string {
        if (!photo || photo.startsWith('blob:') || photo.startsWith('assets/') || photo.startsWith('http')) {
            return photo;
        }
        return `${environment.apiUrl}/resources-v2/media?path=${encodeURIComponent(photo)}`;
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

    ngOnInit(): void {
        this.facadeService.setActiveCollectionType(this.collectionType());

        this.handleFilter();
    }

    getCollections(): void {
        const form = this.filterForm();
        const formValues = form.getRawValue();

        const payload = this.cleanFilterValues(formValues);

        this.facadeService.getCollections(this.collectionType(), payload).subscribe();
    }

    public openAddModal(type: CollectionType): void {
        switch (type) {
            case "ACCOUNT":
                this.modalService.showModal(AddOpenAccountModalComponent, {
                    allowOverlayClick: true,
                    data: {},
                    whenClosed: () => {
                        this.handleFilter();
                    }
                });
                break
            case "GROUP":
                this.modalService.showModal(AddOpenGroupsModalComponent, {
                    allowOverlayClick: true,
                    data: {},
                    whenClosed: () => {
                        this.handleFilter();
                    }
                });
                break
            case "BOT":
                console.log('added bot')

        }
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

    handleFilter(filterValues?: any): void {
        const form = this.filterForm();
        const formValues = form.getRawValue();

        const transformedFilters = filterValues || this.cleanFilterValues(formValues);


        const current = this.queryParams();
        this.facadeService.setQueryParams(this.collectionType(), {
            ...current,
            page: 0,
            size: current.size,
            sort: current.sort,
        });

        this.facadeService.getCollections(this.collectionType(), transformedFilters).subscribe();
    }

    private cleanFilterValues(formValues: any): any {
        const cleaned: any = {
            search: formValues.search || "",
            platforms: formValues.platforms || []
        };

        const config = this.filterService.getFilterConfig(this.filterType());

        config.sections.forEach(section => {
            const processField = (field: any) => {
                const value = formValues[field.key];

                if (field.type === 'numberRange' && value) {
                    const min = Number(field.min ?? 0);
                    const max = Number(field.max ?? 100);

                    if (value.from !== min || value.to !== max) {
                        cleaned[field.key] = value;
                    }
                } else if (field.type === 'dateRange' && value) {
                    if (value.start && value.end) {
                        cleaned[field.key] = value;
                    }
                } else if (field.type === 'checkboxList' && value?.length > 0) {
                    cleaned[field.key] = value;
                } else if (field.type === 'checkbox' && value) {
                    cleaned[field.key] = value;
                }
            };

            section.fields?.forEach(processField);

            section.subsections?.forEach((subsection: any) => {
                subsection.fields?.forEach(processField);
            });
        });

        return this.filterService.transformFilterPayload(cleaned);
    }

    handleSearch(searchText: string): void {
        const form = this.filterForm();
        form.patchValue({search: searchText});
        const current = this.queryParams();
        this.facadeService.setQueryParams(this.collectionType(), {
            page: 0,
            size: current.size,
            sort: current.sort,
        });
        this.getCollections();
    }

    public goToDetails(id: string): void {
        const typeRoutes: Record<CollectionType, string> = {
            'GROUP': 'collections-v2/groups',
            'ACCOUNT': 'collections-v2/accounts',
            'BOT': 'collections-v2/bots'
        };
        this.router.navigate([`${typeRoutes[this.collectionType()]}`, id]);
    }

    enableMonitoring(collectionId: string, mode: MonitoringMode = 'monitoring'): void {

        this.modalService.showModal(MonitoringModalComponent, {
            allowOverlayClick: true,
            data: {
                accountId: collectionId,
                mode: mode,
                sections: this.getDefaultSections(),
                title: `common.monitoring`
            },
            whenClosed: (monitoringDetails) => {
                if (!monitoringDetails || monitoringDetails === 'close') return;

                this.monitoringApi.createMonitoring(collectionId, monitoringDetails).pipe(
                    takeUntilDestroyed(this.destroyRef),
                ).subscribe(() => {
                    const successMessage = mode === 'collection'
                        ? 'accounts.collectionStartedSuccess'
                        : 'accounts.monitoringCreatedSuccess';

                    this.notificationService.addNotification(
                        'success',
                        successMessage,
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

    private getDefaultSections(): MonitoringSection[] {
        return [
            {value: 'POSTS', label: 'accounts.publications', defaultChecked: true},
            {value: 'MEMBERS', label: 'accounts.participants', defaultChecked: true},
        ];
    }
}
