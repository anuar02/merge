import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { GroupEntity } from '../../models/group.entity';
import { HttpClient } from '@angular/common/http';
import { ProfileModel } from '../../models/profile.model';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GroupService {

    private http = inject(HttpClient);

    getGeneralInfo(id: string): Observable<GroupEntity> {
        return this.http.get<GroupEntity>(`resources-v2/group/${id}`).pipe(
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

    getProfile(id: string): Observable<ProfileModel> {
        return this.http.get<ProfileModel>(`resources-v2/group/${id}/profile`);
    }
}
