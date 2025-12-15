import { CommonModule } from "@angular/common";
import { Component, computed, DestroyRef, HostBinding, inject, OnDestroy, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { Router } from "@angular/router";
import { TranslocoPipe } from "@jsverse/transloco";
import { switchMap } from "rxjs";

import { BotCardComponent } from "../shared/components/bot-card/bot-card.component";
import { DropdownItem } from "../../../../shared/components/dropdown/dropdown";
import { Bot } from "../models/bot";
import { getPlatforms } from "../../mocks/allowed-platforms.mock";
import { FacadeBotDetailsService } from "./store/bot/facade-bot-details.service";
import { LoaderComponent } from "../../../deanon/components/loader/loader.component";
import { NotFoundComponent } from "../../../../shared/components/not-found/not-found.component";
import { PaginationPanelComponent } from "../../../../shared/components/pagination-panel/pagination-panel.component";
import { TableComponent } from "../../../../shared/components/data-table/components/table/table.component";
import { ViewSwitchComponent } from "../../../../shared/components/view-switch/view-switch.component";
import { ViewSwitch } from "../../../../shared/components/view-switch/view-switch";
import { Column } from "../../../../shared/components/data-table/components/table/table";
import { columns } from "../models/details";
import { TableCardComponent } from "../../group/shared/components/table-card/table-card.component";
import { ModalService } from "../../../../shared/components/modal/modal.service";
import { MonitoringModalComponent } from "../../base/ui/monitoring-modal/monitoring-modal.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MONITORING_API_TOKEN } from "../../base/ui/monitoring-modal/monitoring-api.token";
import { NotificationsService } from "../../../../shared/services/notifications.service";
import { GroupApiService } from "../../group/shared/api/group-api.service";
import { HeaderService } from "../../../../core/services/header.service";
import { SessionsDrawerComponent } from "../shared/components/sessions-drawer/sessions-drawer.component";
import { FacadeSessionsService } from "../store/sessions/facade-sessions.service";
import { SearchBarComponent } from "../../../../shared/components/search-bar/search-bar.component";
import { AddSessionModalComponent } from "../bot-list/components/add-session-modal/add-session-modal.component";
import { BotService } from "../bot.service";
import { FacadeBotService } from "../store/facade-bot.service";

@Component({
    selector: 'app-bot-detail',
    imports: [
        CommonModule,
        TranslocoPipe,
        // SvgIconComponent,
        BotCardComponent,
        LoaderComponent,
        NotFoundComponent,
        PaginationPanelComponent,
        TableComponent,
        ViewSwitchComponent,
        TableCardComponent,
        SessionsDrawerComponent,
        SearchBarComponent
    ],
    templateUrl: './bot-detail.component.html',
    // styleUrl: './bot-detail.component.scss',
    providers: [
        {
            provide: MONITORING_API_TOKEN,
            useClass: GroupApiService,
        },
        TranslocoPipe
    ]
})
export class BotDetailComponent implements OnInit, OnDestroy {
    @HostBinding('class') public class = 'body';

    private facadeBotDetailsService = inject(FacadeBotDetailsService);
    private modalService = inject(ModalService);
    private monitoringApi = inject(MONITORING_API_TOKEN);
    private notificationService = inject(NotificationsService);
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);
    private facadeSessionsService = inject(FacadeSessionsService);
    private botService = inject(BotService);
    private translocoPipe = inject(TranslocoPipe);
    private facadeBotService = inject(FacadeBotService);

    public botInfo = this.facadeBotDetailsService.botInfo;
    public groups = this.facadeBotDetailsService.groupsContent;
    public pageInfo = this.facadeBotDetailsService.groupsPageInfo;
    public isLoading = this.facadeBotDetailsService.isLoading;
    public isLoaded = this.facadeBotDetailsService.isLoaded;

    public dataViewType: ViewSwitch = 'list';
    public columns: Column[] = columns;
    public selectedRows: WritableSignal<any[]> = signal([]);
    public selectedRowsIds: Signal<string[]> = computed(() => this.selectedRows().map(group => group.id));
    public isSessionsDrawerActive = false;
    public searchedText = '';

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
                    this.notificationService.addNotification(
                        'success',
                        'bots.groupCollectionStartTitle',
                        `${this.translocoPipe.transform('bots.groupCollectionStart', { name: bot.name })}`,
                    );
                }
            });
        }
    }];

    public allowedPlatforms = signal(getPlatforms());

    constructor(
        private headerService: HeaderService
    ) {
        this.headerService.setTitle('bots.bots');
        this.headerService.isNavButtonsVisible = true;
        this.headerService.setBackFunction(() => {
            this.router.navigate(['collections-v2/bot']);
        });

        const groupNameColumn = this.columns.find(v => v.key === 'groupName');
        if (groupNameColumn) {
            groupNameColumn.onClick = (item: any) => {
                this.goToGroupDetails(item.id);
            }
            groupNameColumn.clickable = () => {
                return true;
            }
        }
    }

    ngOnInit(): void {
        this.facadeBotDetailsService.getGroups({ accountId: this.botInfo().id });
    }

    ngOnDestroy(): void {
        this.facadeBotDetailsService.resetState();
    }

    public handleChangePage(event: EventTarget | null | number): void {
        if (typeof event === 'number') {
            this.facadeBotDetailsService.getGroups({ accountId: this.botInfo().id },  { page: event });
        }
    }

    public handleChangeItemsPerPage(event: EventTarget | null | number): void {
        if (typeof event === 'number') {
            this.facadeBotDetailsService.getGroups({ accountId:  this.botInfo().id }, { page: 0, size: event });
        }
    }

    public handleSearch(ev: { search: string }): void {
        this.searchedText = ev.search;
        this.facadeBotDetailsService.getGroups({ search: this.searchedText || undefined });
    }

    public onViewChange(event: ViewSwitch): void {
        this.dataViewType = event;
    }

    public onSelectRow(index: number | string): void {
        let selectedBotRows = [...this.selectedRows()];
        const id = index as string;

        if (selectedBotRows.some(bot => bot.id === id)) {
            selectedBotRows = selectedBotRows.filter(item => item.id !== id);
        } else {
            const bot = this.groups().find(item => item.id === id);
            if (bot) {
                selectedBotRows.push(bot);
            }
        }
        this.selectedRows.set(selectedBotRows);
    }

    public onSelectAll(): void {
        let selectedBotRows = [...this.selectedRows()];
        if (selectedBotRows.length === this.groups().length) {
            selectedBotRows = [];
        } else {
            selectedBotRows = this.groups().map(item => item);
        }
        this.selectedRows.set(selectedBotRows);
    }

    public openSessionsDrawer(): void {
        this.facadeSessionsService.getSessions(this.botInfo().id);

        this.isSessionsDrawerActive = true;
    }

    public enableMonitoring(groupId: string): void  {
        this.modalService.showModal(MonitoringModalComponent, {
            allowOverlayClick: true,
            data: {
                groupId,
                isGroup: true
            },
            whenClosed: (monitoringDetails) => {
                this.monitoringApi.createMonitoring(groupId, monitoringDetails).pipe(
                    takeUntilDestroyed(this.destroyRef),
                ).subscribe(() => {
                    this.notificationService.addNotification(
                        'success',
                        'accounts.monitoringCreatedSuccess',
                        ''
                    );
                    this.facadeBotDetailsService.getGroups({ accountId: this.botInfo().id });
                })
            }
        });
    }
    
    public disableMonitoring(groupId: string): void  {
        this.monitoringApi.removeMonitoring(groupId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.notificationService.addNotification(
                'success',
                'accounts.monitoringDeletedSuccess',
                ''
            )
            this.facadeBotDetailsService.getGroups({ accountId: this.botInfo().id });
        });
    }

    public goToGroupDetails(id: string): void {
        this.router.navigate(['collections-v2/groups', id], { state: { module: 'BOTS', id: this.botInfo().id } });
    }
}
