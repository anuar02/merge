import {Component, computed, EventEmitter, inject, Input, input, output, Output, Signal} from '@angular/core';
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';

import { AccountEntity } from '../../models/account.entity';
import {DeanonBinding, Platform} from '../../../../deanon/deanon';
import {ButtonDropdownItem} from '../../../../../shared/components/button-dropdown/button-dropdown';
import {SvgIconComponent} from '../../../../../shared/components/svg-icon/svg-icon.component';
import {BadgeComponent} from '../../../../../shared/components/badge/badge.component';
import {PlatformIconComponent} from '../../../../../shared/components/platform-icon/platform-icon.component';
import {COLLECT_STATUS_MAP} from '../../../base/utils/collect-status-map';
import {TranslocoPipe} from '@jsverse/transloco';
import {BadgeComponent as BadgeComponent2} from "../../../../../shared/components/status-badge/badge/badge.component";
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-account-table-card',
    imports: [
        CommonModule,
        SvgIconComponent,
        BadgeComponent,
        // ButtonDropdownComponent,
        PlatformIconComponent,
        TranslocoPipe,
        BadgeComponent,
        BadgeComponent2
    ],
    templateUrl: './table-card.component.html',
    standalone: true,
    styleUrl: './table-card.component.scss',
    host: {
        class: 'card',
        '(click)': '$event.stopPropagation(); onClick()',
    }
})
export class TableCardComponent {
    @Input() bindingList: DeanonBinding[] = [];

    private router = inject(Router);

    public account = input.required<AccountEntity>();
    public platforms = input<Platform[]>([]);
    public showMonitoring = input<boolean>(true);

    public platformId = computed(() => {
        return this.platforms().find((p) => p?.name?.toLowerCase() === this.account()?.platform?.toLowerCase())?.id || 0;
    });

    public tags: Signal<string[]> = computed(() => {
        return this.account()?.contentTag?.split(' ') || [];
    });

    collectStatus = computed(() => {
        const collectStatus = this.account()?.collectStatus;

        return COLLECT_STATUS_MAP[collectStatus];
    });

    @Output() clicked: EventEmitter<AccountEntity> = new EventEmitter<AccountEntity>();

    monitoringCreated = output<void>();
    monitoringDisabled = output<void>();

    public isOnline = environment.appType.toUpperCase() === 'ONLINE';
  
    public actions: ButtonDropdownItem[] = [
        {
            icon: 'icon-folder',
            text: 'common.addToFolder',
            onClick: () => {
                // do smth
            },
        },
        {
            icon: 'icon-bookmark',
            text: 'common.addToFavorites',
            onClick: () => {
                // do smth
            },
        },
        {
            icon: 'icon-archive',
            text: 'button.archive',
            onClick: () => {
                // do smth
            },
        },
    ];

    public onClick() {
        this.clicked.emit();
    }

    public onAvatarClick(): void {
        this.router.navigate(['collections-v2/accounts', this.account().id]);
    }
}
