import {GroupsPayload} from "../api/models/groups";
import {QueryParams} from "../../../../../core/common";

export class GetGroups {
    static readonly type = '[Groups] Get Groups';
    constructor(public payload: GroupsPayload) {
    }
}

export class SetQueryParams {
    static readonly type = '[Groups] Set Sorting Query Params';
    constructor(public queryParams: QueryParams) {
    }
}
