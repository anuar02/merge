import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MembersStateModel } from './members.state-model';
import { QueryParams } from '../../../../../../core/common';
import { PageParams } from '../../../../../../shared/components/pagination-panel/pagination-panel';
import { GetMembers } from './members.actions';

@State<MembersStateModel>({
    name: 'members',
    defaults: new MembersStateModel()
})
@Injectable()
export class MembersState {

    @Selector()
    static getState(state: MembersStateModel): MembersStateModel {
        return state;
    }

    @Selector()
    static getDefaultQueryParams(state: MembersStateModel): QueryParams {
        return state.defaultQueryParams;
    }

    @Selector()
    static getMembersContent(state: MembersStateModel): any[] {
        return state.members.content;
    }

    @Selector()
    static getMembersPageInfo(state: MembersStateModel): any {
        return {
            totalElements: state.members.totalElements,
            totalPages: state.members.totalPages,
            pageParams: new PageParams(state.members.number, state.members.size)
        };
    }

    @Action(GetMembers)
    getMembers(ctx: StateContext<MembersStateModel>) {
        // const defaultParams = ctx.getState().defaultQueryParams;
        // const parameters = params ? {...ctx.getState().queryParams, ...params} : defaultParams;

        ctx.patchState({isLoading: true, isLoaded: false});
    }
}
