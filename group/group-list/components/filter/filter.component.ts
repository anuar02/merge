import { Component, inject, output, Signal } from '@angular/core';
import { AccordionComponent } from '../../../../../../shared/components/accordion/accordion.component';
import { FilterFormService } from './filter-form.service';
import { FormArray, FormControl } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { GroupListApiService } from '../../api/group-list-api.service';
import { SourceTypes } from '../../api/models/groups';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-collection-filter',
    imports: [
        AccordionComponent,
        TranslocoPipe,
    ],
    templateUrl: './filter.component.html',
    styleUrl: './filter.component.scss'
})
export class FilterComponent {
    public applied = output();

    public formGroup = inject(FilterFormService).form;
    private groupApi = inject(GroupListApiService);

    public sourceTypes: Signal<SourceTypes[]> = toSignal(this.groupApi.getSourceTypes().pipe(takeUntilDestroyed()), { initialValue: [] });

    onPlatformsCheckboxChanged(event: Event): void {
        const platforms: FormArray = this.formGroup.controls.platforms;
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
        this.formGroup.controls.platforms.clear();
        this.applied.emit();
    }

    protected readonly FormArray = FormArray;
}
