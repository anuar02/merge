import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import {SvgIconComponent} from "../../../../../../../../shared/components/svg-icon/svg-icon.component";

export interface PublicationMessage {
    postId: string;
    text: string;
    createdAt: string;
    username: string;
    attachPaths: string[];
    commentsCount?: number;
    repliesCount?: number;
    repostsCount?: number;
    likesCount?: number;
    viewsCount?: number;
}

export interface GroupedMessages {
    date: string;
    messages: PublicationMessage[];
}

@Component({
    selector: 'app-publication-message',
    standalone: true,
    imports: [
        CommonModule,
        TranslocoPipe,
        SvgIconComponent
    ],
    templateUrl: './publication-message.component.html',
    styleUrl: './publication-message.component.scss'
})
export class PublicationMessageComponent {
    message = input.required<PublicationMessage>();
    avatarUrl = input<string>('assets/img/misc/person-avatar.png');

    formatTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    formatDateTime(dateString: string): string {
        const date = new Date(dateString);
        return `${date.toLocaleDateString('ru-RU')} ${this.formatTime(dateString)}`;
    }

    hasAttachments(): boolean {
        return this.message().attachPaths && this.message().attachPaths.length > 0;
    }

    getFileType(path: string): 'image' | 'audio' | 'video' | 'document' {
        const ext = path.split('.').pop()?.toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return 'image';
        }
        if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) {
            return 'audio';
        }
        if (['mp4', 'avi', 'mov', 'webm'].includes(ext || '')) {
            return 'video';
        }
        return 'document';
    }

    getFileName(path: string): string {
        return path.split('/').pop() || 'file';
    }

    getFileSize(path: string): string {
        // Mock file size - in real app, this would come from backend
        return '1.2 MB';
    }
}
