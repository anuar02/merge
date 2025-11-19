import { inject, Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { patch } from "@ngxs/store/operators";
import { Observable, tap } from "rxjs";

import { GetGroups, ResetState, SetBotInfo } from "./bot-details.actions";
import { BotDetailsStateModel } from "./bot-details.state-model";
import { Bot } from "../../../models/bot";
import { ServerResponse } from "../../../../../../core/server-response";
import { BotService } from "../../../bot.service";
import { PageParams } from "../../../../../../shared/components/pagination-panel/pagination-panel";
import { GroupEntity } from "../../../../group/models/group.entity";

@State<BotDetailsStateModel>({
    name: 'botDetails',
    defaults: new BotDetailsStateModel()
})
@Injectable()
export class BotDetailsState {
    private botService = inject(BotService);
    
    @Selector()
    static getBotInfo(state: BotDetailsStateModel): Bot {
        return state.bot as Bot;
    }

    @Selector()
    static getGroupsContent(state: BotDetailsStateModel): GroupEntity[] {
        return state.groups.content;
    }

    @Selector()
    static getGroupsPageInfo(state: BotDetailsStateModel): any {
        return {
            totalElements: state.groups.totalElements,
            totalPages: state.groups.totalPages,
            pageParams: new PageParams(state.groups.number, state.groups.size)
        };
    }

    @Selector()
    static getIsLoading({ isLoading }: BotDetailsStateModel): boolean {
        return isLoading;
    }

    @Selector()
    static getIsLoaded({ isLoaded }: BotDetailsStateModel): boolean {
        return isLoaded;
    }

    @Action(SetBotInfo)
    setBotInfo(ctx: StateContext<BotDetailsStateModel>, { bot: botInfo } : SetBotInfo) {
        ctx.patchState({ bot: botInfo });
    }

    @Action(GetGroups)
    getGroups(ctx: StateContext<BotDetailsStateModel>, { payload, params }: GetGroups): Observable<ServerResponse<GroupEntity>> {
        const defaultParams = ctx.getState().defaultQueryParams;
        const parameters = params ? {...ctx.getState().queryParams, ...params} : defaultParams;
        const body = payload ? {...ctx.getState().payload, ...payload} : ctx.getState().payload;

        ctx.patchState({ isLoading: true, isLoaded: false });

        return this.botService.getBotGroups(body, parameters).pipe(
            tap({
                next: (res: ServerResponse<GroupEntity>) => {
                    ctx.setState(
                        patch<BotDetailsStateModel>({
                            groups: res,
                            queryParams: parameters,
                            payload: body,
                            isLoading: false,
                            isLoaded: true
                        })
                    );
                },
                error: () => {
                    ctx.patchState({ isLoading: false, isLoaded: false });
                }
            })
        );
    }

    @Action(ResetState)
    resetState(ctx: StateContext<BotDetailsStateModel>) {
        ctx.setState({ ...new BotDetailsStateModel() });
    }
}