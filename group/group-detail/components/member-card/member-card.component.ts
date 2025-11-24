import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { BadgeComponent } from '../../../../../../shared/components/badge/badge.component';
import { SvgIconComponent } from '../../../../../../shared/components/svg-icon/svg-icon.component';

export interface MemberCardData {
    id: string;
    accountId: string;
    username: string;
    title: string | null;
    photo: string | null;
    platform: string;
    postCount: number;
    groupCount: number;
    collectStatus: string | null;
    verified: boolean;
    createdAt: string;
    firstCollectedAt: string | null;
    monitor: boolean;
    note: string | null;
}

@Component({
    selector: 'app-member-card',
    standalone: true,
    imports: [
        CommonModule,
        TranslocoPipe,
        BadgeComponent,
        SvgIconComponent
    ],
    templateUrl: './member-card.component.html',
    styleUrl: './member-card.component.scss'
})
export class MemberCardComponent {
    member = input.required<MemberCardData>();
    
    infoClick = output<MemberCardData>();
    moreClick = output<MemberCardData>();
    
    displayName = computed(() => {
        return this.member().title || this.member().username || 'Unknown';
    });

    phoneNumbers = computed(() => {
        // This would come from the actual data - placeholder for now
        return ['+77006000088', '+77059103922'];
    });

    tags = computed(() => {
        // This would come from actual data
        return ['Наркотики', 'Политика', 'Терроризм'];
    });

    getPhotoUrl(): string {
        return this.member().photo || 'assets/img/misc/person-avatar.png';
    }

    getPlatformIcon(): string {
        const platform = this.member().platform?.toLowerCase();
        return `icon-${platform}`;
    }

    getCollectStatusBadge() {
        const status = this.member().collectStatus;
        if (!status) return null;
        
        return {
            label: `collect.status.${status}`,
            color: 'default',
            icon: 'icon-dot'
        };
    }

    formatDate(date: string | null): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('ru-RU');
    }

    onInfoClick(): void {
        this.infoClick.emit(this.member());
    }

    onMoreClick(): void {
        this.moreClick.emit(this.member());
    }
}
