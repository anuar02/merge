import { Component, DestroyRef, HostBinding, inject, signal } from '@angular/core';
import { FacadeGeneralService } from './store/general/facade-general.service';
import { getPlatforms } from '../../mocks/allowed-platforms.mock';
import { HeaderService } from '../../../../core/services/header.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MONITORING_API_TOKEN } from '../../base/ui/monitoring-modal/monitoring-api.token';
import { AccountApiService } from '../shared/api/group-api.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AccountDetailApiService } from '../shared/api/account-detail-api.service';
import { Subject, takeUntil } from "rxjs";
import { FacadeResultService } from "../../../deanon/components/result/store/result.service";
import { DeanonBinding } from "../../../deanon/deanon";
import { CollectionCardComponent } from "../../collection/shared/card/card.component";
import { CommonModule } from '@angular/common';
import {TranslocoPipe} from "@jsverse/transloco";

@Component({
    selector: 'app-account',
    imports: [
        CollectionCardComponent,
        CommonModule,
        RouterLink,
        RouterLinkActive,
        RouterOutlet,
        TranslocoPipe,
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

    tabs = [
        { label: 'accounts.audienceAndPublications', route: 'audience' },
        { label: 'deanon.deanon', route: 'deanon/osint' }
    ];

    private storeFacadeService = inject(FacadeGeneralService);
    private destroyRef = inject(DestroyRef);
    private accountApiService = inject(AccountDetailApiService);
    private destroyed: Subject<void> = new Subject<void>();
    public bindingList: DeanonBinding[] = [];

    generalInfo = this.storeFacadeService.generalInfo;
    allowedPlatforms = signal(getPlatforms());

    constructor(private headerService: HeaderService, private router: Router, private facadeResultService: FacadeResultService) {
        this.headerService.setTitle('accounts.account');
        this.headerService.isNavButtonsVisible = true;
        this.headerService.setBackFunction(() => {
            this.router.navigate(['/collections-v2/accounts']);
        });
        this.facadeResultService.bindingList$.pipe(
            takeUntil(this.destroyed)
        ).subscribe((bindingList) => {
            this.bindingList = bindingList;
        });
    }

    updateGeneralInfo(): void {
        this.accountApiService.getGeneralInfo(this.generalInfo().id).pipe(
            takeUntilDestroyed(this.destroyRef),
        ).subscribe((generalInfo) => {
            this.storeFacadeService.getGeneralInfo(generalInfo);
        })
    }
}
