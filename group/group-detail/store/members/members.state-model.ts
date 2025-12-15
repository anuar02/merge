import { QueryParams } from '../../../../../../core/common';
import { ServerResponse } from '../../../../../../core/server-response';

export class MembersStateModel {
    members: ServerResponse<any>;
    queryParams: QueryParams;
    defaultQueryParams: QueryParams;
    isLoading: boolean;
    isLoaded: boolean;

    constructor() {
        this.members = new ServerResponse<any>();
        this.queryParams = {};
        this.defaultQueryParams = { page: 0, size: 10 };
        this.isLoading = false;
        this.isLoaded = false;
    }
}