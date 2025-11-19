import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { BaseModalComponent } from '../../../../../shared/components/modal/base-modal/base-modal.component';
import { ModalWrapperComponent } from '../../../../../shared/components/modal/modal-wrap/modal-wrap.component';
import { SvgIconComponent } from '../../../../../shared/components/svg-icon/svg-icon.component';
import { FormCalendarComponent } from '../../../../../shared/components/forms/form-calendar/form-calendar.component';
import { MonitoringDetails } from '../../../group/models/monitoring-details.model';
import {
    CustomDatepickerComponent
} from "../../../../../shared/components/forms/custom-datepicker/custom-datepicker.component";
import { DateRange } from '../../../../../shared/components/forms/custom-datepicker/custom-datepicker';

@Component({
    selector: 'app-monitoring-modal',
    imports: [
        ModalWrapperComponent,
        SvgIconComponent,
        FormsModule,
        CustomDatepickerComponent,
        ReactiveFormsModule,
        TranslocoPipe,
    ],
    templateUrl: './monitoring-modal.component.html',
    styleUrl: './monitoring-modal.component.scss',
})
export class MonitoringModalComponent extends BaseModalComponent implements OnInit {
    private fb = inject(FormBuilder);
    private destroyRef = inject(DestroyRef);

    public form = this.fb.group({
        monitoringType: ['ONE_TIME'],
        collectedSections: this.fb.array(['MEMBERS', 'POSTS'], []), // Сущности
        regularPeriod: [''], // Дата начала и окончания сбора
        oneTimeStart: [''] // Дата начала единоразового сбора
    });

    public today = new Date(new Date().getTime() + 2 * 60 * 1000);
    public tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));

    get monitoringType(): FormControl {
        return this.form.get('monitoringType') as FormControl;
    }

    get regularPeriod(): FormControl {
        return this.form.get('regularPeriod') as FormControl;
    }

    ngOnInit() {
        if (this.monitoringType.value === 'REGULAR') {
            this.addRegularPeriodValidators();
        }

        this.monitoringType.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((monitoringType) => {
            if (monitoringType === 'REGULAR') {
                this.addRegularPeriodValidators();
            }
            if (monitoringType === 'ONE_TIME') {
                this.clearRegularPeriodValidators();
            }

            this.form.controls.oneTimeStart.reset();
            this.form.controls.regularPeriod.reset();
        });
    }

    onCollectedSectionsCheckboxChanged(event: Event): void {
        const collectedSections: FormArray = this.form.controls.collectedSections;
        const eventTarget = (event?.target as HTMLInputElement);

        if (eventTarget.checked) {
            collectedSections.push(new FormControl(eventTarget.value));
        } else {
            const index = collectedSections.controls
                .findIndex(x => x.value === eventTarget.value);
            collectedSections.removeAt(index);
        }
    }

    onConfirm() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            super.close(this.prepareRequestDto());
        }
    }

    onCancel() {
        super.close('close');
    }

    addRegularPeriodValidators(): void {
        this.regularPeriod.addValidators(Validators.required);
    }

    clearRegularPeriodValidators(): void {
        this.regularPeriod.clearValidators();
    }

    private prepareRequestDto() {
        const dateRange = this.regularPeriod.getRawValue() as DateRange;
        const startDate = dateRange.start;
        const endDate = dateRange.end;
        return {
            ...this.form.getRawValue(),
            collectedSections: this._data.isGroup ? ['GENERAL_INFO', 'MEMBERS', 'POSTS'] : ['MEMBERS', 'POSTS'],
            oneTimeStart: this.monitoringType.value === 'ONE_TIME' ? new Date(new Date().getTime() + 5000).toISOString() : null,
            regularPeriod: {
                start: startDate ? new Date(startDate).toISOString() : undefined,
                end: endDate ? new Date(endDate).toISOString() : undefined,
            }
        } as MonitoringDetails;
    }
}
