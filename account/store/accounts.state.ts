import { Action, Selector, State, StateContext } from "@ngxs/store";
import { AccountsStateModel } from "./accounts.state-model";
import { inject, Injectable } from "@angular/core";
import { GetAccounts, SetQueryParams } from "./accounts.actions";
import { Observable, tap } from "rxjs";
import { patch } from "@ngxs/store/operators";
import { AccountListApi } from '../shared/account-list-api/account-list.api';
import { AccountEntity } from '../models/account.entity';
import { PageInfo, QueryParams } from '../../../../core/common';
import { PageParams } from '../../../../shared/components/pagination-panel/pagination-panel';
import { ServerResponse } from '../../../../core/server-response';

@State<AccountsStateModel>({
    name: 'accounts2',
    defaults: new AccountsStateModel(),
})
@Injectable()
export class AccountsState2 {
    private apiService = inject(AccountListApi);

    @Selector()
    static getAccounts(state: AccountsStateModel): AccountEntity[] {
        return state.accounts.content;
    }

    @Selector()
    static getRequestsPageInfo(state: AccountsStateModel): PageInfo {
        return {
            totalElements: state.accounts.totalElements,
            totalPages: state.accounts.totalPages,
            pageParams: new PageParams(state.accounts.number, state.accounts.size)
        };
    }

    @Selector()
    static getIsLoading({ isLoading }: AccountsStateModel): boolean {
        return isLoading;
    }

    @Selector()
    static getQueryParams({ queryParams }: AccountsStateModel): QueryParams {
        return queryParams;
    }

    @Action(SetQueryParams)
    setSortingQueryParams(ctx: StateContext<AccountsStateModel>, { queryParams }: { queryParams: QueryParams }) {
        ctx.patchState({ queryParams });
    }

    @Action(GetAccounts)
    getGroups(ctx: StateContext<AccountsStateModel>, { payload }: GetAccounts): Observable<ServerResponse<AccountEntity>> {

        const queryParams = ctx.getState().queryParams;

        ctx.patchState({ isLoading: true });

        return this.apiService.filterAccounts(payload, queryParams).pipe(
            tap({
                next: (res: ServerResponse<AccountEntity>) => {
                    ctx.setState(
                        patch<AccountsStateModel>({
                            accounts: res,
                            isLoading: false,
                        })
                    );
                },
                error: () => {
                    ctx.patchState({ isLoading: false });
                }
            })
        );
    }
}
