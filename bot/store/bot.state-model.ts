import { QueryParams } from "../../../../core/common";
import { ServerResponse } from "../../../../core/server-response";
import { Bot, BotFilterPayload } from "../models/bot";

export class BotStateModel {

    bots: ServerResponse<Bot>;
    queryParams: QueryParams;
    defaultQueryParams: QueryParams;
    payload: BotFilterPayload;
    isLoading: boolean;
    isLoaded: boolean;

    selectedBot: Bot;

    constructor() {
        this.bots = new ServerResponse<Bot>();
        this.queryParams = {};
        this.defaultQueryParams = { page: 0, size: 50 };
        this.payload = {};
        this.isLoading = false;
        this.isLoaded = false;

        this.selectedBot = {} as Bot;
    }
}