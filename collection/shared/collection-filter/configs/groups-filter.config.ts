import {FilterConfig} from "./filter.config";

export const groupsFilterConfig: FilterConfig = {
    sections: [
        {
            title: 'groups.messenger',
            hasCheckbox: true,
            fields: [
                {
                    key: 'messenger',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: 'telegram', label: 'Telegram', count: 100 },
                        { value: 'whatsapp', label: 'WhatsApp', count: 100 }
                    ]
                }
            ]
        },
        {
            title: 'groups.publicationDate',
            fields: [
                {
                    key: 'publicationPeriod',
                    type: 'dateRange',
                    label: 'groups.publicationDate',
                    placeholder: 'groups.selectPeriod'
                }
            ]
        },
        {
            title: 'groups.participantsCount',
            fields: [
                {
                    key: 'subscriberCount',
                    type: 'numberRange',
                    label: 'groups.participantsCount',
                    min: 1,
                    max: 2345
                }
            ]
        },
        {
            title: 'groups.publicationsCount',
            fields: [
                {
                    key: 'postCount',
                    type: 'numberRange',
                    label: 'groups.publicationsCount',
                    min: 1,
                    max: 2345
                }
            ]
        },
        {
            title: 'groups.closedCommunity',
            fields: [
                {
                    key: 'privacyType',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: 'private', label: 'common.yes', count: 100 },
                        { value: 'public', label: 'common.no', count: 100 }
                    ]
                }
            ]
        },
        {
            title: 'groups.collectionStatus',
            fields: [
                {
                    key: 'collectStatus',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: 'CREATED', label: 'groups.collectionStart', count: 100 },
                        { value: 'IN_PROGRESS', label: 'groups.collecting', count: 100 },
                        { value: 'COMPLETED', label: 'groups.collectionCompleted', count: 100 },
                        { value: 'ERROR', label: 'groups.collectionError', count: 100 }
                    ]
                }
            ]
        },
        {
            title: 'groups.onMonitoring',
            fields: [
                {
                    key: 'monitor',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: true, label: 'common.yes' },
                        { value: false, label: 'common.no' }
                    ]
                }
            ]
        },
        {
            title: 'groups.hasAvatar',
            fields: [
                {
                    key: 'hasAvatar',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: 'yes', label: 'common.yes'},
                        { value: 'no', label: 'common.no'}
                    ]
                }
            ]
        },
        {
            title: 'groups.hasPhoneNumber',
            fields: [
                {
                    key: 'hasPhoneNumber',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: true, label: 'common.yes'},
                        { value: false, label: 'common.no'}
                    ]
                }
            ]
        },
        {
            title: 'common.tags',
            subsections: [
                {
                    title: 'tags.deviant',
                    hasCheckbox: true,
                    fields: []
                },
                {
                    title: 'tags.criminal',
                    hasCheckbox: true,
                    fields: []
                },
                {
                    title: 'tags.interethnic',
                    hasCheckbox: true,
                    fields: []
                },
                {
                    title: 'tags.extremism',
                    hasCheckbox: true,
                    fields: []
                },
                {
                    title: 'tags.notDefined',
                    hasCheckbox: true,
                    fields: []
                }
            ]
        }
    ]
};
