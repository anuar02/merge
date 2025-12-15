import { Component, DestroyRef, HostBinding, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from '../../../../core/services/header.service';
import { FacadeGeneralService } from './store/general/facade-general.service';
import { getPlatforms } from '../../mocks/allowed-platforms.mock';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { MONITORING_API_TOKEN } from '../../base/ui/monitoring-modal/monitoring-api.token';
import { GroupApiService } from '../shared/api/group-api.service';
import { GroupService } from './api/group.service';
import { PublicationsComponent } from './pages/publications/publications.component';
import {MembersComponent} from "./pages/members/members.component";
import {CollectionCardComponent} from "../../collection/shared/card/card.component";

@Component({
    selector: 'app-group',
    imports: [
        MembersComponent,
        CollectionCardComponent,
        PublicationsComponent
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

    constructor(private headerService: HeaderService, private router: Router) {
        this.headerService.setTitle('accounts.group');
        this.headerService.isNavButtonsVisible = true;

        const hiddenRouteData = window.history.state;
        this.headerService.setBackFunction(() => {
            if (Object.hasOwn(hiddenRouteData, 'module') && hiddenRouteData['module'] === 'BOTS' && hiddenRouteData['id']) {
                this.router.navigate(['bot', 'card', hiddenRouteData['id']]);
            } else {
                this.router.navigate(['collections-v2/groups']);
            }
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
