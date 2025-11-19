import { ServerResponse } from "../../../../../core/server-response";
import { QueryParams } from "../../../../../core/common";
import { GroupEntity } from '../../models/group.entity';

export class GroupsStateModel {

    groups: ServerResponse<GroupEntity>;
    queryParams: QueryParams;
    isLoading: boolean;

    constructor() {
        this.groups = new ServerResponse<GroupEntity>();
        this.queryParams = { page: 0, size: 50, sort: 'createdAt,desc' };
        this.isLoading = false;
    }
}
