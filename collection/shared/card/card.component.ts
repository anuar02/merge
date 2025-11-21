import {
    Component,
    computed,
    EventEmitter,
    inject,
    Output,
    input,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { SvgIconComponent } from '../../../../../shared/components/svg-icon/svg-icon.component';
import { PlatformIconComponent } from '../../../../../shared/components/platform-icon/platform-icon.component';
import { BadgeComponent } from "../../../../../shared/components/badge/badge.component";

import { CollectionEntity, CollectionType } from '../../models/collection.entity';
import { environment } from '../../../../../../environments/environment';
import { COLLECT_STATUS_MAP } from '../../../base/utils/collect-status-map';
import {TableColumn} from "../../../../../shared/components-new/table/table";
import {LifeStatusPipe} from "../../../../../shared/pipes/life-status-pipe";

export interface Platform {
    id: number;
    name: string;
    title?: string;
}

@Component({
    selector: 'app-collection-card',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        TranslocoPipe,
        SvgIconComponent,
        PlatformIconComponent,
        BadgeComponent,
        LifeStatusPipe,
    ],
    templateUrl: 'card.component.html',
    styleUrls: ['card.component.scss'],
    host: {
        class: 'card',
        '(click)': '$event.stopPropagation(); onClick()',
    },
})
export class CollectionCardComponent {
    private router = inject(Router);

    // ==== Inputs ====
    public collection = input.required<CollectionEntity>();
    public platforms = input<Platform[]>([]);
    public showMonitoring = input<boolean>(true);
    public bindingList = input<any[]>([]);

    // ==== Outputs ====
    @Output() clicked = new EventEmitter<CollectionEntity>();
    @Output() monitoringCreated = new EventEmitter<void>();
    @Output() monitoringDisabled = new EventEmitter<void>();

    public isOnline = environment.appType.toUpperCase() === 'ONLINE';

    // ==== Computed ====
    public platformId = computed(() => {
        return (
            this.platforms().find(
                (p) =>
                    p?.name?.toLowerCase() ===
                    this.collection()?.platform?.toLowerCase(),
            )?.id || 0
        );
    });

    public tags = computed(() => {
        const contentTag = this.collection()?.contentTag;
        if (!contentTag) return [];
        return contentTag.split(' ').filter(tag => tag.trim().length > 0);
    });

    public getPhotoUrl(photo: string, type: CollectionType): string {
        if (!photo || photo.startsWith('blob:') || photo.startsWith('assets/') || photo.startsWith('http')) {
            return photo;
        }
        return `${environment.apiUrl}/resources/media?path=${encodeURIComponent(photo)}`;
    }

    public onAvatarClick(): void {
        this.router.navigate(this.getDetailRoute());
    }

    public collectStatus = computed(() => {
        const status = this.collection()?.collectStatus;
        return COLLECT_STATUS_MAP[status];
    });

    // ==== Routing ====
    public getDetailRoute(): string[] {
        const collection = this.collection();
        const typeRoutes: Record<CollectionType, string> = {
            GROUP: 'collections/groups',
            ACCOUNT: 'collections/accounts',
            BOT: 'collections/bots',
        };
        return [typeRoutes[collection.collectionType], 'card', collection.id];
    }

    public onClick(): void {
        this.clicked.emit(this.collection());
    }

    protected readonly event = event;
}
