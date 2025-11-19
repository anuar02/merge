import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';

import { BotState } from './store/bot.state';
import { FacadeBotService } from './store/facade-bot.service';
import { botDetailResolver } from './bot-detail/bot-detail.resolver';
import { BotDetailsState } from './bot-detail/store/bot/bot-details.state';
import { FacadeBotDetailsService } from './bot-detail/store/bot/facade-bot-details.service';
import { FacadeSessionsService } from './store/sessions/facade-sessions.service';
import { BotSessionsState } from './store/sessions/sessions.state';

export const routes: Routes = [
    {
        path: '',
        providers: [
            FacadeSessionsService,
            provideStates([BotSessionsState])
        ],
        children: [{
            path: 'list',
            loadComponent: () => import('./bot-list/bot-list.component').then(m => m.BotListComponent),
            providers: [
                FacadeBotService,
                provideStates([BotState])
            ]
        },
        {
            path: 'card/:id',
            loadComponent: () => import('./bot-detail/bot-detail.component').then(m => m.BotDetailComponent),
            resolve: { bot: botDetailResolver },
            providers: [
                FacadeBotService,
                FacadeBotDetailsService,
                provideStates([BotDetailsState])
            ]
        },
        {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full'
        }]
    }
]