import { Action, Selector, State, StateContext } from '@ngxs/store';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
    GetCollections,
    SetQueryParams,
    SetActiveCollectionType,
    ResetCollections,
    AddToFolder,
    RemoveFromFolder,
    ToggleFavorite
} from './collections.actions';
import { CollectionsApiService } from "../shared/api/api.service";
import { CollectionEntity, CollectionType } from "../models/collection.entity";
import { PageInfo, QueryParams } from "../../../../core/common";
import { ServerResponse } from "../../../../core/server-response";
import { CollectionsStateModel } from "./collections.state-model";
import { PageParams } from "../../../../shared/components/pagination-panel/pagination-panel";

@State<CollectionsStateModel>({
    name: 'collections',
    defaults: new CollectionsStateModel(),
})
@Injectable()
export class CollectionsState {
    private apiService = inject(CollectionsApiService);

    @Selector()
    static getState(state: CollectionsStateModel): CollectionsStateModel {
        return state;
    }

    @Selector()
    static getCollectionsByType(state: CollectionsStateModel) {
        return (type: CollectionType): CollectionEntity[] => {
            if (!state || typeof state.getCollectionsForType !== 'function') {
                return [];
            }
            return state.getCollectionsForType(type).content || [];
        };
    }

    @Selector()
    static getPageInfoByType(state: CollectionsStateModel) {
        return (type: CollectionType): PageInfo => {
            if (!state || typeof state.getCollectionsForType !== 'function') {
                return {
                    totalElements: 0,
                    totalPages: 0,
                    pageParams: new PageParams(0, 50)
                };
            }
            const data = state.getCollectionsForType(type);
            return {
                totalElements: data.totalElements || 0,
                totalPages: data.totalPages || 0,
                pageParams: new PageParams(data.number || 0, data.size || 50)
            };
        };
    }

    @Selector()
    static getIsLoadingByType(state: CollectionsStateModel) {
        return (type: CollectionType): boolean => {
            if (!state || typeof state.getLoadingStateForType !== 'function') {
                return false;
            }
            return state.getLoadingStateForType(type);
        };
    }

    @Selector()
    static getQueryParamsByType(state: CollectionsStateModel) {
        return (type: CollectionType): QueryParams => {
            if (!state || typeof state.getQueryParamsForType !== 'function') {
                return { page: 0, size: 50, sort: 'lastCollectedAt,desc' };
            }
            return state.getQueryParamsForType(type);
        };
    }

    @Selector()
    static getActiveCollectionType(state: CollectionsStateModel): CollectionType {
        return state?.activeCollectionType || 'GROUP';
    }

    // Specific selectors for each type (for convenience)
    @Selector()
    static getGroups(state: CollectionsStateModel): CollectionEntity[] {
        return state?.groups?.content || [];
    }

    @Selector()
    static getAccounts(state: CollectionsStateModel): CollectionEntity[] {
        return state?.accounts?.content || [];
    }

    @Selector()
    static getBots(state: CollectionsStateModel): CollectionEntity[] {
        return state?.bots?.content || [];
    }

    // Actions
    @Action(GetCollections)
    getCollections(
        ctx: StateContext<CollectionsStateModel>,
        { collectionType, payload }: GetCollections
    ): Observable<ServerResponse<CollectionEntity>> {
        const state = ctx.getState();

        // Get query params directly without using the method
        let queryParams: QueryParams;
        switch (collectionType) {
            case 'GROUP':
                queryParams = state.groupsQueryParams;
                break;
            case 'ACCOUNT':
                queryParams = state.accountsQueryParams;
                break;
            case 'BOT':
                queryParams = state.botsQueryParams;
                break;
            default:
                queryParams = { page: 0, size: 50, sort: 'lastCollectedAt,desc' };
        }

        // Set loading state based on type
        const loadingPatch: Partial<CollectionsStateModel> = {};
        switch (collectionType) {
            case 'GROUP':
                loadingPatch.groupsLoading = true;
                break;
            case 'ACCOUNT':
                loadingPatch.accountsLoading = true;
                break;
            case 'BOT':
                loadingPatch.botsLoading = true;
                break;
        }
        ctx.patchState(loadingPatch);

        return this.apiService.filterCollections(collectionType, payload, queryParams).pipe(
            tap({
                next: (res: ServerResponse<CollectionEntity>) => {
                    const statePatch: Partial<CollectionsStateModel> = {};

                    switch (collectionType) {
                        case 'GROUP':
                            statePatch.groups = res;
                            statePatch.groupsLoading = false;
                            break;
                        case 'ACCOUNT':
                            statePatch.accounts = res;
                            statePatch.accountsLoading = false;
                            break;
                        case 'BOT':
                            statePatch.bots = res;
                            statePatch.botsLoading = false;
                            break;
                    }

                    ctx.patchState(statePatch);
                },
                error: () => {
                    const errorPatch: Partial<CollectionsStateModel> = {};
                    switch (collectionType) {
                        case 'GROUP':
                            errorPatch.groupsLoading = false;
                            break;
                        case 'ACCOUNT':
                            errorPatch.accountsLoading = false;
                            break;
                        case 'BOT':
                            errorPatch.botsLoading = false;
                            break;
                    }
                    ctx.patchState(errorPatch);
                }
            })
        );
    }

    @Action(SetQueryParams)
    setQueryParams(
        ctx: StateContext<CollectionsStateModel>,
        { collectionType, queryParams }: SetQueryParams
    ): void {
        const statePatch: Partial<CollectionsStateModel> = {};

        switch (collectionType) {
            case 'GROUP':
                statePatch.groupsQueryParams = queryParams;
                break;
            case 'ACCOUNT':
                statePatch.accountsQueryParams = queryParams;
                break;
            case 'BOT':
                statePatch.botsQueryParams = queryParams;
                break;
        }

        ctx.patchState(statePatch);
    }

    @Action(SetActiveCollectionType)
    setActiveCollectionType(
        ctx: StateContext<CollectionsStateModel>,
        { collectionType }: SetActiveCollectionType
    ): void {
        ctx.patchState({ activeCollectionType: collectionType });
    }

    @Action(ResetCollections)
    resetCollections(
        ctx: StateContext<CollectionsStateModel>,
        { collectionType }: ResetCollections
    ): void {
        const statePatch: Partial<CollectionsStateModel> = {};
        const emptyResponse = new ServerResponse<CollectionEntity>();

        switch (collectionType) {
            case 'GROUP':
                statePatch.groups = emptyResponse;
                statePatch.groupsQueryParams = { page: 0, size: 50, sort: 'lastCollectedAt,desc' };
                break;
            case 'ACCOUNT':
                statePatch.accounts = emptyResponse;
                statePatch.accountsQueryParams = { page: 0, size: 50, sort: 'lastCollectedAt,desc' };
                break;
            case 'BOT':
                statePatch.bots = emptyResponse;
                statePatch.botsQueryParams = { page: 0, size: 50, sort: 'lastCollectedAt,desc' };
                break;
        }

        ctx.patchState(statePatch);
    }

    @Action(AddToFolder)
    addToFolder(
        ctx: StateContext<CollectionsStateModel>,
        { collectionType, collectionId, folderId }: AddToFolder
    ): Observable<void> {
        return this.apiService.addToFolder(collectionType, collectionId, folderId).pipe(
            tap(() => {
                // Optionally refresh the collections list
                const payload = {};
                ctx.dispatch(new GetCollections(collectionType, payload));
            })
        );
    }

    @Action(RemoveFromFolder)
    removeFromFolder(
        ctx: StateContext<CollectionsStateModel>,
        { collectionType, collectionId }: RemoveFromFolder
    ): Observable<void> {
        return this.apiService.removeFromFolder(collectionType, collectionId).pipe(
            tap(() => {
                // Optionally refresh the collections list
                const payload = {};
                ctx.dispatch(new GetCollections(collectionType, payload));
            })
        );
    }

    @Action(ToggleFavorite)
    toggleFavorite(
        ctx: StateContext<CollectionsStateModel>,
        { collectionType, collectionId, isFavorite }: ToggleFavorite
    ): Observable<void> {
        const action = isFavorite
            ? this.apiService.addToFavorites(collectionType, collectionId)
            : this.apiService.removeFromFavorites(collectionType, collectionId);

        return action.pipe(
            tap(() => {
                // Optionally refresh the collections list
                const payload = {};
                ctx.dispatch(new GetCollections(collectionType, payload));
            })
        );
    }
}
