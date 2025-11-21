import { Routes } from "@angular/router";
import { provideStates } from '@ngxs/store';
import { GeneralState } from './group-detail/store/general/general.state';
import { GroupService } from './group-detail/api/group.service';
import { groupDetailResolver } from './group-detail/group-detail.resolver';
import { FacadeGeneralService } from './group-detail/store/general/facade-general.service';
import { profileResolver } from './group-detail/pages/general/profile.resolver';
import { FacadeAccountsService } from '../account/store/facade-accounts.service';
import { AccountListApi } from '../account/account-list/api/account-list.api';
import { AccountsState } from '../account/store/accounts.state';

export const routes: Routes = [
    {
        path: ':id',
        loadComponent: () => import('./group-detail/group.component').then(m => m.GroupComponent),
        providers: [
            GroupService,
            FacadeGeneralService,
            provideStates([GeneralState]),
        ],
        resolve: { groupDetail: groupDetailResolver },
        children: [
            {
                path: 'general-info',
                loadComponent: () => import('./group-detail/pages/general/general.component').then(m => m.GeneralComponent),
                resolve: { profile: profileResolver }
            },
            {
                path: 'members',
                loadComponent: () => import('./group-detail/pages/members/members.component').then(m => m.MembersComponent),
                providers: [
                    AccountListApi,
                    FacadeAccountsService,
                    provideStates([AccountsState])
                ]
            },
            {
                path: 'posts',
                loadComponent: () => import('./group-detail/pages/publications/publications.component').then(m => m.PublicationsComponent),
            },
            {
                path: '',
                redirectTo: 'general-info',
                pathMatch: 'full',
            }
        ]
    }
];
