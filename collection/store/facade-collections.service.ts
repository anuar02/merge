import { inject, Injectable, Signal } from '@angular/core';
import { select, Store } from '@ngxs/store';
import { computed } from '@angular/core';

import {
    GetCollections,
    SetQueryParams,
    SetActiveCollectionType,
    ResetCollections,
    AddToFolder,
    RemoveFromFolder,
    ToggleFavorite
} from './collections.actions';
import { CollectionsState } from './collections.state';
import { CollectionEntity, CollectionPayload, CollectionType } from '../models/collection.entity';
import {PageInfo, QueryParams} from "../../../../core/common";

@Injectable()
export class FacadeCollectionsService {
    private readonly store = inject(Store);

    // Active collection type
    activeCollectionType: Signal<CollectionType> = select(CollectionsState.getActiveCollectionType);

    // Create computed signals for current active type
    collections = computed(() => {
        const type = this.activeCollectionType();
        return this.store.selectSnapshot(CollectionsState.getCollectionsByType)(type);
    });

    pageInfo = computed(() => {
        const type = this.activeCollectionType();
        return this.store.selectSnapshot(CollectionsState.getPageInfoByType)(type);
    });

    isLoading = computed(() => {
        const type = this.activeCollectionType();
        return this.store.selectSnapshot(CollectionsState.getIsLoadingByType)(type);
    });

    queryParams = computed(() => {
        const type = this.activeCollectionType();
        return this.store.selectSnapshot(CollectionsState.getQueryParamsByType)(type);
    });

    // Specific type signals (for components that need direct access)
    groups: Signal<CollectionEntity[]> = select(CollectionsState.getGroups);
    accounts: Signal<CollectionEntity[]> = select(CollectionsState.getAccounts);
    bots: Signal<CollectionEntity[]> = select(CollectionsState.getBots);

    // Methods to get data for specific types
    getCollectionsByType(type: CollectionType): Signal<CollectionEntity[]> {
        return computed(() => {
            return this.store.selectSnapshot(CollectionsState.getCollectionsByType)(type);
        });
    }

    getPageInfoByType(type: CollectionType): Signal<PageInfo> {
        return computed(() => {
            return this.store.selectSnapshot(CollectionsState.getPageInfoByType)(type);
        });
    }

    getIsLoadingByType(type: CollectionType): Signal<boolean> {
        return computed(() => {
            return this.store.selectSnapshot(CollectionsState.getIsLoadingByType)(type);
        });
    }

    getQueryParamsByType(type: CollectionType): Signal<QueryParams> {
        return computed(() => {
            return this.store.selectSnapshot(CollectionsState.getQueryParamsByType)(type);
        });
    }

    // Action dispatchers
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
        return this.store.dispatch(new AddToFolder(type, collectionId, folderId));
    }

    removeFromFolder(type: CollectionType, collectionId: string) {
        return this.store.dispatch(new RemoveFromFolder(type, collectionId));
    }

    toggleFavorite(type: CollectionType, collectionId: string, isFavorite: boolean) {
        return this.store.dispatch(new ToggleFavorite(type, collectionId, isFavorite));
    }
}
