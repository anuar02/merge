import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject } from 'rxjs';

import { SvgIconComponent } from '../../../../../../shared/components/svg-icon/svg-icon.component';
import { MembersPayload } from '../../group';
import { AccordionComponent } from '../accordion/accordion.component';

@Component({
    selector: 'app-filter',
    imports: [
        CommonModule, ReactiveFormsModule, TranslocoModule,
        SvgIconComponent, AccordionComponent
    ],
    templateUrl: './filter.component.html',
    styleUrl: './filter.component.scss'
})
export class FilterComponent implements OnDestroy {
    @Output() applied: EventEmitter<MembersPayload> = new EventEmitter<MembersPayload>();

    private destroyed: Subject<void> = new Subject<void>();
    
    filterForm: FormGroup;

    constructor(
        private fb: FormBuilder,
    ) {
        this.filterForm = this.fb.group({

        });
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
    }

    apply(): void {
        this.applied.emit({
            
        });
    }

    reset(): void {
        this.filterForm.reset();

        this.applied.emit({
            
        });
    }

}
