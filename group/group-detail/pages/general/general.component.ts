import { Component, computed, HostBinding, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SvgIconComponent } from '../../../../../../shared/components/svg-icon/svg-icon.component';
import { FormCalendarComponent } from '../../../../../../shared/components/forms/form-calendar/form-calendar.component';
import { FacadeGeneralService } from '../../store/general/facade-general.service';
import { BadgeComponent } from '../../../../../../shared/components/badge/badge.component';
import { ProfileModel } from '../../../models/profile.model';
import { TranslocoPipe } from '@jsverse/transloco';
import { FindLinkPipe } from "../../../../../../shared/pipes/find-link.pipe.component";

@Component({
    selector: 'app-general',
    imports: [
        CommonModule, ReactiveFormsModule,
        SvgIconComponent, BadgeComponent, TranslocoPipe,
        // FormCalendarComponent
        FindLinkPipe
    ],
    templateUrl: './general.component.html',
    styleUrl: './general.component.scss'
})
export class GeneralComponent {
    @HostBinding('class') class = 'group group--nowrap group--expand';

    private facadeGeneralService: FacadeGeneralService = inject(FacadeGeneralService);

    date: FormControl = new FormControl();
    modalEditTagsIsActive = false;

    profile: Signal<ProfileModel> = this.facadeGeneralService.profile;

    public tags: Signal<string[]> = computed(() => {
        return this.profile()?.tags?.split(' ') || [];
    });

    public toggleModalEditTags() {
        this.modalEditTagsIsActive = !this.modalEditTagsIsActive;
    }
}
