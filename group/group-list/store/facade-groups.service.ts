import { inject, Injectable, Signal } from "@angular/core";
import { select, Store } from "@ngxs/store";
import { GroupsPayload } from "../api/models/groups";
import { PageInfo, QueryParams } from "../../../../../core/common";
import { GetGroups, SetQueryParams } from "./groups.actions";
import { GroupsState } from "./groups.state";
import { GroupEntity } from '../../models/group.entity';

@Injectable()
export class FacadeGroupsService {
    private readonly store = inject(Store);

    isLoading: Signal<boolean> = select(GroupsState.getIsLoading);
    pageInfo: Signal<PageInfo> = select(GroupsState.getRequestsPageInfo);
    groups: Signal<GroupEntity[]> = select(GroupsState.getGroups);
    queryParams: Signal<QueryParams> = select(GroupsState.getQueryParams);

    getGroups = (payload: GroupsPayload) => this.store.dispatch(new GetGroups(payload));
    setQueryParams = (queryParams: QueryParams) => {
        this.store.dispatch(new SetQueryParams(queryParams));
    }
}
