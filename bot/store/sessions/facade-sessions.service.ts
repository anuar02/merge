import { inject, Injectable, Signal } from "@angular/core";
import { select, Store } from "@ngxs/store";

import { BotSessionsState } from "./sessions.state";
import { Session } from "../../models/session";
import { QueryParams } from "../../../../../core/common";
import { GetSessions } from "./sessions.actions";

@Injectable()
export class FacadeSessionsService {
    private readonly store = inject(Store);

    sessionsContent: Signal<Session[]> = select(BotSessionsState.getSessionsContent);
    sessionsPageInfo: Signal<any> = select(BotSessionsState.getSessionsPageInfo);
    isLoading: Signal<boolean> = select(BotSessionsState.getIsLoading);
    isLoaded: Signal<boolean> = select(BotSessionsState.getIsLoaded);

    getSessions = (botId: string, params?: QueryParams) => this.store.dispatch(new GetSessions(botId, params));
}