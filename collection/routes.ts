import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { CollectionsState } from './store/collections.state';
import { FacadeCollectionsService } from './store/facade-collections.service';
import {CollectionsApiService} from "./shared/api/api.service";
import {CollectionFilterService} from "./shared/filter/filter.service";

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./collections.component').then(m => m.CollectionsComponent),
        providers: [
            CollectionsApiService,
            FacadeCollectionsService,
            CollectionFilterService,
            provideStates([CollectionsState])
        ],
        children: [
            {
                path: 'groups',
                loadComponent: () => import('./collection-list/collection-list.component').then(m => m.CollectionListComponent),
                data: { collectionType: 'GROUP' }
            },
            {
                path: 'accounts',
                loadComponent: () => import('./collection-list/collection-list.component').then(m => m.CollectionListComponent),
                data: { collectionType: 'ACCOUNT' }
            },
            {
                path: 'bots',
                loadComponent: () => import('./collection-list/collection-list.component').then(m => m.CollectionListComponent),
                data: { collectionType: 'BOT' }
            },
            {
                path: '',
                redirectTo: 'groups',
                pathMatch: 'full'
            }
        ]
    }
];
