import {inject, Injectable} from '@angular/core';
import {AccountGroupsPayload, GroupsPayload, SourceTypes} from "./models/groups";
import {forkJoin, map, Observable, of, switchMap} from "rxjs";
import {ServerResponse} from "../../../../../core/server-response";
import {GroupEntity} from '../../models/group.entity';
import {HttpClient} from '@angular/common/http';
import {OpenGroupRequestModel} from '../components/add-open-groups-modal/form.service';
import {QueryParams} from '../../../../../core/common';
import {catchError} from 'rxjs/operators';


@Injectable()
export class GroupListApiService {

    private http = inject(HttpClient);

    filterGroups(payload: GroupsPayload, params: QueryParams): Observable<ServerResponse<GroupEntity>> {
        return this.http.post<ServerResponse<GroupEntity>>('resources/group/filter', payload, {
            params: {
                ...params
            }
        }).pipe(
            switchMap((res  ) => {
                if (res.content.length === 0) {
                    return of(res);
                }
                return forkJoin(
                    res.content.map((item) => {
                        if (item.photo) {
                            return this.getPhotos(item.photo).pipe(
                                map((blob) => {
                                    return {
                                        ...item,
                                        photo: URL.createObjectURL(blob),
                                    }
                                }),
                                catchError(() => {
                                    return of({
                                        ...item,
                                        photo: 'assets/img/misc/person-avatar.png'
                                    })
                                })
                            )
                        } else {
                            return of({
                                ...item,
                                photo: 'assets/img/misc/person-avatar.png'
                            })
                        }
                    })
                ).pipe(map(content => ({
                    ...res,
                    content
                })));
            })
        );
    }

    getPhotos(path: string) {
        return this.http.get('resources/media', {params: {path}, responseType: 'blob'});
    }

    getSourceTypes(): Observable<SourceTypes[]> {
        return this.http.get<SourceTypes[]>('resources/group/source-types');
    }

    creatOpenGroup(payload: OpenGroupRequestModel): Observable<GroupEntity> {
        return this.http.post<GroupEntity>('resources/group', payload);
    }

    filterGroupsByAccountId(payload: AccountGroupsPayload, params: QueryParams): Observable<ServerResponse<GroupEntity>> {
        return this.http.post<ServerResponse<GroupEntity>>('resources/group/list', payload, {
            params: {
                ...params
            }
        }).pipe(
            switchMap((res  ) => {
                if (res.content.length === 0) {
                    return of(res);
                }
                return forkJoin(
                    res.content.map((item) => {
                        if (item.photo) {
                            return this.getPhotos(item.photo).pipe(
                                map((blob) => {
                                    return {
                                        ...item,
                                        photo: URL.createObjectURL(blob),
                                    }
                                }),
                                catchError(() => {
                                    return of({
                                        ...item,
                                        photo: 'assets/img/misc/person-avatar.png'
                                    })
                                })
                            )
                        } else {
                            return of({
                                ...item,
                                photo: 'assets/img/misc/person-avatar.png'
                            })
                        }
                    })
                ).pipe(map(content => ({
                    ...res,
                    content
                })));
            })
        );
    }
}
