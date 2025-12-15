import { Component, inject, input, output, OnInit, computed } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { SourceTypes } from '../../../group/group-list/api/models/groups';
import { Folder } from "../../../../../shared/components/folder-tree/folder-tree.component";
import { CollectionFilterService, CollectionFilterType } from "./filter.service";
import { AccordionComponent } from "../../../../../shared/components/accordion/accordion.component";
import {
    CustomDatepickerComponent
} from "../../../../../shared/components/forms/custom-datepicker/custom-datepicker.component";
import { FilterField, FilterSection, FilterSubsection } from "./configs/filter.config";
import { RangeSliderComponent } from "../../../../../shared/components/range-slider/range-slider.component";

@Component({
    selector: 'app-collection-filter',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslocoPipe,
        AccordionComponent,
        CustomDatepickerComponent,
        RangeSliderComponent
    ],
    templateUrl: 'filter.component.html',
    styleUrl: 'filter.component.scss'
})
export class CollectionFilterComponent implements OnInit {
    public filterType = input.required<CollectionFilterType>();
    public sourceTypes = input<SourceTypes[]>([]);

    public applied = output<any>();
    public folderSelected = output<Folder | null>();

    private filterService = inject(CollectionFilterService);

    public formGroup = computed(() => {
        return this.filterService.createFilterForm(this.filterType());
    });

    public filterConfig = computed(() => {
        return this.filterService.getFilterConfig(this.filterType());
    });

    public selectedFolder: Folder | null = null;

    ngOnInit() {
        this.filterService.setCurrentFilterType(this.filterType());
    }

    onCheckboxChanged(field: FilterField, option: string | boolean | number, event: Event): void {
        const form = this.formGroup();
        const formArray: FormArray = form.get(field.key) as FormArray;
        const eventTarget = (event?.target as HTMLInputElement);

        if (field.key === 'privacyType' || field.key === 'deanon') {
            if (eventTarget.checked) {
                formArray.clear();
                formArray.push(new FormControl(option));
            } else {
                formArray.clear();
            }
        } else {
            if (eventTarget.checked) {
                formArray.push(new FormControl(option));
            } else {
                const index = formArray.controls.findIndex(x => x.value === option);
                if (index !== -1) {
                    formArray.removeAt(index);
                }
            }
        }

        form.markAsDirty();
    }

    isCheckboxChecked(field: FilterField, option: string | boolean | number): boolean {
        const form = this.formGroup();
        const formArray = form.get(field.key) as FormArray;
        return formArray?.controls.some(control => control.value === option) ?? false;
    }

    onSubsectionCheckboxChanged(section: FilterSection, subsection: FilterSubsection, event: Event): void {
        const eventTarget = (event?.target as HTMLInputElement);
        const form = this.formGroup();

        subsection.fields.forEach(field => {
            if (field.type === 'checkboxList' && field.options) {
                const formArray = form.get(field.key) as FormArray;

                if (eventTarget.checked) {
                    field.options.forEach(option => {
                        const exists = formArray.controls.some(c => c.value === option.value);
                        if (!exists) {
                            formArray.push(new FormControl(option.value));
                        }
                    });
                } else {
                    formArray.clear();
                }
            }
        });

        form.markAsDirty();
    }

    onSubsectionTagCheckboxChanged(section: FilterSection, subsection: FilterSubsection, event: Event): void {
        const form = this.formGroup();
        form.markAsDirty();
    }

    resetFilter(): void {
        this.filterService.resetFilters(this.filterType());
        const form = this.formGroup();

        Object.keys(form.controls).forEach(key => {
            const control = form.get(key);
            if (control instanceof FormArray) {
                control.clear();
            } else if (control instanceof FormGroup) {
                control.reset();
            } else {
                control?.reset();
            }
        });

        this.selectedFolder = null;
        this.folderSelected.emit(null);

        this.applied.emit({});
    }

    applyFilter(): void {
        const filterValues = this.filterService.transformFilterPayload(this.getFilterPayload());

        this.applied.emit(filterValues);
    }

    private getFilterPayload(): any {
        const form = this.formGroup();
        const rawValue = form.getRawValue();

        const payload: any = {};

        Object.keys(rawValue).forEach(key => {
            const value = rawValue[key];

            if (Array.isArray(value)) {
                if (value.length > 0) {
                    payload[key] = value;
                }
            }
            else if (value && typeof value === 'object') {
                if ('start' in value || 'end' in value) {
                    const hasStart = value.start !== null && value.start !== undefined && value.start !== '';
                    const hasEnd = value.end !== null && value.end !== undefined && value.end !== '';

                    if (hasStart || hasEnd) {
                        payload[key] = {
                            ...(hasStart && { start: value.start instanceof Date ? value.start.toISOString() : value.start }),
                            ...(hasEnd && { end: value.end instanceof Date ? value.end.toISOString() : value.end })
                        };
                    }
                }
                else if ('from' in value || 'to' in value) {
                    const hasFrom = value.from !== null && value.from !== undefined && value.from !== '';
                    const hasTo = value.to !== null && value.to !== undefined && value.to !== '';

                    if (hasFrom || hasTo) {
                        payload[key] = {
                            ...(hasFrom && { from: value.from }),
                            ...(hasTo && { to: value.to })
                        };
                    }
                }
            }
            else if (value !== null && value !== undefined && value !== '') {
                payload[key] = value;
            }
        });

        return payload;
    }

    getFilterTitle(): string {
        return 'common.filter';
    }

    isSectionChecked(section: FilterSection): boolean {
        if (!section.fields || section.fields.length === 0) return false;

        const form = this.formGroup();

        return section.fields.every(field => {
            if (field.type === 'checkboxList' && field.options) {
                const formArray = form.get(field.key) as FormArray;
                if (!formArray || formArray.length === 0) return false;
                return field.options.every(option =>
                    formArray.controls.some(control => control.value === option.value)
                );
            }
            return false;
        });
    }

    onSectionCheckboxChanged(section: FilterSection, event: Event): void {
        const eventTarget = (event?.target as HTMLInputElement);
        const form = this.formGroup();

        section.fields?.forEach(field => {
            if (field.type === 'checkboxList' && field.options) {
                const formArray = form.get(field.key) as FormArray;

                if (eventTarget.checked) {
                    field.options.forEach(option => {
                        const exists = formArray.controls.some(c => c.value === option.value);
                        if (!exists) {
                            formArray.push(new FormControl(option.value));
                        }
                    });
                } else {
                    formArray.clear();
                }
            }
        });

        form.markAsDirty();
    }

    isSubsectionChecked(section: FilterSection, subsection: FilterSubsection): boolean {
        if (!subsection.fields || subsection.fields.length === 0) return false;

        const form = this.formGroup();

        return subsection.fields.every(field => {
            if (field.type === 'checkboxList' && field.options) {
                const formArray = form.get(field.key) as FormArray;
                if (!formArray || formArray.length === 0) return false;
                return field.options.every(option =>
                    formArray.controls.some(control => control.value === option.value)
                );
            }
            return false;
        });
    }

    isSubsectionTagChecked(section: FilterSection, subsection: FilterSubsection): boolean {
        return false;
    }

    trackByIndex(index: number): number {
        return index;
    }

    trackByKey(index: number, item: any): string {
        return item.key || item.value || index;
    }
}
