import { Action, Selector, State, StateContext } from "@ngxs/store";
import { GroupsStateModel } from "./groups.state-model";
import { inject, Injectable } from "@angular/core";
import { GroupListApiService } from "../api/group-list-api.service";
import { GetGroups, SetQueryParams } from "./groups.actions";
import { Observable, tap } from "rxjs";
import { ServerResponse } from "../../../../../core/server-response";
import { PageInfo, QueryParams } from "../../../../../core/common";
import { patch } from "@ngxs/store/operators";
import { PageParams } from "../../../../../shared/components/pagination-panel/pagination-panel";
import { GroupEntity } from '../../models/group.entity';

@State<GroupsStateModel>({
    name: 'groups2',
    defaults: new GroupsStateModel(),
})
@Injectable()
export class GroupsState2 {
    private groupsService = inject(GroupListApiService);

    @Selector()
    static getGroups(state: GroupsStateModel): GroupEntity[] {
        return state.groups.content;
    }

    @Selector()
    static getRequestsPageInfo(state: GroupsStateModel): PageInfo {
        return {
            totalElements: state.groups.totalElements,
            totalPages: state.groups.totalPages,
            pageParams: new PageParams(state.groups.number, state.groups.size)
        };
    }

    @Selector()
    static getIsLoading({ isLoading }: GroupsStateModel): boolean {
        return isLoading;
    }

    @Selector()
    static getQueryParams({ queryParams }: GroupsStateModel): QueryParams {
        return queryParams;
    }

    @Action(SetQueryParams)
    setSortingQueryParams(ctx: StateContext<GroupsStateModel>, { queryParams }: { queryParams: QueryParams }) {
        ctx.patchState({ queryParams });
    }

    @Action(GetGroups)
    getGroups(ctx: StateContext<GroupsStateModel>, { payload }: GetGroups): Observable<ServerResponse<GroupEntity>> {

        const queryParams = ctx.getState().queryParams;

        ctx.patchState({ isLoading: true });

        return this.groupsService.filterGroups(payload, queryParams).pipe(
            tap({
                next: (res: ServerResponse<GroupEntity>) => {
                    ctx.setState(
                        patch<GroupsStateModel>({
                            groups: res,
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
