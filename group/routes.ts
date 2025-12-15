import { Routes } from "@angular/router";
import { provideStates } from '@ngxs/store';
import { GroupsState2 } from './group-list/store/groups.state';
import { FacadeGroupsService } from './group-list/store/facade-groups.service';
import { GroupListApiService } from './group-list/api/group-list-api.service';
import { GeneralState } from './group-detail/store/general/general.state';
import { GroupService } from './group-detail/api/group.service';
import { groupDetailResolver } from './group-detail/group-detail.resolver';
import { FacadeGeneralService } from './group-detail/store/general/facade-general.service';
import { profileResolver } from './group-detail/pages/general/profile.resolver';
import { FacadeAccountsService } from '../account/store/facade-accounts.service';
import { AccountListApi } from '../account/shared/account-list-api/account-list.api';
import { AccountsState2 } from '../account/store/accounts.state';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: ':id',
                loadComponent: () => import('./group-detail/group.component').then(m => m.GroupComponent),
                providers: [
                    GroupService,
                    FacadeGeneralService,
                    AccountListApi,
                    FacadeAccountsService,
                    provideStates([GeneralState, AccountsState2]),
                ],
                resolve: {
                    groupDetail: groupDetailResolver,
                    // profile: profileResolver
                }
            },
            {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
            }
        ]
    }
];
