import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { CollectionsState } from './store/collections.state';
import { FacadeCollectionsService } from './store/facade-collections.service';
import { CollectionsApiService } from "./shared/api/api.service";
import { CollectionFilterService } from "./shared/collection-filter/filter.service";
import {provideDirectoryCatalog} from "../../directory/presentation/directory-catalog-provider";

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./collections.component').then(m => m.CollectionsComponent),
        providers: [
            CollectionsApiService,
            FacadeCollectionsService,
            CollectionFilterService,
            provideStates([CollectionsState]),
        ],
        children: [
            {
                path: 'groups',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./collection-list/collection-list.component').then(m => m.CollectionListComponent),
                        data: { collectionType: 'GROUP' },
                        providers: [...provideDirectoryCatalog()],

                    },
                    {
                        path: '',
                        loadChildren: () => import('../group/routes').then(m => m.routes)
                    }
                ]
            },
            {
                path: 'accounts',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./collection-list/collection-list.component').then(m => m.CollectionListComponent),
                        data: { collectionType: 'ACCOUNT' },
                        providers: [...provideDirectoryCatalog()],
                    },
                    {
                        path: '',
                        loadChildren: () => import('../account/routes').then(m => m.routes)
                    }
                ]
            },
            {
                path: 'bots',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./collection-list/collection-list.component').then(m => m.CollectionListComponent),
                        data: { collectionType: 'BOT' }
                    },
                    {
                        path: '',
                        loadChildren: () => import('../bot/routes').then(m => m.routes)
                    }
                ]
            },
            {
                path: '',
                redirectTo: 'groups',
                pathMatch: 'full'
            }
        ]
    }
];
