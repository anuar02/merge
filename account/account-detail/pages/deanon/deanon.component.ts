import { Component, HostBinding, inject, OnDestroy } from '@angular/core';

import { Tab } from '../../../../../../shared/components/tabs/tabs';
import { TabsComponent } from "../../../../../../shared/components/tabs/tabs.component";
import { environment } from '../../../../../../../environments/environment';
import {Observable, Subject, takeUntil} from "rxjs";
import {DeanonRequestParams} from "../../../../../deanon/deanon";
import {FacadeResultService} from "../../../../../deanon/components/result/store/result.service";
import { FacadeGeneralService } from '../../store/general/facade-general.service';

@Component({
    selector: 'app-deanon',
    imports: [
        TabsComponent
    ],
    templateUrl: './deanon.component.html',
    styleUrl: './deanon.component.scss'
})
export class DeanonComponent implements OnDestroy {
    @HostBinding('class') class = 'group group--nowrap group--expand';

    public tabs: Tab[] = [];
    public requestParams$: Observable<DeanonRequestParams>;
    private destroyed: Subject<void> = new Subject<void>();
    private storeFacadeService = inject(FacadeGeneralService);

    public generalInfo = this.storeFacadeService.generalInfo;
    public isOffline = environment.appType.toUpperCase() === 'OFFLINE';
    
    constructor(private facadeDeanonResultService: FacadeResultService) {
        this.requestParams$ = this.facadeDeanonResultService.requestParams$;

        this.requestParams$.pipe(
            takeUntil(this.destroyed)
        ).subscribe(res => {
            this.tabs = [];
            if(this.isOffline){
                if (res.osint) {
                    this.tabs.push(new Tab('OSINT', 'osint', true, '', 'osint'));
                }
                // if (res.photo) {
                //     this.tabs.push(new Tab('deanon.photo', 'photo', true, '', 'photo'));
                // }
                if (res.matching && res.matching.activityCount!==0) {
                    this.tabs.push(new Tab('deanon.matching', 'matching', true, '', 'matching'));
                }
                if (res.calls) {
                    this.tabs.push(new Tab('deanon.calls', 'call', true, '', 'calls'));
                }
                if (res.matching && res.matching.pingVpnCount!==0) {
                    this.tabs.push(new Tab('Ping VPN', 'pingVpn', true, '', 'pingVpn'));
                }
                if (res.phishing) {
                    this.tabs.push(new Tab('deanon.phishing', 'phishing', true, '', 'phishing/ip'));
                }

                this.facadeDeanonResultService.getBinding(this.generalInfo().deanonRequestId);
            } else {
                this.tabs = [
                    new Tab('OSINT', 'osint', true, '', 'osint'),
                    // new Tab('deanon.photo', 'photo', true, '', 'photo'),
                    new Tab('deanon.matching', 'matching', true, '', 'matching'),
                    // new Tab('deanon.calls', 'calls', true, '', 'calls'),
                    new Tab('Ping VPN', 'pingVpn', true, '', 'pingVpn'),
                    new Tab('deanon.phishing', 'phishing', true, '', 'phishing/ip'),
                ];
            }

        });
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
    }
}
