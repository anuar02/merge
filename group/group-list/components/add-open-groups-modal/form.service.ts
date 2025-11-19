import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MonitoringDetails } from '../../../models/monitoring-details.model';

@Injectable()
export class FormService {
    private fb = inject(FormBuilder);

    public form = this.fb.group({
        source: ['PUBLIC_SOURCE'], // Возможно не заполняется на фронте руками. Или при выборе открытой группы заполняется автоматически
        sourceType: ['SOCIAL_NETWORK', [Validators.required]], // Тип платформы (Messenger, Social Network)

        searchParamType: ['ID', [Validators.required]], // ID, URL, Screen Name
        searchValue: ['', [Validators.required, Validators.pattern(/^\S*$/)]], // Значение для поиска (ID, URL, Screen Name)
        platform: ['', [Validators.required]], // Платформа (Instagram, WhatsApp, Facebook, Telegram, VK, YouTube, TikTok)
        monitor: [true], // Мониторинг
        monitoringDetails: this.fb.group({
            monitoringType: ['ONE_TIME'],
            collectedSections: this.fb.array(['GENERAL_INFO', 'MEMBERS', 'POSTS']), // Сущности
            regularPeriod: this.fb.group({
                start: [''], // Дата начала сбора
                end: ['', []], // Дата окончания сбора
            }),
            oneTimeStart: [''] // Дата начала единоразового сбора
        }), // Детали мониторинга

        note: ['', [Validators.maxLength(500)]], // Заметка
        global: [false], // Видимость для всех пользователей
        // contentTopic: ['', [Validators.required]], // Тематика (Deviant, Extremis)
        // contentTag: ['', [Validators.required]], // Тэги
        // tonality: ['', [Validators.required]],
    });
}

export interface OpenGroupRequestModel {
    source: string; // Возможно не заполняется на фронте руками. Или при выборе открытой группы заполняется автоматически
    sourceType: string; // Тип платформы (Messenger, Social Network)
    platform: string; // Платформа (Instagram, WhatsApp, Facebook, Telegram, VK, YouTube, TikTok)
    searchParamType: string; // ID, URL, Screen Name
    searchValue: string; // Значение для поиска (ID, URL, Screen Name)
    monitor: boolean; // Мониторинг
    monitoringDetails: MonitoringDetails; // Детали мониторинга
    note: string; // Заметка
    global: boolean; // Видимость для всех пользователей
}

