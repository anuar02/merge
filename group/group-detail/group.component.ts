import { Component, DestroyRef, HostBinding, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { Tab } from '../../../../shared/components/tabs/tabs';
import { HeaderService } from '../../../../core/services/header.service';
import { TableCardComponent } from '../shared/components/table-card/table-card.component';
import { FacadeGeneralService } from './store/general/facade-general.service';
import { getPlatforms } from '../../mocks/allowed-platforms.mock';
import { MonitoringModalComponent } from '../../base/ui/monitoring-modal/monitoring-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { MONITORING_API_TOKEN } from '../../base/ui/monitoring-modal/monitoring-api.token';
import { GroupApiService } from '../shared/api/group-api.service';
import { GroupService } from './api/group.service';

@Component({
    selector: 'app-group',
    imports: [
        TabsComponent, TableCardComponent
    ],
    templateUrl: './group.component.html',
    styleUrl: './group.component.scss',
    providers: [
        {
            provide: MONITORING_API_TOKEN,
            useClass: GroupApiService,
        }
    ]
})
export class GroupComponent {
    @HostBinding('class') class = 'body';
    title = 'Group';
    subtitle = 'Manage your group';

    private facadeGeneralService: FacadeGeneralService = inject(FacadeGeneralService);
    private modalService = inject(ModalService);
    private notificationService = inject(NotificationsService);
    private destroyRef = inject(DestroyRef);
    private monitoringApi = inject(MONITORING_API_TOKEN);
    groupService = inject(GroupService);

    generalInfo = this.facadeGeneralService.generalInfo;
    allowedPlatforms = signal(getPlatforms());

    tabs = [
        new Tab('common.generalInfo', 'general-info', true, '', 'general-info'),
        new Tab('accounts.headerTitle', 'members', true, '', 'members'),
        new Tab('accounts.publications', 'posts', true, '', 'posts'),
    ];

    constructor(private headerService: HeaderService, private router: Router) {
        this.headerService.setTitle('accounts.group');
        this.headerService.isNavButtonsVisible = true;

        const hiddenRouteData = window.history.state;
        this.headerService.setBackFunction(() => {            
            if (Object.hasOwn(hiddenRouteData, 'module') && hiddenRouteData['module'] === 'BOTS' && hiddenRouteData['id']) {
                this.router.navigate(['collections/bot', hiddenRouteData['id']]);
            } else {
                this.router.navigate(['collections/groups']);
            }
        });
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
                    this.updateGeneralInfo();
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
            );
            this.updateGeneralInfo();
        });
    }

    updateGeneralInfo(): void {
        this.groupService.getGeneralInfo(this.generalInfo().id).pipe(
            takeUntilDestroyed(this.destroyRef),
        ).subscribe((generalInfo) => {
            this.facadeGeneralService.updateGeneralInfo(generalInfo);
        });
    }
}
