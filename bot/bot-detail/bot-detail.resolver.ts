import { tap } from 'rxjs';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';

import { BotService } from '../bot.service';
import { Bot } from '../models/bot';
import { SetBotInfo } from './store/bot/bot-details.actions';

export const botDetailResolver = (route: ActivatedRouteSnapshot) => {

    const store = inject(Store);

    return inject(BotService).getBotDetails(route.paramMap.get('id') as string).pipe(
        tap((bot: Bot) => {
            store.dispatch(new SetBotInfo(bot));
        }),
    )
};