import { inject, Injectable, Signal } from "@angular/core";
import { select, Store } from "@ngxs/store";

import { BotDetailsState } from "./bot-details.state";
import { Bot } from "../../../models/bot";
import { GetGroups, ResetState, SetBotInfo } from "./bot-details.actions";
import { QueryParams } from "../../../../../../core/common";
import { GroupEntity } from "../../../../group/models/group.entity";
import { GetGroupsPayload } from "../../../models/details";

@Injectable()
export class FacadeBotDetailsService {
    private readonly store = inject(Store);

    botInfo = this.store.selectSignal(BotDetailsState.getBotInfo);
    groupsContent: Signal<GroupEntity[]> = select(BotDetailsState.getGroupsContent);
    groupsPageInfo: Signal<any> = select(BotDetailsState.getGroupsPageInfo);
    isLoading: Signal<boolean> = select(BotDetailsState.getIsLoading);
    isLoaded: Signal<boolean> = select(BotDetailsState.getIsLoaded);

    getBotInfo = (bot: Bot) => this.store.dispatch(new SetBotInfo(bot));
    getGroups = (payload: GetGroupsPayload, params?: QueryParams) => this.store.dispatch(new GetGroups(payload, params));
    resetState = () => this.store.dispatch(new ResetState());
}