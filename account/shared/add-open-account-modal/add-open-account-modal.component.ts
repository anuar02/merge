import { Component, computed, DestroyRef, inject, OnInit, signal, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from "@angular/common";
import { FormArray, FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { TranslocoPipe } from '@jsverse/transloco';
import { startWith } from 'rxjs';

import { BaseModalComponent } from "../../../../../shared/components/modal/base-modal/base-modal.component";
import { ModalWrapperComponent } from "../../../../../shared/components/modal/modal-wrap/modal-wrap.component";
import { Option } from "../../../../../shared/components/select/select";
import { SelectComponent } from "../../../../../shared/components/select/select.component";
import { SvgIconComponent } from "../../../../../shared/components/svg-icon/svg-icon.component";
import { FormService, OpenGroupRequestModel } from './form.service';
import { NotificationsService } from '../../../../../shared/services/notifications.service';
import { AccountListApi } from '../account-list-api/account-list.api';
import {
    CONTENT_TOPIC_DICTIONARY,
    contentTopics,
    SEARCH_PARAM_DICTIONARY,
    searchParamTypes,
    tonalities,
    TONALITY_DICTIONARY
} from '../../../group/tokens/custom-dictionaries';
import {
    CustomDatepickerComponent
} from "../../../../../shared/components/forms/custom-datepicker/custom-datepicker.component";
import { DateRange } from '../../../../../shared/components/forms/custom-datepicker/custom-datepicker';

@Component({
    selector: 'app-add-open-groups-modal',
    imports: [
        ModalWrapperComponent,
        SelectComponent,
        SvgIconComponent,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TranslocoPipe,
        CustomDatepickerComponent,
    ],
    templateUrl: './add-open-account-modal.component.html',
    standalone: true,
    styleUrl: './add-open-account-modal.component.scss',
    providers: [
        FormService,
        AccountListApi,
        {
            provide: SEARCH_PARAM_DICTIONARY,
            useValue: searchParamTypes,
        },
        {
            provide: TONALITY_DICTIONARY,
            useValue: tonalities,
        },
        {
            provide: CONTENT_TOPIC_DICTIONARY,
            useValue: contentTopics,
        }
    ],
})
export class AddOpenAccountModalComponent extends BaseModalComponent implements OnInit {

    public formGroup = inject(FormService).form;

    private groupApi = inject(AccountListApi);
    private destroyRef = inject(DestroyRef);
    private notificationService = inject(NotificationsService);

    private selectedSourceType = toSignal(
        this.formGroup.controls.sourceType.valueChanges.pipe(
            startWith(this.formGroup.controls.sourceType.getRawValue()),
            takeUntilDestroyed()
        ), { initialValue: null }
    );
    private sourceTypes = toSignal(this.groupApi.getSourceTypes().pipe(takeUntilDestroyed()), { initialValue: [] });
    private searchParamType = toSignal(
        this.formGroup.controls.searchParamType?.valueChanges.pipe(
            startWith(this.formGroup.controls.searchParamType.getRawValue()),
            takeUntilDestroyed()
        ), { initialValue: null });
    public searchValueLabel: Signal<string> = computed(() => {
        return this.searchParamTypes().find((v) => v.value === this.searchParamType())?.title || '';
    });

    // dictionaries
    public platforms = computed(() => {
        const sourceType = this.selectedSourceType();
        return this.sourceTypes()
            .find((v) => v.sourceTypeName === sourceType)?.platforms
            .map((v) => new Option(v.title, v.name)) || [];
    });
    public searchParamTypes = signal(inject(SEARCH_PARAM_DICTIONARY));
    public contentTopics = signal(inject(CONTENT_TOPIC_DICTIONARY));
    public tonalities = signal(inject(TONALITY_DICTIONARY));

    public today = new Date(new Date().getTime() + 2 * 60 * 1000);
    public tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));

    get monitoringType(): FormControl {
        return this.formGroup.get('monitoringDetails.monitoringType') as FormControl;
    }

    get regularPeriod(): FormControl {
        return this.formGroup.get('monitoringDetails.regularPeriod') as FormControl;
    }

    constructor() {
        super();
    }

    ngOnInit() {
        this.formGroup.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.setHasChanges(true);
        });
        this.formGroup.controls.sourceType.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.resetFormOnSourceTypeChange();
        })
        this.formGroup.controls.monitor.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((monitor) => {
            if (monitor) {
                if (this.monitoringType.value === 'REGULAR') {
                    this.addRegularPeriodValidators();
                } 
            } else {
                this.clearRegularPeriodValidators();
            }
            
            this.formGroup.controls.monitoringDetails.controls.oneTimeStart.reset();
            this.formGroup.controls.monitoringDetails.controls.regularPeriod.reset();
        });
        this.formGroup.controls.monitoringDetails.controls.monitoringType.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((monitoringType) => {
            if (monitoringType === 'REGULAR') {
                this.addRegularPeriodValidators();
            }
            if (monitoringType === 'ONE_TIME') {
                this.clearRegularPeriodValidators();
            }
            
            this.formGroup.controls.monitoringDetails.controls.oneTimeStart.reset();
            this.formGroup.controls.monitoringDetails.controls.regularPeriod.reset();
        });
    }

    private resetFormOnSourceTypeChange() {
        this.formGroup.reset({
            source: 'PUBLIC_SOURCE',
            sourceType: this.formGroup.controls.sourceType.getRawValue(),
            searchParamType: 'ID',
            searchValue: '',
            platform: '',
            monitor: true,
            monitoringDetails: {
                monitoringType: 'ONE_TIME',
                collectedSections: [],
                regularPeriod: '',
                oneTimeStart: ''
            },
            note: '',
            global: false,
        }, { emitEvent: false});
    }

    onCollectedSectionsCheckboxChanged(event: Event): void {
        const collectedSections: FormArray = this.formGroup.controls.monitoringDetails.controls.collectedSections;
        const eventTarget = (event?.target as HTMLInputElement);

        if (eventTarget.checked) {
            collectedSections.push(new FormControl(eventTarget.value));
        } else {
            const index = collectedSections.controls
                .findIndex(x => x.value === eventTarget.value);
            collectedSections.removeAt(index);
        }
    }

    closeBtn() {
        this.setHasChanges(false);
        super.close({name: '1'});
    }

    onCancel() {
        this.setHasChanges(false);
        super.close({name: '1'});
    }

    prepareRequestDto() {
        const dateRange = this.regularPeriod.getRawValue() as DateRange;
        const startDate = dateRange.start;
        const endDate = dateRange.end;

        return {
            ...this.formGroup.getRawValue(),
            monitoringDetails: {
                ...this.formGroup.getRawValue().monitoringDetails,
                oneTimeStart: this.monitoringType.value === 'ONE_TIME' ? new Date(new Date().getTime() + 5000).toISOString() : null,
                regularPeriod: {
                    start: startDate ? new Date(startDate).toISOString() : undefined,
                    end: endDate ? new Date(endDate).toISOString() : undefined,
                }
            }
        } as OpenGroupRequestModel;
    }

    onConfirm() {
        this.formGroup.markAllAsTouched();
        if (this.formGroup.valid) {
            this.groupApi.createAccount(this.prepareRequestDto()).pipe(
                takeUntilDestroyed(this.destroyRef)
            ).subscribe((res) => {
                this.notificationService.addNotification(
                    'success',
                    'accounts.sourceAdded',
                    'accounts.sourceAddedMessage'
                )
                super.close(res);
            });
        }
    }

    addRegularPeriodValidators(): void {
        this.regularPeriod.addValidators(Validators.required);
    }

    clearRegularPeriodValidators(): void {
        this.regularPeriod.clearValidators();
    }
}
