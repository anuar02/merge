import { Routes } from '@angular/router';
import { AccountListApi } from './account-list/api/account-list.api';
import { FacadeAccountsService } from './store/facade-accounts.service';
import { provideStates } from '@ngxs/store';
import { AccountsState } from './store/accounts.state';
import { accountDetailResolver } from './account-detail/account-detail.resolver';
import { AccountDetailApiService } from './account-detail/api/account-detail-api.service';
import { FacadeGeneralService } from './account-detail/store/general/facade-general.service';
import { GeneralState } from './account-detail/store/general/general.state';
import { profileResolver } from './account-detail/components/general-info/profile.resolver';

export const routes: Routes = [
    {
        path: ':id',
        loadComponent: () => import('./account-detail/account.component').then(m => m.AccountComponent),
        resolve: { account: accountDetailResolver },
        providers: [
            AccountDetailApiService,
            FacadeGeneralService,
            provideStates([GeneralState])
        ],
        children: [
            {
                path: 'profile',
                loadComponent: () => import('./account-detail/components/general-info/general-info.component').then(m => m.GeneralInfoComponent),
                resolve: { profile: profileResolver }
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
                path: 'publications',
                loadComponent: () => import('./account-detail/pages/publications/publications.component').then(m => m.PublicationsComponent),
            },
            {
                path: 'members',
                loadComponent: () => import('./account-detail/pages/members/members.component').then(m => m.MembersComponent),
                providers: [
                    AccountListApi,
                    FacadeAccountsService,
                    provideStates([AccountsState])
                ]
            },
            {
                path: '',
                redirectTo: 'profile',
                pathMatch: 'full',
            }
        ]
    }
];
