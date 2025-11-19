import { Injectable, Signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, map } from 'rxjs';

export type CollectionFilterType = 'groups' | 'accounts' | 'bots';

export interface FilterState {
    search: string;
    platforms: string[];
    folderId?: string;
    isFavorite?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CollectionFilterService {
    private fb = FormBuilder;

    // Store filter states per collection type
    private filterStates = new BehaviorSubject<Record<CollectionFilterType, FilterState>>({
        groups: { search: '', platforms: [] },
        accounts: { search: '', platforms: [] },
        bots: { search: '', platforms: [] }
    });

    // Current active filter type
    private currentFilterType = new BehaviorSubject<CollectionFilterType>('groups');

    constructor(private formBuilder: FormBuilder) {
        this.loadFiltersFromStorage();
    }

    // Create form group for a specific collection type
    createFilterForm(type: CollectionFilterType): FormGroup {
        const savedState = this.filterStates.value[type];

        const form = this.formBuilder.group({
            search: [savedState.search || ''],
            platforms: this.formBuilder.array(savedState.platforms || []),
            folderId: [savedState.folderId || null],
            isFavorite: [savedState.isFavorite || false]
        });

        // Subscribe to form changes and persist
        form.valueChanges.subscribe(value => {
            // Type-safe conversion
            const filterState: FilterState = {
                search: value.search || '',
                platforms: (value.platforms || []).filter((p: string | null): p is string => p !== null),
                folderId: value.folderId || undefined,
                isFavorite: value.isFavorite || false
            };
            this.saveFilterState(type, filterState);
        });

        return form;
    }

    // Get current filter state as signal
    getFilterState(type: CollectionFilterType): Signal<FilterState> {
        return toSignal(
            this.filterStates.pipe(
                map(states => states[type])
            ),
            { initialValue: { search: '', platforms: [] } }
        );
    }

    // Save filter state for a specific type
    private saveFilterState(type: CollectionFilterType, state: FilterState): void {
        const current = this.filterStates.value;
        const updated = {
            ...current,
            [type]: state
        };
        this.filterStates.next(updated);
        this.persistToStorage(updated);
    }

    // Reset filters for a specific type
    resetFilters(type: CollectionFilterType): void {
        const current = this.filterStates.value;
        const updated = {
            ...current,
            [type]: { search: '', platforms: [] }
        };
        this.filterStates.next(updated);
        this.persistToStorage(updated);
    }

    // Reset all filters
    resetAllFilters(): void {
        const initialState = {
            groups: { search: '', platforms: [] },
            accounts: { search: '', platforms: [] },
            bots: { search: '', platforms: [] }
        };
        this.filterStates.next(initialState);
        this.persistToStorage(initialState);
    }

    // Persistence methods
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

    // Get all filter states
    getAllFilterStates(): Signal<Record<CollectionFilterType, FilterState>> {
        return toSignal(this.filterStates, {
            initialValue: {
                groups: { search: '', platforms: [] },
                accounts: { search: '', platforms: [] },
                bots: { search: '', platforms: [] }
            }
        });
    }

    // Set current filter type
    setCurrentFilterType(type: CollectionFilterType): void {
        this.currentFilterType.next(type);
    }

    // Get current filter type
    getCurrentFilterType(): Signal<CollectionFilterType> {
        return toSignal(this.currentFilterType, { initialValue: 'groups' });
    }
}
