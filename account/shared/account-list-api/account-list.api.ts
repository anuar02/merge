import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ServerResponse} from '../../../../../core/server-response';
import {AccountEntity, AccountPayload} from '../../models/account.entity';
import {forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {QueryParams} from '../../../../../core/common';
import {SourceTypes} from '../../../group/group-list/api/models/groups';
import {catchError} from 'rxjs/operators';

@Injectable()
export class AccountListApi {
    private http = inject(HttpClient);

    filterAccounts(payload: AccountPayload, params: QueryParams): Observable<ServerResponse<AccountEntity>> {
        return this.http.post<ServerResponse<AccountEntity>>('resources/account/filter', payload, {
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
                ).pipe(map(content => {
                    return {
                        ...res,
                        content
                    };
                }));
            })
        );
    }

    getPhotos(path: string) {
        return this.http.get('resources/media', {params: {path}, responseType: 'blob'});
    }

    getSourceTypes(): Observable<SourceTypes[]> {
        return this.http.get<SourceTypes[]>('resources/group/source-types');
    }

    createAccount(payload: any): Observable<AccountEntity> {
        return this.http.post<AccountEntity>('resources/account', payload);
    }
}
