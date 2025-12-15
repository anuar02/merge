import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { BaseModalComponent } from '../../../../../shared/components/modal/base-modal/base-modal.component';
import { ModalWrapperComponent } from '../../../../../shared/components/modal/modal-wrap/modal-wrap.component';
import { MonitoringDetails } from '../../../group/models/monitoring-details.model';
import {
    CustomDatepickerComponent
} from "../../../../../shared/components/forms/custom-datepicker/custom-datepicker.component";
import { DateRange } from '../../../../../shared/components/forms/custom-datepicker/custom-datepicker';

export type MonitoringMode = 'collection' | 'monitoring';

export interface MonitoringSection {
    value: string;
    label: string;
    defaultChecked?: boolean;
}

export interface MonitoringModalData {
    accountId: string;
    mode?: MonitoringMode;
    sections?: MonitoringSection[];
    title?: string;
}

@Component({
    selector: 'app-monitoring-modal',
    imports: [
        ModalWrapperComponent,
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

    public mode: MonitoringMode = 'monitoring';
    public customTitle: string | undefined;
    public availableSections: MonitoringSection[] = [];

    public form = this.fb.group({
        collectedSections: this.fb.array([], [Validators.required, Validators.minLength(1)]),
        regularPeriod: [''] // Validators added conditionally in ngOnInit
    });

    public today = new Date(new Date().getTime() + 2 * 60 * 1000);

    get regularPeriod(): FormControl {
        return this.form.get('regularPeriod') as FormControl;
    }

    get collectedSections(): FormArray {
        return this.form.get('collectedSections') as FormArray;
    }

    ngOnInit() {
        const modalData = this._data as MonitoringModalData;
        this.mode = modalData?.mode || 'monitoring';
        this.customTitle = modalData?.title;
        this.availableSections = modalData?.sections || this.getDefaultSections();

        if (this.mode === 'monitoring') {
            this.regularPeriod.setValidators(Validators.required);
        } else {
            this.regularPeriod.clearValidators();
        }
        this.regularPeriod.updateValueAndValidity();

        const defaultChecked = this.getDefaultCheckedSections();
        defaultChecked.forEach(value => {
            this.collectedSections.push(new FormControl(value));
        });
    }

    private getDefaultSections(): MonitoringSection[] {
        return [
            { value: 'POSTS', label: 'accounts.publications', defaultChecked: true },
            { value: 'MEMBERS', label: 'accounts.participants', defaultChecked: true },
        ];
    }

    private getDefaultCheckedSections(): string[] {
        return this.availableSections
            .filter(section => section.defaultChecked !== false)
            .map(section => section.value);
    }

    isSectionChecked(sectionValue: string): boolean {
        return this.collectedSections.value.includes(sectionValue);
    }

    onCollectedSectionsCheckboxChanged(event: Event): void {
        const eventTarget = (event?.target as HTMLInputElement);

        if (eventTarget.checked) {
            this.collectedSections.push(new FormControl(eventTarget.value));
        } else {
            const index = this.collectedSections.controls
                .findIndex(x => x.value === eventTarget.value);
            this.collectedSections.removeAt(index);
        }

        this.collectedSections.markAsTouched();
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

    private prepareRequestDto(): MonitoringDetails {
        const collectedSections = this.collectedSections.value;

        // collection = ONE_TIME, monitoring = REGULAR
        if (this.mode === 'collection') {
            return {
                monitoringType: 'ONE_TIME',
                collectedSections: collectedSections,
                regularPeriod: {
                    start: undefined,
                    end: undefined,
                },
                oneTimeStart: new Date(new Date().getTime() + 5000).toISOString()
            } as MonitoringDetails;
        } else {
            // monitoring mode = REGULAR
            const dateRange = this.regularPeriod.getRawValue() as DateRange;
            const startDate = dateRange?.start;
            const endDate = dateRange?.end;

            return {
                monitoringType: 'REGULAR',
                collectedSections: collectedSections,
                regularPeriod: {
                    start: startDate ? new Date(startDate).toISOString() : undefined,
                    end: endDate ? new Date(endDate).toISOString() : undefined,
                },
                oneTimeStart: null
            } as MonitoringDetails;
        }
    }

    getModalTitle(): string {
        if (this.customTitle) {
            return this.customTitle;
        }
        return this.mode === 'collection'
            ? 'accounts.startCollection'
            : 'accounts.monitoring';
    }
}
