import { inject, Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { patch } from "@ngxs/store/operators";
import { Observable, tap } from "rxjs";

import { SessionsStateModel } from "./sessions.state-model";
import { BotService } from "../../bot.service";
import { PageParams } from "../../../../../shared/components/pagination-panel/pagination-panel";
import { Session } from "../../models/session";
import { GetSessions } from "./sessions.actions";

@State<SessionsStateModel>({
    name: 'botSessions',
    defaults: new SessionsStateModel()
})
@Injectable()
export class BotSessionsState {
    private botService = inject(BotService);

    @Selector()
    static getSessionsContent(state: SessionsStateModel): Session[] {
        return state.sessions.content;
    }

    @Selector()
    static getSessionsPageInfo(state: SessionsStateModel): any {
        return {
            totalElements: state.sessions.totalElements,
            totalPages: state.sessions.totalPages,
            pageParams: new PageParams(state.sessions.number, state.sessions.size)
        };
    }

    @Selector()
    static getIsLoading({ isLoading }: SessionsStateModel): boolean {
        return isLoading;
    }

    @Selector()
    static getIsLoaded({ isLoaded }: SessionsStateModel): boolean {
        return isLoaded;
    }

    @Action(GetSessions)
    getSessions(ctx: StateContext<SessionsStateModel>, { botId, params }: GetSessions): Observable<any> {
        const defaultParams = ctx.getState().defaultQueryParams;
        const parameters = params ? {...ctx.getState().queryParams, ...params} : defaultParams;

        ctx.patchState({ isLoading: true, isLoaded: false });

        return this.botService.getSessions(botId, parameters).pipe(
            tap({
                next: (res: any) => {
                    ctx.setState(
                        patch<SessionsStateModel>({
                            sessions: res,
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