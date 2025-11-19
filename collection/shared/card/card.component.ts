import { Component, computed, EventEmitter, inject, Input, input, Output, Signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import {SvgIconComponent} from "../../../../../shared/components/svg-icon/svg-icon.component";
import {BadgeComponent} from "../../../../../shared/components/badge/badge.component";
import {PlatformIconComponent} from "../../../../../shared/components/platform-icon/platform-icon.component";
import {CollectionEntity, CollectionType} from "../../models/collection.entity";
import {environment} from "../../../../../../environments/environment";
import {COLLECT_STATUS_MAP} from "../../../base/utils/collect-status-map";

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
        BadgeComponent,
        PlatformIconComponent,
    ],
    templateUrl: './collection-card.component.html',
    host: {
        class: 'card',
        '(click)': '$event.stopPropagation(); onClick()',
    }
})
export class CollectionCardComponent {
    private router = inject(Router);

    // Inputs
    public collection = input.required<CollectionEntity>();
    public platforms = input<Platform[]>([]);
    public showMonitoring = input<boolean>(true);
    public bindingList = input<any[]>([]);

    // Outputs
    @Output() clicked: EventEmitter<CollectionEntity> = new EventEmitter<CollectionEntity>();
    @Output() monitoringCreated = new EventEmitter<void>();
    @Output() monitoringDisabled = new EventEmitter<void>();

    public isOnline = environment.appType.toUpperCase() === 'ONLINE';

    // Computed properties
    public platformId = computed(() => {
        return this.platforms().find((p) =>
            p?.name?.toLowerCase() === this.collection()?.platform?.toLowerCase()
        )?.id || 0;
    });

    public tags: Signal<string[]> = computed(() => {
        return this.collection()?.contentTag?.split(' ') || [];
    });

    public collectStatus = computed(() => {
        const status = this.collection()?.collectStatus;
        return COLLECT_STATUS_MAP[status];
    });

    // Get route based on collection type
    public getDetailRoute(): string[] {
        const collection = this.collection();
        const typeRoutes: Record<CollectionType, string> = {
            'GROUP': 'collections/groups',
            'ACCOUNT': 'collections/accounts',
            'BOT': 'collections/bots'
        };
        return [typeRoutes[collection.collectionType], 'card', collection.id];
    }

    public onClick(): void {
        this.clicked.emit(this.collection());
    }

    public onAvatarClick(): void {
        this.router.navigate(this.getDetailRoute());
    }

    // Type-specific display logic
    public getDisplayName(): string {
        const c = this.collection();
        return c.title || c.username || c.searchValue || '';
    }

    public getDisplaySubtitle(): string {
        const c = this.collection();
        if (c.username) return '@' + c.username;
        if (c.accountId) return 'ID: ' + c.accountId;
        if (c.url) return c.url;
        return '';
    }

    // Check if monitoring should be hidden for certain types
    public shouldHideMonitoring(): boolean {
        const c = this.collection();
        return c.sourceType === 'MESSENGER' &&
            (c.platform === 'TELEGRAM' || c.platform === 'WHATSAPP');
    }

    // Get appropriate counts to display
    public getCounts(): { label: string, value: number }[] {
        const c = this.collection();
        const counts: { label: string, value: number }[] = [];

        if (c.collectionType === 'GROUP' || c.collectionType === 'ACCOUNT') {
            if (typeof c.groupCount === 'number') {
                counts.push({ label: 'accounts.groupCount', value: c.groupCount });
            }
            if (typeof c.postCount === 'number') {
                counts.push({ label: 'accounts.publicationsCount', value: c.postCount });
            }
            if (typeof c.subscriberCount === 'number') {
                counts.push({ label: 'accounts.subscribers', value: c.subscriberCount });
            }
        }

        if (c.collectionType === 'BOT') {
            if (typeof c.memberCount === 'number') {
                counts.push({ label: 'accounts.members', value: c.memberCount });
            }
            if (typeof c.postCount === 'number') {
                counts.push({ label: 'accounts.publicationsCount', value: c.postCount });
            }
        }

        return counts;
    }
}
