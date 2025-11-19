import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ServerResponse } from '../../../../../core/server-response';
import { QueryParams } from '../../../../../core/common';
import {CollectionEntity, CollectionPayload, CollectionType} from "../../models/collection.entity";
import {SourceTypes} from "../../../group/group-list/api/models/groups";

@Injectable({
    providedIn: 'root'
})
export class CollectionsApiService {
    private http = inject(HttpClient);

    // Unified filter method that works for all collection types
    filterCollections(
        type: CollectionType,
        payload: CollectionPayload,
        params: QueryParams
    ): Observable<ServerResponse<CollectionEntity>> {
        const endpoint = this.getEndpointForType(type);

        return this.http.post<ServerResponse<CollectionEntity>>(
            `resources/${endpoint}/filter`,
            { ...payload, collectionType: type },
            { params: { ...params } }
        ).pipe(
            switchMap((res) => {
                if (res.content.length === 0) {
                    return of(res);
                }
                return forkJoin(
                    res.content.map((item) => this.enrichWithPhoto(item, type))
                ).pipe(
                    map(content => ({ ...res, content }))
                );
            })
        );
    }

    // Get single collection by ID
    getCollectionById(
        type: CollectionType,
        id: string
    ): Observable<CollectionEntity> {
        const endpoint = this.getEndpointForType(type);

        return this.http.get<CollectionEntity>(`resources/${endpoint}/${id}`).pipe(
            switchMap((collection) => this.enrichWithPhoto(collection, type))
        );
    }

    // Create new collection
    createCollection(
        type: CollectionType,
        payload: any
    ): Observable<CollectionEntity> {
        const endpoint = this.getEndpointForType(type);

        return this.http.post<CollectionEntity>(
            `resources/${endpoint}`,
            { ...payload, collectionType: type }
        );
    }

    // Update collection
    updateCollection(
        type: CollectionType,
        id: string,
        payload: Partial<CollectionEntity>
    ): Observable<CollectionEntity> {
        const endpoint = this.getEndpointForType(type);

        return this.http.put<CollectionEntity>(
            `resources/${endpoint}/${id}`,
            payload
        );
    }

    // Delete collection
    deleteCollection(
        type: CollectionType,
        id: string
    ): Observable<void> {
        const endpoint = this.getEndpointForType(type);

        return this.http.delete<void>(`resources/${endpoint}/${id}`);
    }

    // Get source types (platforms)
    getSourceTypes(): Observable<SourceTypes[]> {
        return this.http.get<SourceTypes[]>('resources/group/source-types');
    }

    // Search collections
    searchCollections(
        type: CollectionType,
        searchItems: { username: string; platform: string }[]
    ): Observable<{ username: string; collection: CollectionEntity }[]> {
        const endpoint = this.getEndpointForType(type);

        return this.http.post<{ username: string; collection: CollectionEntity }[]>(
            `resources/${endpoint}/search`,
            searchItems
        );
    }

    // Private helper methods
    private getEndpointForType(type: CollectionType): string {
        const endpoints: Record<CollectionType, string> = {
            'GROUP': 'group',
            'ACCOUNT': 'account',
            'BOT': 'bot'
        };
        return endpoints[type];
    }

    private enrichWithPhoto(
        item: CollectionEntity,
        type: CollectionType
    ): Observable<CollectionEntity> {
        if (!item.photo) {
            return of({
                ...item,
                photo: this.getDefaultPhoto(type),
                collectionType: type
            });
        }

        return this.getPhoto(item.photo).pipe(
            map(blob => ({
                ...item,
                photo: URL.createObjectURL(blob),
                collectionType: type
            })),
            catchError(() => of({
                ...item,
                photo: this.getDefaultPhoto(type),
                collectionType: type
            }))
        );
    }

    private getPhoto(path: string): Observable<Blob> {
        return this.http.get('resources/media', {
            params: { path },
            responseType: 'blob'
        });
    }

    private getDefaultPhoto(type: CollectionType): string {
        const defaultPhotos: Record<CollectionType, string> = {
            'GROUP': 'assets/img/misc/group-avatar.png',
            'ACCOUNT': 'assets/img/misc/person-avatar.png',
            'BOT': 'assets/img/misc/bot-avatar.png'
        };
        return defaultPhotos[type] || 'assets/img/misc/person-avatar.png';
    }

    // Folder operations
    addToFolder(
        type: CollectionType,
        collectionId: string,
        folderId: string
    ): Observable<void> {
        const endpoint = this.getEndpointForType(type);

        return this.http.post<void>(
            `resources/${endpoint}/${collectionId}/folder/${folderId}`,
            {}
        );
    }

    removeFromFolder(
        type: CollectionType,
        collectionId: string
    ): Observable<void> {
        const endpoint = this.getEndpointForType(type);

        return this.http.delete<void>(
            `resources/${endpoint}/${collectionId}/folder`
        );
    }

    // Favorites operations
    addToFavorites(
        type: CollectionType,
        collectionId: string
    ): Observable<void> {
        const endpoint = this.getEndpointForType(type);

        return this.http.post<void>(
            `resources/${endpoint}/${collectionId}/favorite`,
            {}
        );
    }

    removeFromFavorites(
        type: CollectionType,
        collectionId: string
    ): Observable<void> {
        const endpoint = this.getEndpointForType(type);

        return this.http.delete<void>(
            `resources/${endpoint}/${collectionId}/favorite`
        );
    }
}
