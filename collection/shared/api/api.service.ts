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

    filterCollections(
        type: CollectionType,
        payload: CollectionPayload,
        params: QueryParams
    ): Observable<ServerResponse<CollectionEntity>> {
        const endpoint = this.getEndpointForType(type);

        const apiPayload = this.cleanPayload(payload);

        return this.http.post<ServerResponse<CollectionEntity>>(
            `resources-v2/${endpoint}/filter`,
            apiPayload,
            { params: { ...params } }
        ).pipe(
            map((res) => {
                res.content = res.content.map(item => ({
                    ...item,
                    photo: item.photo || this.getDefaultPhoto(type),
                    collectionType: type
                }));
                return res;
            })
        );
    }

    private cleanPayload(payload: any): any {
        const cleaned: any = {
            search: payload.search ?? "",
            platforms: payload.platforms ?? []
        };

        Object.keys(payload).forEach(key => {
            if (key === 'search' || key === 'platforms') {
                return;
            }

            const value = payload[key];

            if (value === null || value === undefined) {
                return;
            }

            if (Array.isArray(value)) {
                if (value.length > 0) {
                    cleaned[key] = value;
                }
            } else if (typeof value === 'object') {
                const objKeys = Object.keys(value);
                if (objKeys.length > 0) {
                    const hasValue = objKeys.some(k => {
                        const v = value[k];
                        return v !== null && v !== undefined && v !== '';
                    });
                    if (hasValue) {
                        cleaned[key] = value;
                    }
                }
            } else if (value !== '') {
                cleaned[key] = value;
            }
        });

        return cleaned;
    }

    getSourceTypes(): Observable<SourceTypes[]> {
        return this.http.get<SourceTypes[]>('resources/group/source-types');
    }

    private getEndpointForType(type: CollectionType): string {
        const endpoints: Record<CollectionType, string> = {
            'GROUP': 'group',
            'ACCOUNT': 'account',
            'BOT': 'bot'
        };
        return endpoints[type];
    }

    private getDefaultPhoto(type: CollectionType): string {
        const defaultPhotos: Record<CollectionType, string> = {
            'GROUP': 'assets/img/misc/group-avatar.png',
            'ACCOUNT': 'assets/img/misc/person-avatar.png',
            'BOT': 'assets/img/misc/bot-avatar.png'
        };
        return defaultPhotos[type] || 'assets/img/misc/person-avatar.png';
    }

    addToFolder(
        type: CollectionType,
        collectionId: string,
        folderId: string
    ): Observable<void> {
        const endpoint = this.getEndpointForType(type);

        return this.http.post<void>(
            `resources-v2/${endpoint}/${collectionId}/folder/${folderId}`,
            {}
        );
    }

    removeFromFolder(
        type: CollectionType,
        collectionId: string
    ): Observable<void> {
        const endpoint = this.getEndpointForType(type);

        return this.http.delete<void>(
            `resources-v2/${endpoint}/${collectionId}/folder`
        );
    }

    addToFavorites(
        type: CollectionType,
        collectionId: string
    ): Observable<void> {
        const endpoint = this.getEndpointForType(type);

        return this.http.post<void>(
            `resources-v2/${endpoint}/${collectionId}/favorite`,
            {}
        );
    }

    removeFromFavorites(
        type: CollectionType,
        collectionId: string
    ): Observable<void> {
        const endpoint = this.getEndpointForType(type);

        return this.http.delete<void>(
            `resources-v2/${endpoint}/${collectionId}/favorite`
        );
    }
}
