import { inject, Injectable, Signal } from "@angular/core";
import { select, Store } from "@ngxs/store";
import { Observable } from "rxjs";

import { Bot, BotFilterPayload } from "../models/bot";
import { FilterBots } from "./bot.actions";
import { QueryParams } from "../../../../core/common";
import { BotState } from "./bot.state";

@Injectable()
export class FacadeBotService {
    private readonly store = inject(Store);

    content$: Observable<Bot[]> = inject(Store).select(BotState.getContent);
    pageInfo$: Observable<any> = inject(Store).select(BotState.getPageInfo);
    payload: Signal<BotFilterPayload> = select(BotState.getPayload);
    isLoading: Signal<boolean> = select(BotState.getIsLoading);
    isLoaded: Signal<boolean> = select(BotState.getIsLoaded);

    filterBots = (payload: BotFilterPayload, params?: QueryParams) => this.store.dispatch(new FilterBots(payload, params));
}