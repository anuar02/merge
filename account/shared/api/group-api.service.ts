import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IMonitoringApi } from '../../../base/ui/monitoring-modal/monitoring-api.interface';
import { MonitoringDetails } from '../../../group/models/monitoring-details.model';

@Injectable()
export class AccountApiService implements IMonitoringApi {
    private http = inject(HttpClient);

    createMonitoring(groupId: string, payloadDto: MonitoringDetails): Observable<void> {
        return this.http.post<void>(`resources-v2/account/monitoring/${groupId}/create`, payloadDto);
    }

    removeMonitoring(groupId: string): Observable<void> {
        return this.http.post<void>(`resources-v2/account/monitoring/${groupId}/remove`, null);
    }
}
