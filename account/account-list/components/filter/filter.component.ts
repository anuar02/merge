import { Component, inject, output, Signal } from '@angular/core';
import { AccordionComponent } from '../../../../../../shared/components/accordion/accordion.component';
import { FormArray, FormControl } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FilterFormService } from './filter-form.service';
import { AccountListApi } from '../../api/account-list.api';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-account-filter',
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
    private groupApi = inject(AccountListApi);

    public sourceTypes = toSignal(
        this.groupApi.getSourceTypes()
            .pipe(takeUntilDestroyed()), { initialValue: [] }
    );

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
}
