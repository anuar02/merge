import { Component, computed, HostBinding, inject, OnDestroy, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { ViewSwitchComponent } from "../../../../shared/components/view-switch/view-switch.component";
import { SearchBarComponent } from "../../../../shared/components/search-bar/search-bar.component";
import { SvgIconComponent } from "../../../../shared/components/svg-icon/svg-icon.component";
import { ViewSwitch } from '../../../../shared/components/view-switch/view-switch';
import { HeaderService } from '../../../../core/services/header.service';
import { FacadeBotService } from '../store/facade-bot.service';
import { LoaderComponent } from "../../../deanon/components/loader/loader.component";
import { NotFoundComponent } from "../../../../shared/components/not-found/not-found.component";
import { TableComponent } from "../../../../shared/components/data-table/components/table/table.component";
import { PaginationPanelComponent } from "../../../../shared/components/pagination-panel/pagination-panel.component";
import { Column } from '../../../../shared/components/data-table/components/table/table';
import { Bot, columns } from '../models/bot';
import { BotCardComponent } from "../shared/components/bot-card/bot-card.component";
import { getPlatforms } from '../../mocks/allowed-platforms.mock';
import { DropdownItem } from '../../../../shared/components/dropdown/dropdown';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { AddBotModalComponent } from './components/add-bot-modal/add-bot-modal.component';
import { AddSessionModalComponent } from './components/add-session-modal/add-session-modal.component';
import { BotService } from '../bot.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { SessionsDrawerComponent } from "../shared/components/sessions-drawer/sessions-drawer.component";
import { FacadeSessionsService } from '../store/sessions/facade-sessions.service';

@Component({
    selector: 'app-bot-list',
    imports: [
        CommonModule,
        TranslocoPipe,
        ViewSwitchComponent,
        SearchBarComponent,
        SvgIconComponent,
        LoaderComponent,
        NotFoundComponent,
        TableComponent,
        PaginationPanelComponent,
        BotCardComponent,
        SessionsDrawerComponent
    ],
    templateUrl: './bot-list.component.html',
    // styleUrl: './bot-list.component.scss',
    providers: [TranslocoPipe]
})
export class BotListComponent implements OnInit, OnDestroy {
    @HostBinding('class') public class = 'body';

    private router = inject(Router);
    private facadeBotService = inject(FacadeBotService);
    private facadeSessionsService = inject(FacadeSessionsService);
    private modalService = inject(ModalService);
    private botService = inject(BotService);
    private notificationsService = inject(NotificationsService);
    private translocoPipe = inject(TranslocoPipe);
    private destroyed: Subject<void> = new Subject<void>();

    public columns: Column[] = columns;
    public data: Record<string, any>[] = [];
    public dataViewType: ViewSwitch = 'list';
    public dropdownItems: DropdownItem[] = [{
        label: 'bots.addSession',
        icon: 'icon-plus',
        value: 'addSession',
        onClick: (bot: Bot) => {
            this.modalService.showModal(AddSessionModalComponent, {
                allowOverlayClick: true,
                data: {
                    botId: bot.id,
                    botName: bot.name
                },
                whenClosed: (refresh) => {
                    if (refresh) {
                        setTimeout(() => this.facadeBotService.filterBots({}, { page: 0 }));
                    }
                }
            });
        }
    },
    { 
        label: 'bots.collectBotGroups',
        icon: 'icon-clipboard-download',
        value: 'collectGroups',
        onClick: (bot: Bot) => {
            this.botService.getSessions(bot.id).pipe(
                switchMap(sessions => this.botService.grabGroups(bot.id))
            ).subscribe({
                next: () => {
                    this.notificationsService.addNotification(
                        'success',
                        'bots.groupCollectionStartTitle',
                        `${this.translocoPipe.transform('bots.groupCollectionStart', { name: bot.name })}`,
                    );
                }
            });
        }
    }];
    public isSessionsDrawerActive = false;
    public botId = '';

    public allowedPlatforms = signal(getPlatforms());
    public selectedRows: WritableSignal<any[]> = signal([]);
    public selectedRowsIds: Signal<string[]> = computed(() => this.selectedRows().map(bot => bot.id));

    public bots$ = this.facadeBotService.content$;
    public pageInfo$ = this.facadeBotService.pageInfo$;
    public isLoading = this.facadeBotService.isLoading;
    public isLoaded = this.facadeBotService.isLoaded;
    public payload = this.facadeBotService.payload;

    public searchedText = this.payload().search || '';

    constructor(
        private headerService: HeaderService
    ) {
        this.headerService.setTitle('bots.bots');
        this.headerService.isNavButtonsVisible = false;

        this.facadeBotService.filterBots({});

        this.bots$.pipe(
            takeUntil(this.destroyed)
        ).subscribe(res => {
            this.data = res;
        });
    }

    ngOnInit(): void {
        if (!this.columns.some(obj => obj.key === 'actions')) {
            this.columns.push({
                key: 'actions',
                label: '',
                type: 'buttons',
                style: 'width: 8rem',
                dropdownItems: this.dropdownItems
            });
        }
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
    }

    public handleSearch(ev: { search: string }): void {
        this.searchedText = ev.search;
        this.facadeBotService.filterBots({ search: this.searchedText });
    }

    public handleChangePage(event: EventTarget | null | number): void {
        if (typeof event === 'number') {
            this.facadeBotService.filterBots({}, { page: event });
        }
    }

    public handleChangeItemsPerPage(event: EventTarget | null | number): void {
        if (typeof event === 'number') {
            this.facadeBotService.filterBots({}, { page: 0, size: event });
        }
    }

    public onSelectRow(index: number | string): void {
        let selectedBotRows = [...this.selectedRows()];
        const id = index as string;

        if (selectedBotRows.some(bot => bot.id === id)) {
            selectedBotRows = selectedBotRows.filter(item => item.id !== id);
        } else {
            const bot = this.data.find(item => item.id === id);
            if (bot) {
                selectedBotRows.push(bot);
            }
        }
        this.selectedRows.set(selectedBotRows);
    }

    public onSelectAll(): void {
        let selectedBotRows = [...this.selectedRows()];
        if (selectedBotRows.length === this.data.length) {
            selectedBotRows = [];
        } else {
            selectedBotRows = this.data.map(item => item);
        }
        this.selectedRows.set(selectedBotRows);
    }

    public onBotSelect(row: Bot): void {
        console.log(row);
    }

    public onViewChange(event: ViewSwitch): void {
        this.dataViewType = event;
    }

    public openBotModal(): void {
        this.modalService.showModal(AddBotModalComponent, {
            allowOverlayClick: true,
            whenClosed: (refresh) => {
                if (refresh) {
                    setTimeout(() => this.facadeBotService.filterBots({}, { page: 0 }));
                }
            }
        });
    }

    public goToBotDetails(id: string): void {
        this.router.navigate(['/collections-v2/bot', id]);
    }

    public openSessionsDrawer(botId: string): void {
        this.botId = botId;
        this.facadeSessionsService.getSessions(this.botId);

        this.isSessionsDrawerActive = true;
    }
}
