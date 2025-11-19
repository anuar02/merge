import {Component, computed, EventEmitter, input, Input, output, Output, Signal} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Platform} from "../../../../../deanon/deanon";
import {SvgIconComponent} from "../../../../../../shared/components/svg-icon/svg-icon.component";
import {BadgeComponent} from "../../../../../../shared/components/badge/badge.component";
import {ButtonDropdownItem} from "../../../../../../shared/components/button-dropdown/button-dropdown";
import {GroupEntity} from '../../../models/group.entity';
import {PlatformIconComponent} from '../../../../../../shared/components/platform-icon/platform-icon.component';
import { COLLECT_STATUS_MAP } from '../../../../base/utils/collect-status-map';
import { TranslocoPipe } from '@jsverse/transloco';
import { environment } from '../../../../../../../environments/environment';

@Component({
    selector: 'app-group-table-card',
    imports: [
        CommonModule,
        SvgIconComponent,
        BadgeComponent,
        // ButtonDropdownComponent,
        PlatformIconComponent,
        TranslocoPipe,
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
  @Input() data: GroupEntity = {} as GroupEntity;
  @Input() hasClickOnGroupName = false;

  public group = input.required<GroupEntity>();
  public platforms = input<Platform[]>([]);

  public platformId = computed(() => {
      return this.platforms().find((p) => p?.name?.toLowerCase() === this.group()?.platform?.toLowerCase())?.id || 0;
  });

  public tags: Signal<string[]> = computed(() => {
      return this.group()?.contentTag?.split(' ') || [];
  });

  collectStatus = computed(() => {
      const collectStatus = this.group()?.collectStatus;

      return COLLECT_STATUS_MAP[collectStatus];
  });

  @Output() clicked: EventEmitter<GroupEntity> = new EventEmitter<GroupEntity>();

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
      this.clicked.emit(this.data);
  }
}
