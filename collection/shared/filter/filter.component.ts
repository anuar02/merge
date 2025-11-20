import { Component, inject, input, output, OnInit, computed } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { SourceTypes } from '../../../group/group-list/api/models/groups';
import {Folder, FolderTreeComponent} from "../../../../../shared/components/folder-tree/folder-tree.component";
import {CollectionFilterService, CollectionFilterType} from "./filter.service";
import {AccordionComponent} from "../../../../../shared/components/accordion/accordion.component";

@Component({
    selector: 'app-collection-filter',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AccordionComponent,
        TranslocoPipe,
        AccordionComponent,
    ],
    templateUrl: 'filter.component.html',
})
export class CollectionFilterComponent implements OnInit {
    // Inputs
    public filterType = input.required<CollectionFilterType>();
    public sourceTypes = input<SourceTypes[]>([]);

    // Outputs
    public applied = output<void>();
    public folderSelected = output<Folder | null>();

    private filterService = inject(CollectionFilterService);

    public formGroup = computed(() => {
        return this.filterService.createFilterForm(this.filterType());
    });

    public selectedFolder: Folder | null = null;

    ngOnInit() {
        // Set current filter type when component initializes
        this.filterService.setCurrentFilterType(this.filterType());
    }

    onPlatformsCheckboxChanged(event: Event): void {
        const form = this.formGroup();
        const platforms: FormArray = form.get('platforms') as FormArray;
        const eventTarget = (event?.target as HTMLInputElement);

        if (eventTarget.checked) {
            platforms.push(new FormControl(eventTarget.value));
        } else {
            const index = platforms.controls
                .findIndex(x => x.value === eventTarget.value);
            platforms.removeAt(index);
        }
    }

    resetFilter(): void {
        this.filterService.resetFilters(this.filterType());
        const form = this.formGroup();
        form.patchValue({
            search: '',
            folderId: null,
            isFavorite: false
        });
        (form.get('platforms') as FormArray).clear();
        this.selectedFolder = null;
        this.folderSelected.emit(null);
        this.applied.emit();
    }

    applyFilter(): void {
        this.applied.emit();
    }

    // Get filter title based on collection type
    getFilterTitle(): string {
        const titles: Record<CollectionFilterType, string> = {
            groups: 'common.filter',
            accounts: 'common.filter',
            bots: 'common.filter'
        };
        return titles[this.filterType()];
    }

}
