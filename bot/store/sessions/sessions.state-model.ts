import { QueryParams } from "../../../../../core/common";
import { ServerResponse } from "../../../../../core/server-response";
import { Session } from "../../models/session";

export class SessionsStateModel {
    sessions: ServerResponse<Session>;
    queryParams: QueryParams;
    defaultQueryParams: QueryParams;
    isLoading: boolean;
    isLoaded: boolean;

    constructor() {
        this.sessions = new ServerResponse<Session>();
        this.queryParams = {};
        this.defaultQueryParams = { page: 0, size: 50 };
        this.isLoading = false;
        this.isLoaded = false;
    }
}