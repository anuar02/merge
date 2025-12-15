import { QueryParams } from "../../../../../../core/common";
import { Bot } from "../../../models/bot";
import { GetGroupsPayload } from "../../../models/details";

export class SetBotInfo {
    static readonly type = '[Bot] Set Bot Info';
    constructor(public bot: Bot) {}
}

export class GetGroups {
    static readonly type = '[Bot] Get Groups';
    constructor(public payload: GetGroupsPayload, public params?: QueryParams) {}
}

export class ResetState {
    static readonly type = '[Bot] Reset State';
    constructor() {}
}