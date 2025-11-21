import { Component, computed, DestroyRef, HostBinding, inject, OnInit, signal } from '@angular/core';
import { SortingItem } from '../../../../shared/components/sorting/sorting';
import { FacadeAccountsService } from '../store/facade-accounts.service';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { HeaderService } from '../../../../core/services/header.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { AccountListApi } from './api/account-list.api';
import { BasePageableListComponent } from '../../base/base-pageable-list/base-pageable-list.component';
import { PageParams } from '../../../../shared/components/pagination-panel/pagination-panel';
import { FilterFormService } from './components/filter/filter-form.service';
import { FilterComponent } from './components/filter/filter.component';
import { TableComponent } from '../../../../shared/components/data-table/components/table/table.component';
import { Column } from '../../../../shared/components/data-table/components/table/table';
import { TableCardComponent } from '../shared/table-card/table-card.component';
import { Router } from '@angular/router';
import { getPlatforms } from '../../mocks/allowed-platforms.mock';
// import { ButtonDropdownComponent } from '../../../../shared/components/button-dropdown/button-dropdown.component';
import { ButtonDropdownItem } from '../../../../shared/components/button-dropdown/button-dropdown';
import { AddOpenAccountModalComponent } from './components/add-open-account-modal/add-open-account-modal.component';
import { MONITORING_API_TOKEN } from '../../base/ui/monitoring-modal/monitoring-api.token';
import { AccountApiService } from '../shared/api/group-api.service';
import { MonitoringModalComponent } from '../../base/ui/monitoring-modal/monitoring-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../../environments/environment';
import { TranslocoPipe } from '@jsverse/transloco';
import { SvgIconComponent } from "../../../../shared/components/svg-icon/svg-icon.component";

@Component({
    selector: 'app-account-list',
    imports: [
        BasePageableListComponent,
        FilterComponent,
        TableComponent,
        TableCardComponent,
        TableCardComponent,
        // ButtonDropdownComponent,
        TranslocoPipe,
        SvgIconComponent
    ],
    templateUrl: './account-list.component.html',
    styleUrl: './account-list.component.scss',
    providers: [
        FilterFormService,
        {
            provide: MONITORING_API_TOKEN,
            useClass: AccountApiService,
        }
    ]
})
export class AccountListComponent implements OnInit {
    @HostBinding('class') public class = 'body';

    public createMethods: ButtonDropdownItem[] = [
        {
            icon: 'icon-lock',
            text: 'accounts.openSource',
            onClick: () => {
                this.openAddOpenAccountModal();
            },
        }
    ];

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

    public columns: Column[] = [
        {
            key: 'name',
            label: 'common.name',
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
                if (!(row.username && row.url)) {
                    return row.searchValue;
                } else {
                    return row.username + '<br>' + row.url
                }
            }
        },
        {
            key: 'groupCount',
            label: 'accounts.groups',
            type: 'default',
            procesData: (row): string => {
                if (row.groupCount === 0) {
                    return '';
                } else return row.groupCount;
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
        },
        {
            key: 'subscriberCount',
            label: 'accounts.subscribers',
            type: 'default',
            procesData: (row): string => {
                if (row.subscriberCount === 0) {
                    return '';
                } else return row.subscriberCount;
            }
        }
    ];

    private facadeStoreService = inject(FacadeAccountsService);
    private modalService = inject(ModalService);
    private headerService = inject(HeaderService);
    private accountApiService = inject(AccountListApi);
    private destroyRef = inject(DestroyRef);
    private notificationService = inject(NotificationsService);
    private router = inject(Router);
    private monitoringApi = inject(MONITORING_API_TOKEN);

    public filterForm = inject(FilterFormService).form;

    public pageInfo = this.facadeStoreService.pageInfo;
    public isLoading = this.facadeStoreService.isLoading;
    public accounts = this.facadeStoreService.accounts;
    public allowedPlatforms = signal(getPlatforms());
    public queryParams = this.facadeStoreService.queryParams;

    public isOnline = environment.appType.toUpperCase() === 'ONLINE';

    public accountsMapped = computed(() => {
        return this.accounts().map((account) => {
            return {
                ...account,
                platform: this.allowedPlatforms().find((p) => p?.name?.toLowerCase() === account?.platform?.toLowerCase())?.id || 0
            };
        });
    })

    ngOnInit(): void {
        this.headerService.setTitle('accounts.accounts');
        this.headerService.isNavButtonsVisible = false;
        this.getAccounts();

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
                }
            });
        }
    }

    getAccounts() {
        this.facadeStoreService.getAccounts(this.filterForm.getRawValue());
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

    handleFilter(): void {
        this.getAccounts();
    }

    handleSearch(searchText: string): void {
        this.filterForm.controls.search.setValue(searchText);
        this.facadeStoreService.setQueryParams({
            page: 0,
            size: this.queryParams().size,
            sort: this.queryParams().sort,
        });
        this.getAccounts();
    }

    public goToAccountDetails(id: string): void {
        this.router.navigate(['collections/accounts', id]);
    }

    enableMonitoring(accountId: string) {
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
                    this.getAccounts();
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
            this.getAccounts();
        });
    }

    public openAddOpenAccountModal(): void {
        console.log('opened modal')
        this.modalService.showModal(AddOpenAccountModalComponent, {
            allowOverlayClick: true,
            data: {},
            whenClosed: () => {
                this.getAccounts();
            }
        });
    }
}
