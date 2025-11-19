import { inject, Injectable, Signal } from '@angular/core';
import { select, Store } from '@ngxs/store';
import { map, Observable } from 'rxjs';

import { FilterActivities, FilterCalls, FilterIdentifiedFaces, FilterPingVpnNotifications, GetPhotos, GetPhotosSentToDeanon, GetPingVpnTasks } from './deanon.actions';
import { AccountDeanonState } from './deanon.state';
import { Activity, Call, CropsPayload, IdentifiedFace, Photo, PhotoSentToDeanon, PingVpnNotification, PingVpnNotificationPayload, PingVpnTask, SendToDeanonPayload } from '../../pages/deanon/deanon';
import { AccountDeanonStateModel } from './deanon.state-model';

@Injectable()
export class FacadeAccountDeanonService {
    private readonly store = inject(Store);

    state$: Observable<AccountDeanonStateModel> = inject(Store).select(AccountDeanonState.getState);

    pingVpnTasksContent = this.store.selectSignal(AccountDeanonState.getPingVpnTasksContent);
    pingVpnTasksPageInfo = this.store.selectSignal(AccountDeanonState.getPingVpnTasksPageInfo);
    pingVpnNotificationsContent = this.store.selectSignal(AccountDeanonState.getPingVpnNotificationsContent);
    pingVpnNotificationsPageInfo = this.store.selectSignal(AccountDeanonState.getPingVpnNotificationsPageInfo);
    
    callsContent$: Observable<Call[]> = inject(Store).select(AccountDeanonState.getCallsContent);
    callsPageInfo$: Observable<any> = inject(Store).select(AccountDeanonState.getCallsPageInfo);

    activitiesContent: Signal<Activity[]> = this.store.selectSignal(AccountDeanonState.getActivitiesContent);
    activitiesPageInfo: Signal<any> = this.store.selectSignal(AccountDeanonState.getActivitiesPageInfo);
    
    photosContent$: Observable<Photo[]> = inject(Store).select(AccountDeanonState.getPhotosContent);
    photosPageInfo$: Observable<any> = inject(Store).select(AccountDeanonState.getPhotosPageInfo);
    identifiedFacesContent$: Observable<IdentifiedFace[]> = inject(Store).select(AccountDeanonState.getIdentifiedFacesContent);
    identifiedFacesPageInfo$: Observable<any> = inject(Store).select(AccountDeanonState.getIdentifiedFacesPageInfo);
    photosSentToDeanonContent$: Observable<PhotoSentToDeanon[]> = inject(Store).select(AccountDeanonState.getPhotosSentToDeanonContent);
    photosSentToDeanonPageInfo$: Observable<any> = inject(Store).select(AccountDeanonState.getPhotosSentToDeanonPageInfo);

    isLoading$ = this.state$.pipe(map((e: AccountDeanonStateModel) => e.isLoading));
    isLoaded$ = this.state$.pipe(map((e: AccountDeanonStateModel) => e.isLoaded));

    isLoading: Signal<boolean> = select(AccountDeanonState.getIsLoading);
    isLoaded: Signal<boolean> = select(AccountDeanonState.getIsLoaded);
    
    getPingVpnTasks = (accountId: string, params?: any) => this.store.dispatch(new GetPingVpnTasks(accountId, params));

    filterPingVpnNotifications = (payload: PingVpnNotificationPayload, params?: any) => this.store.dispatch(new FilterPingVpnNotifications(payload, params));

    filterCalls = (payload: SendToDeanonPayload, params?: any) => this.store.dispatch(new FilterCalls(payload, params));

    filterActivities = (payload: SendToDeanonPayload, params?: any) => this.store.dispatch(new FilterActivities(payload, params));

    getPhotos = (accountId: string, params?: any) => this.store.dispatch(new GetPhotos(accountId, params));

    filterIdentifiedFaces = (accountId: string, payload: CropsPayload, params?: any) => this.store.dispatch(new FilterIdentifiedFaces(accountId, payload, params));

    getPhotosSentToDeanon = (accountId: string, params?: any) => this.store.dispatch(new GetPhotosSentToDeanon(accountId, params));
}
