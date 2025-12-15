import { inject, Injectable, Signal, computed } from '@angular/core';
import { select, Store } from '@ngxs/store';

import {
    GetCollections,
    SetQueryParams,
    SetActiveCollectionType,
    ResetCollections,
    AddToFolder,
    RemoveFromFolder,
    ToggleFavorite,
} from './collections.actions';
import { CollectionsState } from './collections.state';
import {
    CollectionEntity,
    CollectionPayload,
    CollectionType,
} from '../models/collection.entity';
import { PageInfo, QueryParams } from '../../../../core/common';
import { CollectionsStateModel } from './collections.state-model';
import { ServerResponse } from '../../../../core/server-response';
import { PageParams } from '../../../../shared/components/pagination-panel/pagination-panel';

@Injectable()
export class FacadeCollectionsService {
    private readonly store = inject(Store);

    private readonly stateSignal: Signal<CollectionsStateModel> =
        select(CollectionsState.getState);

    activeCollectionType: Signal<CollectionType> =
        select(CollectionsState.getActiveCollectionType);

    private getSlice(
        state: CollectionsStateModel,
        type: CollectionType,
    ): ServerResponse<CollectionEntity> {
        switch (type) {
            case 'GROUP':
                return state.groups;
            case 'ACCOUNT':
                return state.accounts;
            case 'BOT':
                return state.bots;
            default:
                return new ServerResponse<CollectionEntity>();
        }
    }

    private getLoading(state: CollectionsStateModel, type: CollectionType): boolean {
        switch (type) {
            case 'GROUP':
                return state.groupsLoading;
            case 'ACCOUNT':
                return state.accountsLoading;
            case 'BOT':
                return state.botsLoading;
            default:
                return false;
        }
    }

    private getQuery(state: CollectionsStateModel, type: CollectionType): QueryParams {
        switch (type) {
            case 'GROUP':
                return state.groupsQueryParams;
            case 'ACCOUNT':
                return state.accountsQueryParams;
            case 'BOT':
                return state.botsQueryParams;
            default:
                return { page: 0, size: 50, sort: 'lastCollectedAt,desc' };
        }
    }

    collections = computed<CollectionEntity[]>(() => {
        const state = this.stateSignal();
        const type = this.activeCollectionType();
        const slice = this.getSlice(state, type);
        return slice.content ?? [];
    });

    pageInfo = computed<PageInfo>(() => {
        const state = this.stateSignal();
        const type = this.activeCollectionType();
        const slice = this.getSlice(state, type);

        return {
            totalElements: slice.totalElements ?? 0,
            totalPages: slice.totalPages ?? 0,
            pageParams: new PageParams(
                slice.number ?? 0,
                slice.size ?? 50,
            ),
        };
    });

    isLoading = computed<boolean>(() => {
        const state = this.stateSignal();
        const type = this.activeCollectionType();
        return this.getLoading(state, type);
    });

    queryParams = computed<QueryParams>(() => {
        const state = this.stateSignal();
        const type = this.activeCollectionType();
        return this.getQuery(state, type);
    });

    getCollectionsByType(type: CollectionType): Signal<CollectionEntity[]> {
        return computed<CollectionEntity[]>(() => {
            const state = this.stateSignal();
            const slice = this.getSlice(state, type);
            return slice.content ?? [];
        });
    }

    getPageInfoByType(type: CollectionType): Signal<PageInfo> {
        return computed<PageInfo>(() => {
            const state = this.stateSignal();
            const slice = this.getSlice(state, type);

            return {
                totalElements: slice.totalElements ?? 0,
                totalPages: slice.totalPages ?? 0,
                pageParams: new PageParams(
                    slice.number ?? 0,
                    slice.size ?? 50,
                ),
            };
        });
    }

    getIsLoadingByType(type: CollectionType): Signal<boolean> {
        return computed<boolean>(() => {
            const state = this.stateSignal();
            return this.getLoading(state, type);
        });
    }

    getQueryParamsByType(type: CollectionType): Signal<QueryParams> {
        return computed<QueryParams>(() => {
            const state = this.stateSignal();
            return this.getQuery(state, type);
        });
    }

    groups: Signal<CollectionEntity[]> = select(CollectionsState.getGroups);
    accounts: Signal<CollectionEntity[]> = select(CollectionsState.getAccounts);
    bots: Signal<CollectionEntity[]> = select(CollectionsState.getBots);

    getCollections(type: CollectionType, payload: CollectionPayload) {
        return this.store.dispatch(new GetCollections(type, payload));
    }

    setQueryParams(type: CollectionType, queryParams: QueryParams) {
        return this.store.dispatch(new SetQueryParams(type, queryParams));
    }

    setActiveCollectionType(type: CollectionType) {
        return this.store.dispatch(new SetActiveCollectionType(type));
    }

    resetCollections(type: CollectionType) {
        return this.store.dispatch(new ResetCollections(type));
    }

    addToFolder(type: CollectionType, collectionId: string, folderId: string) {
        return this.store.dispatch(
            new AddToFolder(type, collectionId, folderId),
        );
    }

    removeFromFolder(type: CollectionType, collectionId: string) {
        return this.store.dispatch(
            new RemoveFromFolder(type, collectionId),
        );
    }

    toggleFavorite(type: CollectionType, collectionId: string, isFavorite: boolean) {
        return this.store.dispatch(
            new ToggleFavorite(type, collectionId, isFavorite),
        );
    }
}
