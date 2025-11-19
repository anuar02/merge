import { Component, computed, DestroyRef, HostBinding, inject, OnInit, signal } from '@angular/core';
import { TableCardComponent } from '../shared/components/table-card/table-card.component';
import { SortingItem } from '../../../../shared/components/sorting/sorting';
import { ButtonDropdownItem } from '../../../../shared/components/button-dropdown/button-dropdown';
import { AddOpenGroupsModalComponent } from './components/add-open-groups-modal/add-open-groups-modal.component';
import { HeaderService } from '../../../../core/services/header.service';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { FacadeGroupsService } from './store/facade-groups.service';
import { PageParams } from '../../../../shared/components/pagination-panel/pagination-panel';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterComponent } from './components/filter/filter.component';
import { FilterFormService } from './components/filter/filter-form.service';
import { MonitoringModalComponent } from '../../base/ui/monitoring-modal/monitoring-modal.component';
import { GroupApiService } from '../shared/api/group-api.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { BasePageableListComponent } from '../../base/base-pageable-list/base-pageable-list.component';
import { TableComponent } from '../../../../shared/components/data-table/components/table/table.component';
import { Column } from '../../../../shared/components/data-table/components/table/table';
// import { ButtonDropdownComponent } from '../../../../shared/components/button-dropdown/button-dropdown.component';
import { Router } from '@angular/router';
import { getPlatforms } from '../../mocks/allowed-platforms.mock';
import { MONITORING_API_TOKEN } from '../../base/ui/monitoring-modal/monitoring-api.token';
import { environment } from '../../../../../environments/environment';
import { TranslocoPipe } from '@jsverse/transloco';
import { SvgIconComponent } from "../../../../shared/components/svg-icon/svg-icon.component";

@Component({
    selector: 'app-group-list',
    imports: [
        TableCardComponent,
        FilterComponent,
        BasePageableListComponent,
        TableComponent,
        // ButtonDropdownComponent,
        TranslocoPipe,
        SvgIconComponent
    ],
    templateUrl: './group-list.component.html',
    styleUrl: './group-list.component.scss',
    standalone: true,
    providers: [
        FilterFormService,
        {
            provide: MONITORING_API_TOKEN,
            useClass: GroupApiService,
        }
    ]
})
export class GroupListComponent implements OnInit {
    @HostBinding('class') public class = 'body';

    public sortingItems: SortingItem[] = [
        {
            label: 'common.addToSystemDateSortLabel',
            value: 'createdAt',
            icon: ''
        },
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
            label: 'common.postCountSortLabel',
            value: 'postCount',
            icon: '',
            labelDesc: 'common.sortDesc',
            labelAsc: 'common.sortAsc'
        },
        {
            label: 'common.subscriberCountSortLabel',
            value: 'subscriberCount',
            icon: '',
            labelDesc: 'common.sortDesc',
            labelAsc: 'common.sortAsc'
        }
    ];

    public createMethods: ButtonDropdownItem[] = [
        {
            icon: 'icon-lock',
            text: 'accounts.openSource',
            onClick: () => {
                this.openAddOpenGroupModal();
            },
        }
    ];

    private facadeGroupsService = inject(FacadeGroupsService);
    private modalService = inject(ModalService);
    private headerService = inject(HeaderService);
    private destroyRef = inject(DestroyRef);
    private notificationService = inject(NotificationsService);

    public filterForm = inject(FilterFormService).form;
    private router = inject(Router);
    private monitoringApi = inject(MONITORING_API_TOKEN);

    public isOnline = environment.appType.toUpperCase() === 'ONLINE';

    public columns: Column[] = [
        {
            key: 'name',
            label: 'common.nomination',
            type: 'account',
            style: 'width: 30rem',
            data: {
                imgSize: 'lg',
                username: '',
                url: '',
                id: '',
                platform: 'platform',
                type: 'collections'
            },
            sticky: true,
            procesData: (row): string => {
                if (!(row.groupName && row.url)) {
                    return row.searchValue;
                } else {
                    return row.groupName + '<br>' + row.url
                }
            }
        },
        //   new Column('contentTag', 'common.tags'),
        {
            key: 'subscriberCount',
            label: 'accounts.subscribers',
            type: 'default',
            procesData: (row): string => {
                if (row.subscriberCount === 0) {
                    return '';
                } else return row.subscriberCount;
            }
        },
        {
            key: 'postCount',
            label: 'accounts.publicationsCount',
            type: 'default',
            procesData: (row): string => {
                if (row.postCount === 0) {
                    return '';
                } else return row.postCount;
            }
        }
    ];

    public pageInfo = this.facadeGroupsService.pageInfo;
    public isLoading = this.facadeGroupsService.isLoading;
    public groups = this.facadeGroupsService.groups;
    public allowedPlatforms = signal(getPlatforms());
    public queryParams = this.facadeGroupsService.queryParams;

    public groupsMapped = computed(() => {
        return this.groups().map((group) => {
            return {
                ...group,
                platform: this.allowedPlatforms().find((p) => p?.name?.toLowerCase() === group?.platform?.toLowerCase())?.id || 0
            };
        });
    })

    ngOnInit(): void {
        this.headerService.setTitle('groups.headerTitle');
        this.headerService.isNavButtonsVisible = false;
        this.getGroups();

        if (this.isOnline && !this.columns.some(obj => obj.key === 'actions')) {
            this.columns.push({
                key: 'actions',
                label: 'common.actions',
                type: 'buttons',
                style: 'width: 5rem',
                data: {
                    buttons: [{
                        icon: 'icon-eye',
                        action: ((row: any, event: MouseEvent) => {
                            if (event) {
                                event.stopPropagation();
                            }
                            this.enableMonitoring(row.id);
                        }),
                        isButtonVisible: ((row: any): boolean => {
                            return !row?.monitor;
                        }),
                    }, {
                        icon: 'icon-eye-off',
                        action: ((row: any, event: MouseEvent) => {
                            if (event) {
                                event.stopPropagation();
                            }
                            this.disableMonitoring(row.id);
                        }),
                        isButtonVisible: ((row: any): boolean => {
                            return row?.monitor ?? false;

                        }),
                    }]
                },
            });
        }
    }

    enableMonitoring(groupId: string) {
        this.modalService.showModal(MonitoringModalComponent, {
            allowOverlayClick: true,
            data: {
                groupId,
                isGroup: true
            },
            whenClosed: (monitoringDetails) => {
                this.monitoringApi.createMonitoring(groupId, monitoringDetails).pipe(
                    takeUntilDestroyed(this.destroyRef),
                ).subscribe(() => {
                    this.notificationService.addNotification(
                        'success',
                        'accounts.monitoringCreatedSuccess',
                        ''
                    );
                    this.getGroups();
                })
            }
        });
    }

    disableMonitoring(groupId: string) {
        this.monitoringApi.removeMonitoring(groupId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.notificationService.addNotification(
                'success',
                'accounts.monitoringDeletedSuccess',
                ''
            )
            this.getGroups();
        });
    }

    onSortingChange(sortingParams: string): void {
        this.facadeGroupsService.setQueryParams({
            ...this.queryParams(),
            sort: sortingParams,
        });
        this.getGroups();
    }

    public getGroups(): void {
        this.facadeGroupsService.getGroups(this.filterForm.getRawValue());
    }

    public handleChangePageParams(pageParams: PageParams): void {
        this.facadeGroupsService.setQueryParams({
            ...this.queryParams(),
            page: pageParams.page,
            size: pageParams.size,
        });
        this.getGroups();
    }

    public handleFilter(): void {
        this.getGroups();
    }

    public handleSearch(searchText: string): void {
        this.filterForm.controls.search.setValue(searchText);
        this.facadeGroupsService.setQueryParams({
            page: 0,
            size: this.queryParams().size,
            sort: this.queryParams().sort,
        });
        this.getGroups();
    }

    public goToGroupDetails(id: string): void {
        this.router.navigate(['group', 'card', id]);
    }

    public openAddOpenGroupModal(): void {
        this.modalService.showModal(AddOpenGroupsModalComponent, {
            allowOverlayClick: true,
            data: {},
            whenClosed: () => {
                this.getGroups();
            }
        });
    }
}
