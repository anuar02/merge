import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Method } from '../../../../deanon/deanon';
import {
    Call,
    SendToDeanonPayload,
    DeanonInitPayload,
    SendToDeanonWithParamsPayload,
    AccountDeanonInfo,
    PingVpnTaskPayload,
    Activity,
    Photo,
    CropsPayload,
    IdentifiedFace,
    PhotoSentToDeanon,
    PingVpnNotificationPayload,
    PingVpnNotification
} from '../../account-detail/pages/deanon/deanon';
import { ServerResponse } from '../../../../../core/server-response';
import { CallFileParsed } from '../../../../deanon/components/create/deanon-create';

@Injectable({
    providedIn: 'root',
})
export class DeanonApiService {

    private http = inject(HttpClient);

    initDeanon(payload: DeanonInitPayload): Observable<void> {
        return this.http.post<void>('resources/account-deanon/init', payload);
    }

    sendToDeanon(payload: SendToDeanonPayload): Observable<void> {
        return this.http.post<void>('resources/account-deanon/send', payload);
    }

    // for Calls and Ping VPN
    sendToDeanonWithParams(payload: SendToDeanonWithParamsPayload): Observable<void> {
        return this.http.post<void>('resources/account-deanon/send/params', payload);
    }

    filterCalls(payload: SendToDeanonPayload, params?: any): Observable<ServerResponse<Call>> {
        return this.http.post<ServerResponse<Call>>('resources/account-deanon/calls', payload, { params });
    }

    getExampleFile(method: Method): Observable<any> {
        return this.http.get(`resources-v2/account-deanon/example?method=${method}`, { responseType: 'blob' });
    }

    parseCall(file: File): Observable<CallFileParsed> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<CallFileParsed>('resources/account-deanon/parse/call', formData, {
            params: {
                timezoneOffset: -(new Date().getTimezoneOffset() / 60),
            },
        });
    }

    getPingVpnTasks(accountId: string, params?: any): Observable<any> {
        return this.http.get(`resources-v2/account-deanon/${accountId}/ping_vpn/tasks`, { params });
    }

    getPingVpnTasksCount(accountId: string): Observable<any> {
        return this.http.get(`resources-v2/account-deanon/${accountId}/ping_vpn/tasks/count`);
    }

    filterPingVpnNotifications(payload: PingVpnNotificationPayload, params?: any): Observable<ServerResponse<PingVpnNotification>> {
        return this.http.post<ServerResponse<PingVpnNotification>>('resources/account-deanon/ping_vpn', payload, { params });
    }

    getAccountDeanonInfo(accountId: string, method: Method): Observable<AccountDeanonInfo> {
        return this.http.get<AccountDeanonInfo>(`resources-v2/account-deanon/${accountId}?method=${method}`);
    }

    addPingVpnTask(payload: PingVpnTaskPayload): Observable<void> {
        return this.http.post<void>('resources/account-deanon/ping_vpn/add_task', payload);
    }

    filterActivities(payload: SendToDeanonPayload, params?: any): Observable<ServerResponse<Activity>> {
        return this.http.post<ServerResponse<Activity>>('resources/account-deanon/activities', payload, { params });
    }

    getPhotos(accountId: string, params?: any): Observable<ServerResponse<Photo>> {
        return this.http.post<ServerResponse<Photo>>(`resources-v2/account-deanon/photos/${accountId}`, {}, { params });
    }

    filterIdentifiedFaces(accountId: string, payload: CropsPayload,  params?: any): Observable<ServerResponse<IdentifiedFace>> {
        return this.http.post<ServerResponse<IdentifiedFace>>(`resources-v2/account-deanon/crops/${accountId}`, payload, { params });
    }

    sendPhotosToDeanon(payload: SendToDeanonPayload): Observable<void> {
        return this.http.post<void>('resources/account-deanon/crops/send', payload);
    }

    getPhotosSentToDeanon(accountId: string, params?: any): Observable<ServerResponse<PhotoSentToDeanon>> {
        return this.http.get<ServerResponse<PhotoSentToDeanon>>(`resources-v2/account-deanon/crops/params/${accountId}`, { params });
    }

    downloadActivities(accountId: string): Observable<HttpResponse<Blob>>  {
        return this.http.get(`resources-v2/account-deanon/download/activities/${accountId}`, {
            observe: 'response',
            responseType: 'blob',
            params: {
                timezoneOffset: -(new Date().getTimezoneOffset() / 60),
            },
        });
    }

    downloadPingVpn(accountId: string, taskId: string): Observable<HttpResponse<Blob>>  {
        return this.http.get(`resources-v2/account-deanon/download/ping_vpn/${accountId}/${taskId}`, {
            observe: 'response',
            responseType: 'blob',
            params: {
                timezoneOffset: -(new Date().getTimezoneOffset() / 60),
            },
        });
    }
}
