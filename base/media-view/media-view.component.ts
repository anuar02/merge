import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

import { Media } from '../../group/models/group.entity';
import { SvgIconComponent } from "../../../../shared/components/svg-icon/svg-icon.component";

@Component({
    selector: 'app-media-view',
    imports: [NgIf, SvgIconComponent],
    templateUrl: './media-view.component.html',
    standalone: true,
    styleUrl: './media-view.component.scss'
})
export class MediaViewComponent {
    @HostBinding() class = 'media-overlay';

    @Input() media!: Media;
    @Input() closeButton = false;

    @Output() closed: EventEmitter<Event> = new EventEmitter<Event>();

    closeOverlay(event: Event): void {
        this.closed.emit(event);
    }

    close(event: Event): void {
        this.closed.emit(event);
    }
}
