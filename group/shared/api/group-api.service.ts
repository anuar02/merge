import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MonitoringDetails } from '../../models/monitoring-details.model';
import { catchError, firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
import { IMonitoringApi } from '../../../base/ui/monitoring-modal/monitoring-api.interface';
import { GetPostsPayload, MediaType, Post } from '../../models/group.entity';
import { ServerResponse } from '../../../../../core/server-response';

@Injectable()
export class GroupApiService implements IMonitoringApi {
    private http = inject(HttpClient);

    createMonitoring(groupId: string, payloadDto: MonitoringDetails): Observable<void> {
        return this.http.post<void>(`resources-v2/group/monitoring/${groupId}/create`, payloadDto);
    }

    removeMonitoring(groupId: string): Observable<void> {
        return this.http.post<void>(`resources-v2/group/monitoring/${groupId}/remove`, null);
    }

    getPosts(payload: GetPostsPayload, params?: any): Observable<ServerResponse<Post>> {
        return this.http.post<ServerResponse<Post>>('resources/posts/filter', payload, { params })
    }

    getMediaTypes(): Observable<MediaType[]> {
        return this.http.get<MediaType[]>('resources/media/formats');
    }

    getMedia(path: string): Promise<Blob> {
        return firstValueFrom(this.http.get('resources/media', {params:{path}, responseType: 'blob'}));
    }
}
