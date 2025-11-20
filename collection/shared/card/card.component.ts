import {
    Component,
    computed,
    EventEmitter,
    inject,
    Output, signal,
    Signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { SvgIconComponent } from '../../../../../shared/components/svg-icon/svg-icon.component';
import { PlatformIconComponent } from '../../../../../shared/components/platform-icon/platform-icon.component';
import { CheckboxComponent } from '../../../../../shared/components/checkbox/checkbox.component';

import { CollectionEntity, CollectionType } from '../../models/collection.entity';
import { environment } from '../../../../../../environments/environment';
import { COLLECT_STATUS_MAP } from '../../../base/utils/collect-status-map';
import { input } from '@angular/core';
import {BadgeComponent} from "../../../../../shared/components/badge/badge.component";

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
        CheckboxComponent,
        BadgeComponent,
    ],
    templateUrl: 'card.component.html',
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

    // для мультиселекта, если нужно — можно не использовать
    public checkbox = input<boolean>(false);
    public index = input<number>(0);
    public selectedRows = input<number[]>([]);

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

    public tags: Signal<string[]> = computed(() => {
        return this.collection()?.contentTag?.split(' ') || [];
    });

    avatarLoaded = signal(false);

    onAvatarLoad() {
        this.avatarLoaded.set(true);
    }

    onAvatarError() {
        this.avatarLoaded.set(true);
    }

    get photoUrl(): string {
        const photo = this.collection().photo;
        console.log(`resources/media?path=${encodeURIComponent(photo)}`)
        return `resources/media?path=${encodeURIComponent(photo)}`;
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

    public onAvatarClick(): void {
        this.router.navigate(this.getDetailRoute());
    }

    // ==== Display helpers ====

    public shouldShowMonitoringButton(): boolean {
        const c = this.collection();
        if (!this.showMonitoring()) return false;
        if (!this.isOnline) return false;

        // логика как у тебя: скрывать мониторинг для TELEGRAM/WHATSAPP MESSENGER
        if (
            c.sourceType === 'MESSENGER' &&
            (c.platform === 'TELEGRAM' || c.platform === 'WHATSAPP')
        ) {
            return false;
        }

        return true;
    }

    // Общий набор метрик (отличается по типам)
    public getCounts(): { label: string; value: number }[] {
        const c = this.collection();
        const counts: { label: string; value: number }[] = [];

        if (c.collectionType === 'GROUP' || c.collectionType === 'ACCOUNT') {
            if (typeof c.groupCount === 'number') {
                counts.push({
                    label: 'accounts.groupCount',
                    value: c.groupCount,
                });
            }
            counts.push({
                label: 'accounts.publicationsCount',
                value: c.postCount,
            });
            if (typeof c.subscriberCount === 'number') {
                counts.push({
                    label: 'accounts.subscribers',
                    value: c.subscriberCount,
                });
            }
        }

        if (c.collectionType === 'BOT') {
            if (typeof c.memberCount === 'number') {
                counts.push({
                    label: 'accounts.members',
                    value: c.memberCount,
                });
            }
            counts.push({
                label: 'accounts.publicationsCount',
                value: c.postCount,
            });
        }

        return counts;
    }
}
