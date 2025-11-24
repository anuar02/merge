import { Component, computed, input, output, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { BadgeComponent, ChipColor } from '../../../../../../shared/components/badge/badge.component';
import { SvgIconComponent } from '../../../../../../shared/components/svg-icon/svg-icon.component';
import { PlatformIconComponent } from '../../../../../../shared/components/platform-icon/platform-icon.component';
import { getPlatforms } from '../../../../../mocks/allowed-platforms.mock';

export interface GroupHeaderData {
    id: string;
    title: string;
    username?: string;
    photo: string | null;
    platform?: string;
    subscriberCount: number;
    postCount: number;
    collectStatus?: string | null;
    verified?: boolean;
    tags?: string;
    createdAt?: string;
    lastCollection?: string;
}

@Component({
    selector: 'app-group-header-card',
    standalone: true,
    imports: [
        CommonModule,
        TranslocoPipe,
        BadgeComponent,
        SvgIconComponent,
        PlatformIconComponent
    ],
    templateUrl: './group-header-card.component.html',
    styleUrl: './group-header-card.component.scss'
})
export class GroupHeaderCardComponent {
    group = input.required<GroupHeaderData>();
    
    infoClick = output<void>();
    moreClick = output<void>();

    platforms = getPlatforms();

    platformId: Signal<number> = computed(() => {
        const platform = this.group()?.platform;
        if (!platform) return 0;
        
        const found = this.platforms.find(p => p.title === platform);
        return found?.id || 0;
    });

    getPhotoUrl(photo: string | null): string {
        return photo || 'assets/img/misc/group-avatar.png';
    }

    collectStatus: Signal<{ label: string; color: ChipColor; iconColor?: ChipColor } | null> = computed(() => {
        const status = this.group()?.collectStatus;
        if (!status) return null;

        const statusMap: Record<string, { label: string; color: ChipColor; iconColor?: ChipColor }> = {
            'COMPLETED': { label: 'common.collectCompleted', color: 'default', iconColor: 'success' },
            'IN_PROGRESS': { label: 'common.collectInProgress', color: 'default', iconColor: 'warning' },
            'SCHEDULED': { label: 'common.collectScheduled', color: 'default', iconColor: 'gray' },
            'FAILED': { label: 'common.collectFailed', color: 'default', iconColor: 'error' }
        };

        return statusMap[status] || null;
    });

    tags: Signal<string[]> = computed(() => {
        const tagsString = this.group()?.tags;
        if (!tagsString) return [];
        return tagsString.split(' ').filter(tag => tag.trim());
    });

    onInfoClick(event: Event): void {
        event.stopPropagation();
        this.infoClick.emit();
    }

    onMoreClick(event: Event): void {
        event.stopPropagation();
        this.moreClick.emit();
    }

    formatDate(dateString: string | undefined): string {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }
}
