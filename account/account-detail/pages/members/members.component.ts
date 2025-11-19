import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {CommonModule} from '@angular/common';
import {
    PaginationPanelComponent
} from '../../../../../../shared/components/pagination-panel/pagination-panel.component';
import {SortingComponent} from '../../../../../../shared/components/sorting/sorting.component';
import {SortingItem} from '../../../../../../shared/components/sorting/sorting';
import {NotFoundComponent} from '../../../../../../shared/components/not-found/not-found.component';
import {SearchBarComponent} from '../../../../../../shared/components/search-bar/search-bar.component';
import {ViewSwitchComponent} from '../../../../../../shared/components/view-switch/view-switch.component';
import {ViewSwitch} from '../../../../../../shared/components/view-switch/view-switch';
import {TableComponent} from '../../../../../../shared/components/data-table/components/table/table.component';
import {TableCardComponent} from '../../../../account/shared/table-card/table-card.component';
import {getPlatforms} from '../../../../mocks/allowed-platforms.mock';
import {Column} from '../../../../../../shared/components/data-table/components/table/table';
import {FacadeAccountsService} from '../../../../account/store/facade-accounts.service';
import {FilterFormService} from '../../../../account/account-list/components/filter/filter-form.service';
import {PageParams} from '../../../../../../shared/components/pagination-panel/pagination-panel';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {TranslocoPipe} from '@jsverse/transloco';
import { MONITORING_API_TOKEN } from '../../../../base/ui/monitoring-modal/monitoring-api.token';
import { AccountApiService } from '../../../shared/api/group-api.service';
import { ModalService } from '../../../../../../shared/components/modal/modal.service';
import { NotificationsService } from '../../../../../../shared/services/notifications.service';
import { MonitoringModalComponent } from '../../../../base/ui/monitoring-modal/monitoring-modal.component';

@Component({
    selector: 'app-members',
    imports: [
        CommonModule,
        PaginationPanelComponent, SortingComponent,
        NotFoundComponent, SearchBarComponent, ViewSwitchComponent, TableComponent, TableCardComponent, RouterModule, TranslocoPipe,
        // FilterComponent
    ],
    templateUrl: './members.component.html',
    styleUrl: './members.component.scss',
    providers: [
        FilterFormService,
        {
            provide: MONITORING_API_TOKEN,
            useClass: AccountApiService,
        }
    ]
})
export class MembersComponent implements OnInit {
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

    public dataView = signal<ViewSwitch>('list');
    public allowedPlatforms = signal(getPlatforms());

    private facadeStoreService = inject(FacadeAccountsService);
    private modalService = inject(ModalService);
    private notificationService = inject(NotificationsService);
    private destroyRef = inject(DestroyRef);
    private monitoringApi = inject(MONITORING_API_TOKEN);

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
    private activatedRoute = inject(ActivatedRoute);

    ngOnInit() {
        this.getAccounts();
    }

    getAccounts() {
        this.facadeStoreService.getAccounts({
            ...this.filterForm.getRawValue(),
            subject: {
                subjectId: this.activatedRoute.parent?.snapshot.params['id'] ?? null,
                subjectType: 'ACCOUNT',
            }
        });
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
