import {Component, HostBinding, input, output, signal} from '@angular/core';
import {ViewSwitch} from '../../../../shared/components/view-switch/view-switch';
import {ViewSwitchComponent} from '../../../../shared/components/view-switch/view-switch.component';
import {PaginationPanelComponent} from '../../../../shared/components/pagination-panel/pagination-panel.component';
import {NotFoundComponent} from '../../../../shared/components/not-found/not-found.component';
import {PageParams} from '../../../../shared/components/pagination-panel/pagination-panel';
import {SearchBarComponent} from '../../../../shared/components/search-bar/search-bar.component';
import {SortingComponent} from '../../../../shared/components/sorting/sorting.component';
import {QueryParams} from '../../../../core/common';
import {SortingItem} from '../../../../shared/components/sorting/sorting';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
    selector: 'app-base-pageable-list',
    imports: [
        ViewSwitchComponent,
        PaginationPanelComponent,
        NotFoundComponent,
        SearchBarComponent,
        SortingComponent,
        TranslocoPipe,
    ],
    templateUrl: './base-pageable-list.component.html',
    styleUrl: './base-pageable-list.component.scss',
    standalone: true,
    host: {
        class: 'body__container',
    }
})
export class BasePageableListComponent<Entity> {
    data = input.required<Entity[]>();
    isLoading = input.required<boolean>();
    totalElements = input.required<number>();
    totalPages = input.required<number>();
    pageParams = input.required<PageParams>();
    queryParams = input.required<QueryParams>();
    sortingItems = input.required<SortingItem[]>();

    hasSidebar = input<boolean>(true);
    hasInlineStartPadding = input<boolean>(true);
    hasPadding = input<boolean>(true);

    public searchHandled = output<string>();
    public sortingHandled = output<string>();
    public updated = output<PageParams>();

    public dataView = signal<ViewSwitch>('list');

    public onViewChange(event: ViewSwitch): void {
        this.dataView.set(event);
    }

    handleChangePage(target: EventTarget | null | number) {
        const newPage = typeof target === 'number' ? target : Number((target as HTMLSelectElement)?.value);
        if (newPage < 0 || newPage >= this.totalPages()) return;
        const nextPageParams = new PageParams(newPage, this.pageParams().size);
        this.updated.emit(nextPageParams);
    }

    handleItemsPerPageChange(target: EventTarget | null | number) {
        const perPage = typeof target === 'number' ? target : Number((target as HTMLSelectElement)?.value);
        const newPageParams = new PageParams(0, perPage);
        this.updated.emit(newPageParams);
    }
}
