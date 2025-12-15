import { QueryParams } from '../../../../../../core/common';
import { ServerResponse } from '../../../../../../core/server-response';
import {
    Activity,
    Call,
    CropsPayload,
    IdentifiedFace,
    Photo,
    PhotoSentToDeanon,
    PingVpnNotification,
    PingVpnNotificationPayload,
    PingVpnTask,
    SendToDeanonPayload
} from '../../pages/deanon/deanon';

export class AccountDeanonStateModel {
    pingVpnTasks: ServerResponse<PingVpnTask>;
    pingVpnTasksDefaultQueryParams: QueryParams;
    pingVpnTasksQueryParams: QueryParams;
    pingVpnNotifications: ServerResponse<PingVpnNotification>;
    pingVpnNotificationsDefaultQueryParams: QueryParams;
    pingVpnNotificationsQueryParams: QueryParams;
    pingVpnNotificationsPayload: PingVpnNotificationPayload;

    calls: ServerResponse<Call>;
    callsDefaultQueryParams: QueryParams;
    callsQueryParams: QueryParams;
    callsPayload: SendToDeanonPayload;

    activities: ServerResponse<Activity>;
    activitiesDefaultQueryParams: QueryParams;
    activitiesQueryParams: QueryParams;
    activitiesPayload: SendToDeanonPayload;

    photos: ServerResponse<Photo>;
    photosDefaultQueryParams: QueryParams;
    photosQueryParams: QueryParams;
    identifiedFaces: ServerResponse<IdentifiedFace>;
    identifiedFacesDefaultQueryParams: QueryParams;
    identifiedFacesQueryParams: QueryParams;
    identifiedFacesPayload: CropsPayload;
    photosSentToDeanon: ServerResponse<PhotoSentToDeanon>;
    photosSentToDeanonDefaultQueryParams: QueryParams;
    photosSentToDeanonQueryParams: QueryParams;

    isLoading: boolean;
    isLoaded: boolean;
    
    constructor() {
        this.pingVpnTasks = new ServerResponse<PingVpnTask>();
        this.pingVpnTasksDefaultQueryParams = { page: 0, size: 20, sort: 'createdAt,desc' };
        this.pingVpnTasksQueryParams = {};
        this.pingVpnNotifications = new ServerResponse<PingVpnNotification>();
        this.pingVpnNotificationsDefaultQueryParams = { page: 0, size: 50, sort: 'eventTs,desc' };
        this.pingVpnNotificationsQueryParams = {};
        this.pingVpnNotificationsPayload = {} as PingVpnNotificationPayload;

        this.calls = new ServerResponse<Call>();
        this.callsDefaultQueryParams = { page: 0, size: 50 };
        this.callsQueryParams = {};
        this.callsPayload = {};

        this.activities = new ServerResponse<Activity>();
        this.activitiesDefaultQueryParams = { page: 0, size: 1000 };
        this.activitiesQueryParams = {};
        this.activitiesPayload = {};

        this.photos = new ServerResponse<Photo>();
        this.photosDefaultQueryParams = { page: 0, size: 1000 };
        this.photosQueryParams = {};
        this.identifiedFaces = new ServerResponse<Photo>();
        this.identifiedFacesDefaultQueryParams = { page: 0, size: 1000 };
        this.identifiedFacesQueryParams = {};
        this.identifiedFacesPayload = {};
        this.photosSentToDeanon = new ServerResponse<PhotoSentToDeanon>();
        this.photosSentToDeanonDefaultQueryParams = { page: 0, size: 50 };
        this.photosSentToDeanonQueryParams = {};

        this.isLoading = false;
        this.isLoaded = false;
    }
}