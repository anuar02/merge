import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';
import { FacadeBotService } from './store/facade-bot.service';
import { botDetailResolver } from './bot-detail/bot-detail.resolver';
import { BotDetailsState } from './bot-detail/store/bot/bot-details.state';
import { FacadeBotDetailsService } from './bot-detail/store/bot/facade-bot-details.service';
import { FacadeSessionsService } from './store/sessions/facade-sessions.service';
import { BotSessionsState } from './store/sessions/sessions.state';

export const routes: Routes = [
    {
        path: ':id',
        loadComponent: () => import('./bot-detail/bot-detail.component').then(m => m.BotDetailComponent),
        resolve: { bot: botDetailResolver },
        providers: [
            FacadeBotService,
            FacadeBotDetailsService,
            FacadeSessionsService,
            provideStates([BotDetailsState, BotSessionsState])
        ]
    }
];
