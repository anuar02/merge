import { InjectionToken } from '@angular/core';
import { IMonitoringApi } from './monitoring-api.interface';

export const MONITORING_API_TOKEN = new InjectionToken<IMonitoringApi>('MONITORING_API_TOKEN');