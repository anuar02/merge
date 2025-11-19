import { Component, ElementRef, EventEmitter, inject, Input, OnDestroy, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslocoPipe } from "@jsverse/transloco";
import { Subject } from "rxjs";

import { SvgIconComponent } from "../../../../../../shared/components/svg-icon/svg-icon.component";
import { TableComponent } from "../../../../../../shared/components/data-table/components/table/table.component";
import { PaginationPanelComponent } from "../../../../../../shared/components/pagination-panel/pagination-panel.component";
import { Column } from "../../../../../../shared/components/data-table/components/table/table";
import { columns } from "../../../models/session";
import { FacadeSessionsService } from "../../../store/sessions/facade-sessions.service";
import { LoaderComponent } from "../../../../../deanon/components/loader/loader.component";
import { NotFoundComponent } from "../../../../../../shared/components/not-found/not-found.component";

@Component({
    selector: 'app-sessions-drawer',
    imports: [
        CommonModule,
        SvgIconComponent,
        TableComponent,
        PaginationPanelComponent,
        TranslocoPipe,
        LoaderComponent,
        NotFoundComponent
    ],
    templateUrl: './sessions-drawer.component.html'
})
export class SessionsDrawerComponent implements OnDestroy {
    @Input() active = false;
    @Input() botId = ''
    @Output() activeChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    private elementRef = inject(ElementRef);
    private facadeSessionsService = inject(FacadeSessionsService);
    private destroyed: Subject<void> = new Subject<void>();

    public columns: Column[] = columns;

    public sessions = this.facadeSessionsService.sessionsContent;
    public pageInfo = this.facadeSessionsService.sessionsPageInfo;
    public isLoading = this.facadeSessionsService.isLoading;
    public isLoaded = this.facadeSessionsService.isLoaded;

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
    }

    public handleChangePage(event: EventTarget | null | number): void {
        if (typeof event === 'number') {
            this.facadeSessionsService.getSessions(this.botId, { page: event });
        }
    }

    public handleChangeItemsPerPage(event: EventTarget | null | number): void {
        if (typeof event === 'number') {
            this.facadeSessionsService.getSessions(this.botId, { page: 0, size: event });
        }
    }

    public handleSort(ev: any): void {
        const [field] = ev.split(',');
        // const index = this.columns.findIndex(col => col.key === field);

        // this.columns[index].sort = ev;
        // this.facadePhishingService.getPhishingResultDeatils(this.requestId, {}, { sort: ev });
    }

    public close(): void {
        this.active = false;
        this.activeChange.emit(this.active);

        const scrollContainer: HTMLElement = this.elementRef.nativeElement.querySelector('.table-container');
        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
    }
}