import { AccountEntity } from '../models/account.entity';
import { ServerResponse } from '../../../../core/server-response';
import { QueryParams } from '../../../../core/common';

export class AccountsStateModel {

    accounts: ServerResponse<AccountEntity>;
    queryParams: QueryParams;
    isLoading: boolean;

    constructor() {
        this.accounts = new ServerResponse<AccountEntity>();
        this.queryParams = { page: 0, size: 50, sort: 'lastCollectedAt,desc' };
        this.isLoading = false;
    }
}
