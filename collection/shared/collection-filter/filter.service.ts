import { Injectable, Signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, map } from 'rxjs';
import {accountsFilterConfig} from "./configs/account-filter.config";
import {FilterConfig, FilterField} from "./configs/filter.config";
import {groupsFilterConfig} from "./configs/groups-filter.config";
import {botsFilterConfig} from "./configs/bots-filter.config";

export type CollectionFilterType = 'groups' | 'accounts' | 'bots';

export interface FilterState {
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class CollectionFilterService {
    private filterConfigs: Record<CollectionFilterType, FilterConfig> = {
        accounts: accountsFilterConfig,
        groups: groupsFilterConfig,
        bots: botsFilterConfig
    };

    private filterStates = new BehaviorSubject<Record<CollectionFilterType, FilterState>>({
        groups: {},
        accounts: {},
        bots: {}
    });

    private currentFilterType = new BehaviorSubject<CollectionFilterType>('groups');

    constructor(private formBuilder: FormBuilder) {
        this.loadFiltersFromStorage();
    }

    getFilterConfig(type: CollectionFilterType): FilterConfig {
        return this.filterConfigs[type];
    }

    createFilterForm(type: CollectionFilterType): FormGroup {
        const config = this.filterConfigs[type];
        const savedState = this.filterStates.value[type];
        const formControls: { [key: string]: any } = {};

        formControls['search'] = this.formBuilder.control(savedState['search'] ?? '');

        formControls['platforms'] = this.formBuilder.array(
            savedState['platforms'] && Array.isArray(savedState['platforms'])
                ? savedState['platforms'].map((v: any) => this.formBuilder.control(v))
                : []
        );

        config.sections.forEach(section => {
            if (section.fields) {
                section.fields.forEach(field => {
                    formControls[field.key] = this.createFormControl(field, savedState);
                });
            }

            if (section.subsections) {
                section.subsections.forEach(subsection => {
                    subsection.fields.forEach(field => {
                        formControls[field.key] = this.createFormControl(field, savedState);
                    });
                });
            }
        });

        const form = this.formBuilder.group(formControls);

        form.valueChanges.subscribe(value => {
            this.saveFilterState(type, value);
        });

        return form;
    }

    private createFormControl(field: FilterField, savedState: FilterState): any {
        const savedValue = savedState[field.key];

        switch (field.type) {
            case 'checkboxList':
                const arrayValues = savedValue && Array.isArray(savedValue) ? savedValue : [];
                return this.formBuilder.array(
                    arrayValues.map(v => this.formBuilder.control(v))
                );

            case 'numberRange':
                return this.formBuilder.control(savedValue ?? null);

            case 'dateRange':
                return this.formBuilder.control(savedValue ?? null);

            case 'checkbox':
                return this.formBuilder.control(savedValue ?? false);

            default:
                return this.formBuilder.control(savedValue ?? field.defaultValue ?? null);
        }
    }

    private saveFilterState(type: CollectionFilterType, state: FilterState): void {
        const config = this.filterConfigs[type];
        const cleanedState: FilterState = {
            search: state.search || '',
            platforms: state.platforms || []
        };

        config.sections.forEach(section => {
            const processField = (field: FilterField) => {
                const value = state[field.key];

                if (field.type === 'numberRange' && value) {
                    const min = Number(field.min ?? 0);
                    const max = Number(field.max ?? 100);
                    if (value.from !== min || value.to !== max) {
                        cleanedState[field.key] = value;
                    }
                } else if (field.type === 'dateRange' && value) {
                    if (value.start && value.end) {
                        cleanedState[field.key] = value;
                    }
                } else if (field.type === 'checkboxList' && value?.length > 0) {
                    cleanedState[field.key] = value;
                } else if (field.type === 'checkbox' && value) {
                    cleanedState[field.key] = value;
                }
            };

            section.fields?.forEach(processField);
            section.subsections?.forEach(subsection => {
                subsection.fields?.forEach(processField);
            });
        });

        const current = this.filterStates.value;
        const updated = {
            ...current,
            [type]: cleanedState
        };
        this.filterStates.next(updated);
        this.persistToStorage(updated);
    }

    resetFilters(type: CollectionFilterType): void {
        const current = this.filterStates.value;
        const updated = {
            ...current,
            [type]: {}
        };
        this.filterStates.next(updated);
        this.persistToStorage(updated);
    }

    private persistToStorage(states: Record<CollectionFilterType, FilterState>): void {
        try {
            localStorage.setItem('collection_filters', JSON.stringify(states));
        } catch (error) {
            console.error('Failed to save filters to localStorage', error);
        }
    }

    private loadFiltersFromStorage(): void {
        try {
            const saved = localStorage.getItem('collection_filters');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.filterStates.next(parsed);
            }
        } catch (error) {
            console.error('Failed to load filters from localStorage', error);
        }
    }

    setCurrentFilterType(type: CollectionFilterType): void {
        this.currentFilterType.next(type);
    }

    public transformFilterPayload(payload: any): any {
        if (!payload) {
            return {};
        }

        const transformed: any = {};

        Object.keys(payload).forEach(key => {
            const value = payload[key];

            if (value === null || value === undefined || value === '') {
                return;
            }

            console.log(payload)

            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return;
                }

                if (key === 'messenger' || key === 'socialNetworks') {
                    if (!transformed.platforms) {
                        transformed.platforms = [];
                    }
                    transformed.platforms.push(...value.map(v => v.toUpperCase()));
                }
                else if (key === 'platforms') {
                    transformed.platforms = value.map(v => v.toUpperCase());
                }
                else if (key === 'privacyType') {
                    const privacyMap: Record<string, string> = {
                        'public': 'PUBLIC',
                        'private': 'PRIVATE'
                    };
                    transformed.privacyType = privacyMap[value[0]] || value[0].toUpperCase();
                }
                else if (key === 'collectStatus') {
                    transformed.collectStatus = value;
                }
                else if (key === 'hasPhoto') {
                    if (value.includes('yes') && !value.includes('no')) {
                        transformed.hasPhoto = true;
                    } else if (value.includes('no') && !value.includes('yes')) {
                        transformed.hasPhoto = false;
                    }
                }
                else if (key === 'hasPhoneNumber') {
                    if (value.includes(true) && !value.includes(false)) {
                        transformed.hasPhoneNumber = true;
                    } else if (value.includes(false) && !value.includes(true)) {
                        transformed.hasPhoneNumber = false;
                    }
                }
                else if (key === 'identified') {
                    if (value.includes(true) && !value.includes(false)) {
                        transformed.identified = true;
                    } else if (value.includes(false) && !value.includes(true)) {
                        transformed.identified = false;
                    }
                }
                else if (key === 'monitor') {
                    if (value.includes(true) && !value.includes(false)) {
                        transformed.monitor = true;
                    } else if (value.includes(false) && !value.includes(true)) {
                        transformed.monitor = false;
                    }
                }
                else if (key === 'deanonMethod') {
                    const methodMap: Record<string, string> = {
                        'activity': 'ACTIVITY',
                        'osint': 'OSINT',
                        'matching': 'MATCHING',
                        'ping_vpn': 'PING_VPN',
                        'phishing': 'PHISHING'
                    };
                    transformed.deanonMethod = value.map((v: string) => methodMap[v] || v.toUpperCase());
                }
                else {
                    transformed[key] = value;
                }
            }
            else if (typeof value === 'object') {
                if ('start' in value || 'end' in value) {
                    transformed[key] = {};
                    if (value.start !== null && value.start !== undefined && value.start !== '') {
                        transformed[key].start = value.start instanceof Date
                            ? value.start.toISOString()
                            : value.start;
                    }
                    if (value.end !== null && value.end !== undefined && value.end !== '') {
                        transformed[key].end = value.end instanceof Date
                            ? value.end.toISOString()
                            : value.end;
                    }

                    if (Object.keys(transformed[key]).length === 0) {
                        delete transformed[key];
                    }
                }
                else if ('from' in value || 'to' in value) {
                    transformed[key] = {};
                    console.log(value)
                    if (value.from !== null && value.from !== undefined && value.from !== '') {
                        transformed[key].start = value.from;
                    }
                    if (value.to !== null && value.to !== undefined && value.to !== '') {
                        transformed[key].end = value.to;
                    }

                    if (Object.keys(transformed[key]).length === 0) {
                        delete transformed[key];
                    }
                }
            }
            else {
                transformed[key] = value;
            }
        });

        if (transformed.platforms && Array.isArray(transformed.platforms)) {
            transformed.platforms = [...new Set(transformed.platforms)];
        }

        return transformed;
    }
}
