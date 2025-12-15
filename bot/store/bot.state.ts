import { Action, Selector, State, StateContext } from "@ngxs/store";
import { inject, Injectable } from "@angular/core";
import { patch } from "@ngxs/store/operators";
import { Observable, tap } from "rxjs";

import { BotStateModel } from "./bot.state-model";
import { FilterBots } from "./bot.actions";
import { ServerResponse } from "../../../../core/server-response";
import { Bot, BotFilterPayload } from "../models/bot";
import { BotService } from "../bot.service";
import { PageParams } from "../../../../shared/components/pagination-panel/pagination-panel";

@State<BotStateModel>({
    name: 'bots',
    defaults: new BotStateModel()
})
@Injectable()
export class BotState {

    private botService = inject(BotService);

    @Selector()
    static getState(state: BotStateModel): BotStateModel {
        return state;
    }

    @Selector()
    static getContent(state: BotStateModel): Bot[] {
        return state.bots.content;
    }

    @Selector()
    static getPageInfo(state: BotStateModel): any {
        return {
            totalElements: state.bots.totalElements,
            totalPages: state.bots.totalPages,
            pageParams: new PageParams(state.bots.number, state.bots.size)
        };
    }

    @Selector()
    static getIsLoading({ isLoading }: BotStateModel): boolean {
        return isLoading;
    }

    @Selector()
    static getIsLoaded({ isLoaded }: BotStateModel): boolean {
        return isLoaded;
    }

    @Selector()
    static getBot({ selectedBot }: BotStateModel): Bot {
        return selectedBot;
    }

    @Selector()
    static getPayload({ payload }: BotStateModel): BotFilterPayload {
        return payload;
    }

    @Action(FilterBots)
    filterRequests(ctx: StateContext<BotStateModel>, {
        payload,
        params
    }: FilterBots): Observable<ServerResponse<Bot>> {
        const defaultParams = ctx.getState().defaultQueryParams;
        const parameters = params ? {...ctx.getState().queryParams, ...params} : defaultParams;
        const body = payload ? {...ctx.getState().payload, ...payload} : {};

        ctx.patchState({ isLoading: true, isLoaded: false });

        return this.botService.filterBots(body, parameters).pipe(
            tap({
                next: (result: ServerResponse<Bot>) => {
                    ctx.setState(
                        patch<BotStateModel>({
                            bots: result,
                            payload: body,
                            queryParams: parameters,
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
}