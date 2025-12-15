import { inject, Injectable, Signal } from "@angular/core";
import { select, Store } from "@ngxs/store";
import { GetAccounts, SetQueryParams } from "./accounts.actions";
import { AccountsState2 } from "./accounts.state";
import { AccountEntity } from '../models/account.entity';
import { PageInfo, QueryParams } from '../../../../core/common';

@Injectable()
export class FacadeAccountsService {
    private readonly store = inject(Store);

    isLoading: Signal<boolean> = select(AccountsState2.getIsLoading);
    pageInfo: Signal<PageInfo> = select(AccountsState2.getRequestsPageInfo);
    accounts: Signal<AccountEntity[]> = select(AccountsState2.getAccounts);
    queryParams: Signal<QueryParams> = select(AccountsState2.getQueryParams);

    getAccounts = (payload: any) => this.store.dispatch(new GetAccounts(payload));
    setQueryParams = (queryParams: QueryParams) => {
        this.store.dispatch(new SetQueryParams(queryParams));
    }
}
