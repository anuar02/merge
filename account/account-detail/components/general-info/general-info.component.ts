import {Component, HostBinding, inject, Signal} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SvgIconComponent} from '../../../../../../shared/components/svg-icon/svg-icon.component';
import {SharedModule} from '../../../../../../shared/shared.module';
import {ListItemComponent} from '../../../../../../shared/components/list-item/list-item.component';
import {ModalService} from '../../../../../../shared/components/modal/modal.service';
import {FacadeGeneralService} from '../../store/general/facade-general.service';
import {AccountProfileModel} from '../../../models/account-profile.model';
import {BadgeComponent} from '../../../../../../shared/components/badge/badge.component';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
    selector: 'app-general-info',
    imports: [
        SvgIconComponent,
        CommonModule,
        SharedModule,
        ListItemComponent,
        BadgeComponent,
        TranslocoPipe,
    ],
    templateUrl: './general-info.component.html',
    standalone: true,
    styleUrl: './general-info.component.scss'
})
export class GeneralInfoComponent {

    @HostBinding('class') class = 'grid grid--group-wrap';

    constructor(
      private modalService: ModalService,
    ) {
    }

    private storeFacadeService = inject(FacadeGeneralService);

    profile: Signal<AccountProfileModel> = this.storeFacadeService.profile;
}
