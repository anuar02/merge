import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'wordEnding'
})
export class WordEndingPipe implements PipeTransform {
    private sessions = { singular: 'bots.sessionSingular', plural: 'bots.sessionPlural', genitive: 'bots.sessionGenitive' };
    private active = { singular: 'bots.activeSingular', plural: 'bots.activePlural', genitive: 'bots.activeGenitive' };
    private inactive = { singular: 'bots.inactiveSingular', plural: 'bots.inactivePlural', genitive: 'bots.inactiveGenitive' };
    private groups = { singular: 'bots.groupSingular', plural: 'bots.groupPlural', genitive: 'bots.groupGenitive' };
    
    transform(count: number | null | undefined, type: 'sessions' | 'active' | 'inactive' | 'groups'): string {
        if (typeof count !== 'number') {
            return '';
        }

        const comparisonValue = count.toString().slice(-2);

        if (/\b\d*(?<!1)(?:[234]|[2-9][234])\b/.test(comparisonValue)) {
            return this[type].plural;
        } else if (/\b\d*(?<!1)(?:1|[2-9]1)\b/.test(comparisonValue)) {
            return this[type].singular;
        } else {
            return this[type].genitive;
        }
    }


}
