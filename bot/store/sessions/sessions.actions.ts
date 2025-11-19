import { QueryParams } from "../../../../../core/common";

export class GetSessions {
    static readonly type = '[Bot-Sessions] Get Sessions';
    constructor(public botId: string, public params?: QueryParams) {}
}