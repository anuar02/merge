import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AccountProfileModel } from '../../models/account-profile.model';
import { AccountEntity } from '../../models/account.entity';
import { catchError } from 'rxjs/operators';
import { FilterPostsPayload, Post } from '../../account-detail/account';
import { MediaType } from '../../../group/models/group.entity';
import { ServerResponse } from '../../../../../core/server-response';

@Injectable()
export class AccountDetailApiService {

    private http = inject(HttpClient);

    getGeneralInfo(id: string): Observable<AccountEntity> {
        return this.http.get<AccountEntity>(`resources-v2/account/${id}`).pipe(
            switchMap((group) => {
                if (!group.photo) {
                    return of({
                        ...group,
                        photo: 'assets/img/misc/person-avatar.png'
                    })
                } else {
                    return this.getPhoto(group.photo).pipe(
                        map(blob => {
                            return {
                                ...group,
                                photo: URL.createObjectURL(blob)
                            }
                        }),
                        catchError(() => {
                            return of({
                                ...group,
                                photo: 'assets/img/misc/person-avatar.png'
                            })
                        })
                    );
                }
            }),
        );
    }

    getPhoto(path: string): Observable<Blob> {
        return this.http.get('resources/media', {params:{path}, responseType: 'blob'});
    }

    getProfile(id: string): Observable<AccountProfileModel> {
        return this.http.get<AccountProfileModel>(`resources-v2/account/${id}/profile`);
    }

    filterPosts(payload: FilterPostsPayload, params?: any): Observable<ServerResponse<Post>> {
        return this.http.post<ServerResponse<Post>>('resources/posts/filter', payload, { params });
    }

    getMediaTypes(): Observable<MediaType[]> {
        return this.http.get<MediaType[]>('resources/media/formats');
    }
}
