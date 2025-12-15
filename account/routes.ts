import { AccountListApi } from './shared/account-list-api/account-list.api';
import { FacadeAccountsService } from './store/facade-accounts.service';
import { provideStates } from '@ngxs/store';
import { AccountsState2 } from './store/accounts.state';
import { accountDetailResolver } from './account-detail/account-detail.resolver';
import { AccountDetailApiService } from './shared/api/account-detail-api.service';
import { FacadeGeneralService } from './account-detail/store/general/facade-general.service';
import { GeneralState } from './account-detail/store/general/general.state';
import {Component} from "@angular/core";
import {Routes} from "@angular/router";

@Component({
    selector: 'app-empty',
    template: '',
    standalone: true
})
class EmptyComponent {}

export const routes: Routes = [
    {
        path: ':id',
        loadComponent: () => import('./account-detail/account.component').then(m => m.AccountComponent),
        resolve: { account: accountDetailResolver },
        providers: [
            AccountDetailApiService,
            FacadeGeneralService,
            provideStates([GeneralState]),
            AccountListApi,
            FacadeAccountsService,
            provideStates([AccountsState2])
        ],
        children: [
            {
                path: 'audience',
                loadComponent: () => import('./account-detail/pages/audience/audience.component').then(m => m.AudienceComponent),
                children: [
                    {
                        path: 'followers',
                        component: EmptyComponent
                    },
                    {
                        path: 'following',
                        component: EmptyComponent
                    },
                    {
                        path: 'mutual',
                        component: EmptyComponent
                    },
                    {
                        path: '',
                        redirectTo: 'followers',
                        pathMatch: 'full'
                    }
                ]
            },
            {
                path: 'deanon',
                loadComponent: () => import('./account-detail/pages/deanon/deanon.component').then(m => m.DeanonComponent),
                children: [
                    {
                        path: 'osint',
                        loadComponent: () => import('../../deanon/components/result/partials/osint/osint.component').then(m => m.OsintComponent)
                    },
                    {
                        path: 'photo',
                        loadComponent: () => import('../../deanon/components/result/partials/photo/photo.component').then(m => m.PhotoComponent)
                    },
                    {
                        path: 'matching',
                        loadComponent: () => import('../../deanon/components/result/partials/matching/matching.component').then(m => m.MatchingComponent)
                    },
                    {
                        path: 'calls',
                        loadComponent: () => import('../../deanon/components/result/partials/call/call.component').then(m => m.CallComponent)
                    },
                    {
                        path: 'phishing',
                        loadComponent: () => import('../../deanon/components/result/partials/phishing/phishing-in-accounts/phishing-in-accounts.component').then(m => m.PhishingInAccountsComponent),
                        children: [
                            {
                                path: 'ip',
                                loadComponent: () => import('../../deanon/components/result/partials/phishing/ip-results/ip-results.component').then(m => m.IpResultsComponent),
                            },
                            {
                                path: 'results',
                                loadComponent: () => import('../../deanon/components/result/partials/phishing/phishing.component').then(m => m.PhishingComponent)
                            }
                        ]
                    },
                    {
                        path: 'pingVpn',
                        loadComponent: () => import('../../deanon/components/result/partials/ping-vpn/ping-vpn.component').then(m => m.PingVpnComponent)
                    }
                ]
            },
            {
                path: '',
                redirectTo: 'audience',
                pathMatch: 'full',
            }
        ]
    }
];
