import { QueryParams } from "../../../../../../core/common";
import { CropsPayload, PingVpnNotificationPayload, SendToDeanonPayload } from "../../pages/deanon/deanon";

export class GetPingVpnTasks {
    static readonly type = '[Account-Deanon] Get Ping VPN Tasks';
    constructor(public accountId: string, public params?: QueryParams) {}
}

export class FilterPingVpnNotifications {
    static readonly type = '[Account-Deanon] Filter Ping VPN Notifications';
    constructor(public payload: PingVpnNotificationPayload, public params?: any) {}
}

export class FilterCalls {
    static readonly type = '[Account-Deanon] Filter Calls';
    constructor(public payload: SendToDeanonPayload, public params?: any) {}
}

export class FilterActivities {
    static readonly type = '[Account-Deanon] Filter Activities';
    constructor(public payload: SendToDeanonPayload, public params?: any) {}
}

export class GetPhotos {
    static readonly type = '[Account-Deanon] Get Photoss';
    constructor(public accountId: string, public params?: any) {}
}

export class FilterIdentifiedFaces {
    static readonly type = '[Account-Deanon] Filter Identified Faces';
    constructor(public accountId: string, public payload: CropsPayload, public params?: any) {}
}

export class GetPhotosSentToDeanon {
    static readonly type = '[Account-Deanon] Get Photos Sent To Deanon';
    constructor(public accountId: string, public params?: any) {}
}