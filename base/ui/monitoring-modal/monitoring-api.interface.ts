import { Observable } from 'rxjs';
import { MonitoringDetails } from '../../../group/models/monitoring-details.model';

export interface IMonitoringApi {
    createMonitoring(subjectId: string, payload: MonitoringDetails): Observable<void>;
    removeMonitoring(subjectId: string): Observable<void>;
}