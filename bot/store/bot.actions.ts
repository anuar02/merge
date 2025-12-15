import { QueryParams } from "../../../../core/common";
import { BotFilterPayload } from "../models/bot";

export class FilterBots {
    static readonly type = '[Bots] Filter Bots';
    constructor(public payload: BotFilterPayload, public params?: QueryParams) {}
}

export class GetBotInfo {
    static readonly type = '[Bots] Get Bot Info';
    constructor(public payload: BotFilterPayload) {}
}