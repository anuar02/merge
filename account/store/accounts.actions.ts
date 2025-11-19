import { QueryParams } from '../../../../core/common';

export class GetAccounts {
    static readonly type = '[Accounts] Get Accounts';
    constructor(public payload: any) {
    }
}

export class SetQueryParams {
    static readonly type = '[Accounts] Set Sorting Query Params';
    constructor(public queryParams: QueryParams) {
    }
}
