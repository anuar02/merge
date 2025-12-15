import { Component, computed, EventEmitter, input, Input, Output } from "@angular/core";
import { TranslocoPipe } from "@jsverse/transloco";
import { CheckboxComponent } from "../../../../../../shared/components/checkbox/checkbox.component";
import { PlatformIconComponent } from "../../../../../../shared/components/platform-icon/platform-icon.component";
import { ActionsDropdownComponent } from "../../../../../../shared/components/actions-dropdown/actions-dropdown.component";
import { DropdownItem } from "../../../../../../shared/components/dropdown/dropdown";
import { DatePipe } from "@angular/common";
import { WordEndingPipe } from "../../../../../../shared/pipes/word-ending.pipe";
import { Platform } from "../../../../../deanon/deanon";

@Component({
    selector: 'app-bot-card',
    imports: [
        DatePipe,
        TranslocoPipe,
        // CheckboxComponent,
        PlatformIconComponent,
        ActionsDropdownComponent,
        WordEndingPipe
    ],
    providers: [],
    templateUrl: './bot-card.component.html',
    styleUrl: './bot-card.component.scss',
    host: {
        class: 'card card--xl',
        '(click)': '$event.stopPropagation(); onClick()',
    }
})
export class BotCardComponent {
    @Input() data: any;
    @Input() actions: DropdownItem[] = [];
    @Input() hasActions = true;
    @Input() isDetails = false;
    @Output() clicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() sessionsClicked: EventEmitter<any> = new EventEmitter<any>();
    public platforms = input<Platform[]>([]);

    public platformId = computed(() => {
        return this.platforms().find((p) => p?.name?.toLowerCase() === this.data?.platform?.toLowerCase())?.id || 0;
    });

    public onClick(): void {
        this.clicked.emit();
    }

    public onSessionsClick(): void {
        this.sessionsClicked.emit(this.data.id);
    }
}