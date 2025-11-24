import { Component, computed, input, output, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { getPlatforms } from '../../../../../../mocks/allowed-platforms.mock';
import {BadgeComponent, ChipColor} from "../../../../../../../../shared/components/badge/badge.component";
import {SvgIconComponent} from "../../../../../../../../shared/components/svg-icon/svg-icon.component";
import {PlatformIconComponent} from "../../../../../../../../shared/components/platform-icon/platform-icon.component";

export interface MemberCardData {
    id: string;
    username: string;
    title: string | null;
    photo: string | null;
    accountId: string;
    platform: string;
    postCount: number;
    groupCount: number;
    collectStatus: string | null;
    verified: boolean;
    contentTag: string | null;
    createdAt: string;
    firstCollectedAt: string | null;
    additionMethod?: string;
}

@Component({
    selector: 'app-member-card',
    standalone: true,
    imports: [
        CommonModule,
        TranslocoPipe,
        BadgeComponent,
        SvgIconComponent,
        PlatformIconComponent
    ],
    templateUrl: './member-card.component.html',
    styleUrl: './member-card.component.scss',
    host: {
        'class': 'member-card'
    }
})
export class MemberCardComponent {
    member = input.required<MemberCardData>();
    
    cardClick = output<MemberCardData>();
    infoClick = output<MemberCardData>();
    moreClick = output<MemberCardData>();

    platforms = getPlatforms();

    platformId: Signal<number> = computed(() => {
        const platform = this.member()?.platform;
        if (!platform) return 0;
        
        const found = this.platforms.find(p => p.key === platform);
        return found?.id || 0;
    });

    getPhotoUrl(photo: string | null): string {
        return photo || 'assets/img/misc/person-avatar.png';
    }

    collectStatus: Signal<{ label: string; color: string; iconColor?: ChipColor } | null> = computed(() => {
        const status = this.member()?.collectStatus;
        if (!status) return null;

        // Map collect statuses to badge configurations
        const statusMap: Record<string, { label: string; color: string; iconColor?: ChipColor }> = {
            'COMPLETED': { label: 'common.collectCompleted', color: 'default', iconColor: 'success' },
            'IN_PROGRESS': { label: 'common.collectInProgress', color: 'default', iconColor: 'warning' },
            'SCHEDULED': { label: 'common.collectScheduled', color: 'default', iconColor: 'default' },
            'FAILED': { label: 'common.collectFailed', color: 'default', iconColor: 'error' }
        };

        return statusMap[status] || null;
    });

    isNotMember: Signal<boolean> = computed(() => {
        return this.member()?.additionMethod !== 'BOT';
    });

    tags: Signal<string[]> = computed(() => {
        const contentTag = this.member()?.contentTag;
        if (!contentTag) return [];
        return contentTag.split(' ').filter(tag => tag.trim());
    });

    onCardClick(event: Event): void {
        this.cardClick.emit(this.member());
    }

    onInfoClick(event: Event): void {
        event.stopPropagation();
        this.infoClick.emit(this.member());
    }

    onMoreClick(event: Event): void {
        event.stopPropagation();
        this.moreClick.emit(this.member());
    }

    formatDate(dateString: string | null): string {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }
}
