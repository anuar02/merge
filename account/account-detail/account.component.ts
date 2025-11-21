import { Component, DestroyRef, HostBinding, inject, signal } from '@angular/core';
import { Tab } from '../../../../shared/components/tabs/tabs';
import { TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { TableCardComponent } from '../shared/table-card/table-card.component';
import { FacadeGeneralService } from './store/general/facade-general.service';
import { getPlatforms } from '../../mocks/allowed-platforms.mock';
import { HeaderService } from '../../../../core/services/header.service';
import { MonitoringModalComponent } from '../../base/ui/monitoring-modal/monitoring-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { MONITORING_API_TOKEN } from '../../base/ui/monitoring-modal/monitoring-api.token';
import { AccountApiService } from '../shared/api/group-api.service';
import { Router } from '@angular/router';
import { AccountDetailApiService } from './api/account-detail-api.service';
import {Subject, takeUntil} from "rxjs";
import {FacadeResultService} from "../../../deanon/components/result/result.service";
import {DeanonBinding} from "../../../deanon/deanon";

@Component({
    selector: 'app-account',
    imports: [
        TabsComponent,
        TableCardComponent
    ],
    templateUrl: './account.component.html',
    standalone: true,
    styleUrl: './account.component.scss',
    providers: [
        {
            provide: MONITORING_API_TOKEN,
            useClass: AccountApiService,
        }
    ]
})
export class AccountComponent {

    @HostBinding('class') class = 'body';

    tabs: Tab[] = [
        new Tab('common.generalInfo', 'profile', true, '', 'profile'),
        new Tab('accounts.publications', 'publications', true, '', 'publications'),
        // new Tab('accounts.chat', 'chat', true, '', 'chat'),
        new Tab('accounts.subscribers', 'members', false, '', 'members'),
        new Tab('deanon.deanon', 'deanon', true, '', 'deanon', 'deanon/osint'),
        // new Tab('accounts.connections', 'connections', true, '', 'connections'),
        // new Tab('common.history', 'history', true, '', 'history'),
    ];

    private storeFacadeService = inject(FacadeGeneralService);
    private modalService = inject(ModalService);
    private notificationService = inject(NotificationsService);
    private destroyRef = inject(DestroyRef);
    private monitoringApi = inject(MONITORING_API_TOKEN);
    private accountApiService = inject(AccountDetailApiService);
    private destroyed: Subject<void> = new Subject<void>();
    public bindingList: DeanonBinding[] = [];

    generalInfo = this.storeFacadeService.generalInfo;
    allowedPlatforms = signal(getPlatforms());

    constructor(private headerService: HeaderService, private router: Router,private facadeResultService: FacadeResultService,) {
        this.headerService.setTitle('accounts.account');
        this.headerService.isNavButtonsVisible = true;
        this.headerService.setBackFunction(() => {
            this.router.navigate(['/collections/accounts']);
        });
        this.facadeResultService.bindingList$.pipe(
            takeUntil(this.destroyed)
        ).subscribe((bindingList) => {
            this.bindingList = bindingList;
        });

        if (this.generalInfo().sourceType === 'MESSENGER' &&
                (this.generalInfo().platform === 'TELEGRAM' ||
                 this.generalInfo().platform === 'WHATSAPP')
        ) {
            this.setTabActive('members', false);
        } else {
            this.setTabActive('members', true);
        }
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
                    this.updateGeneralInfo();
                })
            }
        });
    }

    disableMonitoring(accountId: string) {
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
        this.accountApiService.getGeneralInfo(this.generalInfo().id).pipe(
            takeUntilDestroyed(this.destroyRef),
        ).subscribe((generalInfo) => {
            this.storeFacadeService.getGeneralInfo(generalInfo);
        })
    }

    private setTabActive(tabKey: string, isActive: boolean): void {
        this.tabs.forEach(tab => {
            if (tab.key === tabKey) {
                tab.active = isActive;
            }
        });
    }
}
