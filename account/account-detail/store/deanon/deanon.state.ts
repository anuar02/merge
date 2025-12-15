import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { Observable, tap } from 'rxjs';

import { AccountDeanonStateModel } from './deanon.state-model';
import { FilterActivities, FilterCalls, FilterIdentifiedFaces, FilterPingVpnNotifications, GetPhotos, GetPhotosSentToDeanon, GetPingVpnTasks } from './deanon.actions';
import { DeanonApiService } from '../../../shared/api/deanon-api.service';
import { Activity, Call, IdentifiedFace, Photo, PhotoSentToDeanon, PingVpnNotification, PingVpnTask } from '../../pages/deanon/deanon';
import { PageParams } from '../../../../../../shared/components/pagination-panel/pagination-panel';
import { ServerResponse } from '../../../../../../core/server-response';
import { DeanonStatusCode } from '../../../../../../shared/components/status-badge/status';

@State<AccountDeanonStateModel>({
    name: 'accountDeanon',
    defaults: new AccountDeanonStateModel()
})
@Injectable()
export class AccountDeanonState {

    constructor(
        private deanonService: DeanonApiService
    ) {
    }

    @Selector()
    static getState(state: AccountDeanonStateModel): AccountDeanonStateModel {
        return state;
    }

    @Selector()
    static getPingVpnTasksContent(state: AccountDeanonStateModel): PingVpnTask[] {
        return state.pingVpnTasks.content;
    }

    @Selector()
    static getPingVpnTasksPageInfo(state: AccountDeanonStateModel): any {
        return {
            totalElements: state.pingVpnTasks.totalElements,
            totalPages: state.pingVpnTasks.totalPages,
            pageParams: new PageParams(state.pingVpnTasks.number, state.pingVpnTasks.size)
        };
    }

    @Selector()
    static getPingVpnNotificationsContent(state: AccountDeanonStateModel): PingVpnNotification[] {
        return state.pingVpnNotifications.content;
    }

    @Selector()
    static getPingVpnNotificationsPageInfo(state: AccountDeanonStateModel): any {
        return {
            totalElements: state.pingVpnNotifications.totalElements,
            totalPages: state.pingVpnNotifications.totalPages,
            pageParams: new PageParams(state.pingVpnNotifications.number, state.pingVpnNotifications.size)
        };
    }

    @Selector()
    static getCallsContent(state: AccountDeanonStateModel): Call[] {
        return state.calls.content;
    }

    @Selector()
    static getCallsPageInfo(state: AccountDeanonStateModel): any {
        return {
            totalElements: state.calls.totalElements,
            totalPages: state.calls.totalPages,
            pageParams: new PageParams(state.calls.number, state.calls.size)
        };
    }

    @Selector()
    static getActivitiesContent(state: AccountDeanonStateModel): Activity[] {
        return state.activities.content;
    }

    @Selector()
    static getActivitiesPageInfo(state: AccountDeanonStateModel): any {
        return {
            totalElements: state.activities.totalElements,
            totalPages: state.activities.totalPages,
            pageParams: new PageParams(state.activities.number, state.activities.size)
        };
    }

    @Selector()
    static getPhotosContent(state: AccountDeanonStateModel): Photo[] {
        return state.photos.content;
    }

    @Selector()
    static getPhotosPageInfo(state: AccountDeanonStateModel): any {
        return {
            totalElements: state.photos.totalElements,
            totalPages: state.photos.totalPages,
            pageParams: new PageParams(state.photos.number, state.photos.size)
        };
    }

    @Selector()
    static getIdentifiedFacesContent(state: AccountDeanonStateModel): IdentifiedFace[] {
        return state.identifiedFaces.content;
    }

    @Selector()
    static getIdentifiedFacesPageInfo(state: AccountDeanonStateModel): any {
        return {
            totalElements: state.identifiedFaces.totalElements,
            totalPages: state.identifiedFaces.totalPages,
            pageParams: new PageParams(state.identifiedFaces.number, state.identifiedFaces.size)
        };
    }

    @Selector()
    static getPhotosSentToDeanonContent(state: AccountDeanonStateModel): PhotoSentToDeanon[] {
        return state.photosSentToDeanon.content;
    }

    @Selector()
    static getPhotosSentToDeanonPageInfo(state: AccountDeanonStateModel): any {
        return {
            totalElements: state.photosSentToDeanon.totalElements,
            totalPages: state.photosSentToDeanon.totalPages,
            pageParams: new PageParams(state.photosSentToDeanon.number, state.photosSentToDeanon.size)
        };
    }

    @Selector()
    static getIsLoading({ isLoading }: AccountDeanonStateModel): boolean {
        return isLoading;
    }
    
    @Selector()
    static getIsLoaded({ isLoaded }: AccountDeanonStateModel): boolean {
        return isLoaded;
    }
    
    @Action(GetPingVpnTasks)
    getPingVpnTasks(ctx: StateContext<AccountDeanonStateModel>, { accountId, params }: GetPingVpnTasks): Observable<any> {
        const defaultParams = ctx.getState().pingVpnTasksDefaultQueryParams;
        const parameters = params ? {...ctx.getState().pingVpnTasksQueryParams, ...params} : defaultParams;

        ctx.patchState({ isLoading: true, isLoaded: false });

        return this.deanonService.getPingVpnTasks(accountId, parameters).pipe(
            tap({
                next: (result: any) => {
                    ctx.setState(
                        patch<AccountDeanonStateModel>({
                            pingVpnTasks: result,
                            pingVpnTasksQueryParams: parameters,
                            isLoading: false,
                            isLoaded: true
                        })
                    );
                },
                error: () => {
                    ctx.patchState({ isLoading: false, isLoaded: false });
                }
            })
        );
    }

    @Action(FilterPingVpnNotifications)
    filterPingVpnNotifications(ctx: StateContext<AccountDeanonStateModel>, { payload, params }: FilterPingVpnNotifications): Observable<ServerResponse<PingVpnNotification>> {
        const defaultParams = ctx.getState().pingVpnNotificationsDefaultQueryParams;
        const parameters = params ? {...ctx.getState().pingVpnNotificationsQueryParams, ...params} : defaultParams;
        const body = payload ? {...ctx.getState().pingVpnNotificationsPayload, ...payload} : ctx.getState().pingVpnNotificationsPayload;

        ctx.patchState({ isLoading: true, isLoaded: false });

        return this.deanonService.filterPingVpnNotifications(body, parameters).pipe(
            tap({
                next: (result: ServerResponse<PingVpnNotification>) => {
                    ctx.setState(
                        patch<AccountDeanonStateModel>({
                            pingVpnNotifications: result,
                            pingVpnNotificationsQueryParams: parameters,
                            pingVpnNotificationsPayload: body,
                            isLoading: false,
                            isLoaded: true
                        })
                    );
                },
                error: () => {
                    ctx.patchState({isLoading: false, isLoaded: false});
                }
            })
        );
    }

    @Action(FilterCalls)
    filterCalls(ctx: StateContext<AccountDeanonStateModel>, { payload, params }: FilterCalls) {
        const defaultParams = ctx.getState().callsDefaultQueryParams;
        const parameters = params ? {...ctx.getState().callsQueryParams, ...params} : defaultParams;
        const body = payload ? {...ctx.getState().callsPayload, ...payload} : ctx.getState().callsPayload;

        return this.deanonService.filterCalls(body, parameters).pipe(
            tap({
                next: (result: ServerResponse<Call>) => {
                    ctx.setState(
                        patch<AccountDeanonStateModel>({
                            calls: result,
                            callsQueryParams: parameters,
                            callsPayload: body,
                            // isLoading: false,
                            // isLoaded: true
                        })
                    );
                },
                error: (err) => {
                    console.error(err);
                    // ctx.patchState({isLoading: false, isLoaded: false});
                },
            })
        );
    }

    @Action(FilterActivities)
    filterActivities(ctx: StateContext<AccountDeanonStateModel>, { payload, params }: FilterActivities) {
        const defaultParams = ctx.getState().activitiesDefaultQueryParams;
        const parameters = params ? {...ctx.getState().activitiesQueryParams, ...params} : defaultParams;
        const body = payload ? {...ctx.getState().activitiesPayload, ...payload} : ctx.getState().activitiesPayload;

        return this.deanonService.filterActivities(body, parameters).pipe(
            tap({
                next: (result: ServerResponse<Activity>) => {
                    ctx.setState(
                        patch<AccountDeanonStateModel>({
                            activities: result,
                            activitiesQueryParams: parameters,
                            activitiesPayload: body,
                            // isLoading: false,
                            // isLoaded: true
                        })
                    );
                },
                error: (err) => {
                    console.error(err);
                    // ctx.patchState({isLoading: false, isLoaded: false});
                },
            })
        );
    }

    @Action(GetPhotos)
    getPhotos(ctx: StateContext<AccountDeanonStateModel>, { accountId, params }: GetPhotos): Observable<ServerResponse<Photo>> {
        const defaultParams = ctx.getState().photosDefaultQueryParams;
        const parameters = params ? {...ctx.getState().photosQueryParams, ...params} : defaultParams;

        return this.deanonService.getPhotos(accountId, parameters).pipe(
            tap({
                next: (result: ServerResponse<Photo>) => {
                    ctx.setState(
                        patch<AccountDeanonStateModel>({
                            photos: result,
                            photosQueryParams: parameters
                        })
                    );
                },
                error: () => {
                    // ctx.patchState({isLoading: false, isLoaded: false});
                }
            })
        );
    }

    @Action(FilterIdentifiedFaces)
    filterIdentifiedFaces(ctx: StateContext<AccountDeanonStateModel>, { accountId, payload, params }: FilterIdentifiedFaces): Observable<ServerResponse<IdentifiedFace>> {
        const defaultParams = ctx.getState().identifiedFacesDefaultQueryParams;
        const parameters = params ? {...ctx.getState().identifiedFacesQueryParams, ...params} : defaultParams;
        const body = payload ? {...ctx.getState().identifiedFacesPayload, ...payload} : ctx.getState().identifiedFacesPayload;

        ctx.patchState({ isLoading: true, isLoaded: false });

        return this.deanonService.filterIdentifiedFaces(accountId, payload, parameters).pipe(
            tap({
                next: (result: ServerResponse<IdentifiedFace>) => {
                    ctx.setState(
                        patch<AccountDeanonStateModel>({
                            identifiedFaces: result,
                            identifiedFacesQueryParams: parameters,
                            identifiedFacesPayload: body,
                            isLoading: false,
                            isLoaded: true
                        })
                    );
                },
                error: () => {
                    ctx.patchState({ isLoading: false, isLoaded: false });
                }
            })
        );
    }

    @Action(GetPhotosSentToDeanon)
    getPhotosSentToDeanon(ctx: StateContext<AccountDeanonStateModel>, { accountId, params }: GetPhotosSentToDeanon): Observable<ServerResponse<PhotoSentToDeanon>> {
        const defaultParams = ctx.getState().photosSentToDeanonDefaultQueryParams;
        const parameters = params ? {...ctx.getState().photosSentToDeanonQueryParams, ...params} : defaultParams;

        return this.deanonService.getPhotosSentToDeanon(accountId, parameters).pipe(
            tap({
                next: (result: ServerResponse<PhotoSentToDeanon>) => {
                    ctx.setState(
                        patch<AccountDeanonStateModel>({
                            photosSentToDeanon: result,
                            photosSentToDeanonQueryParams: parameters
                        })
                    );

                    const photosSentToDeanon = ctx.getState().photosSentToDeanon;
                    
                    photosSentToDeanon.content.forEach((v) => {
                        v['status'] = DeanonStatusCode.sent;
                    });
                    ctx.setState(
                        patch<AccountDeanonStateModel>({
                            photosSentToDeanon: photosSentToDeanon,
                        })
                    );
                },
                error: () => {
                    // ctx.patchState({isLoading: false, isLoaded: false});
                }
            })
        );
    }
}
