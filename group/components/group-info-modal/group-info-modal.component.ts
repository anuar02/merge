import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ModalWrapperComponent} from "../../../../../shared/components/modal/modal-wrap/modal-wrap.component";
import {LoaderComponent} from "../../../../deanon/components/loader/loader.component";
import {BaseModalComponent} from "../../../../../shared/components/modal/base-modal/base-modal.component";
import {TranslocoPipe} from "@jsverse/transloco";
import {SvgIconComponent} from "../../../../../shared/components/svg-icon/svg-icon.component";

interface groupDetails {
    id: string;
    url: string;
    privacy: string;
    type: string;
    inviteLink: string;
}

interface AddedByUser {
    name: string;
    username: string;
    avatarUrl?: string;
    lastCollectionDate: string;
}

interface AIProfile {
    conclusion: string;
    createdDate: string;
}

@Component({
    selector: 'app-group-info-modal',
    standalone: true,
    imports: [CommonModule, ModalWrapperComponent, LoaderComponent, SvgIconComponent],
    templateUrl: 'group-info-modal.component.html',
    styleUrl: 'group-info-modal.component.scss'
})
export class GroupInfoModalComponent extends BaseModalComponent {
    loading = false;
    aiProfileLoading = false;

    title = 'Общая информация';
    description = 'Присоединяйтесь к нам, чтобы делиться своими идеями, участвовать в обсуждениях и работать вместе на благо будущего нашей страны!';

    groupDetails: groupDetails = {
        id: '54646846454',
        url: 'telegram.com/aktivist_dvk',
        privacy: 'Открытый',
        type: 'Группа',
        inviteLink: 'telegram.com/aktivist_dvk'
    };

    addedByUser: AddedByUser = {
        name: 'Ахметов Кайрат',
        username: '@kairat16dep',
        lastCollectionDate: '24.12.2024'
    };

    aiProfile: AIProfile = {
        conclusion: 'человек из «серой массы» — не конфликтна, не склонна к рисковому поведению, не имеет признаков двойной жизни. Потенциально может быть полезна как источник бытовой информации, но сама по себе — маловероятный субъект интереса',
        createdDate: '20.02.2024'
    };

    closeBtn(): void {
        super.close();
    }

    onCancel(): void {
        super.close();
    }

    onConfirm(): void {

    }

    onRefreshAIProfile(): void {
        this.aiProfileLoading = true;
        // Simulate API call
        setTimeout(() => {
            this.aiProfileLoading = false;
        }, 1000);
    }

    openLink(url: string): void {
        window.open(`https://${url}`, '_blank');
    }
}
