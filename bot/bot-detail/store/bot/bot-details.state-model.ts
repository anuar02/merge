import { QueryParams } from "../../../../../../core/common";
import { ServerResponse } from "../../../../../../core/server-response";
import { GroupEntity } from "../../../../group/models/group.entity";
import { Bot } from "../../../models/bot";
import { GetGroupsPayload } from "../../../models/details";

export class BotDetailsStateModel {
    bot: Bot | null;
    groups: ServerResponse<GroupEntity>;
    queryParams: QueryParams;
    defaultQueryParams: QueryParams;
    payload: GetGroupsPayload;
    isLoading: boolean;
    isLoaded: boolean;

    constructor() {
        this.bot = null;
        this.groups = new ServerResponse<GroupEntity>();
        this.queryParams = {};
        this.defaultQueryParams = { page: 0, size: 50 };
        this.payload = {};
        this.isLoading = false;
        this.isLoaded = false;
    }
}