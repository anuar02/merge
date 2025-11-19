import { InjectionToken } from '@angular/core';
import { Option } from '../../../../shared/components/select/select';

export const TONALITY_DICTIONARY = new InjectionToken<Option[]>('TONALITY_DICTIONARY');
export const CONTENT_TOPIC_DICTIONARY = new InjectionToken<Option[]>('CONTENT_TOPIC_DICTIONARY');
export const SEARCH_PARAM_DICTIONARY = new InjectionToken<Option[]>('SEARCH_PARAM_DICTIONARY');

export const searchParamTypes: Option[] = [
    {
        title: 'ID',
        value: 'ID',
    },
    {
        title: 'URL',
        value: 'URL',
    },
    {
        title: 'Username',
        value: 'SCREEN_NAME',
    }
];

export const contentTopics: Option[] = [
    {
        title: 'accounts.contentTopics.deviant',
        value: 'DEVIANT',
        titleTranslate: true,
    },
    {
        title: 'accounts.contentTopics.crime',
        value: 'CRIME',
        titleTranslate: true,
    },
    {
        title: 'accounts.contentTopics.interEthnic',
        value: 'INTER_ETHNIC',
        titleTranslate: true,
    },
    {
        title: 'accounts.contentTopics.extremism',
        value: 'EXTREMISM',
        titleTranslate: true,
    },
    {
        title: 'accounts.contentTopics.notDefined',
        value: 'NOT_DEFINED',
        titleTranslate: true,
    },
]

export const tonalities: Option[] = [
    {
        title: 'accounts.tonalities.neutral',
        value: 'NEUTRAL',
        titleTranslate: true,
    },
    {
        title: 'accounts.tonalities.moderate',
        value: 'MODERATE',
        titleTranslate: true,
    },
    {
        title: 'accounts.tonalities.aggressive',
        value: 'AGGRESSIVE',
        titleTranslate: true,
    },
]