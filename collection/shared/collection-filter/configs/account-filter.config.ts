import {FilterConfig} from "./filter.config";

export const accountsFilterConfig: FilterConfig = {
    sections: [
        {
            title: 'accounts.platform',
            hasCheckbox: false,
            subsections: [
                {
                    title: 'accounts.messenger',
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
                    title: 'accounts.socialNetworks',
                    hasCheckbox: true,
                    fields: [
                        {
                            key: 'socialNetworks',
                            type: 'checkboxList',
                            label: '',
                            options: [
                                { value: 'instagram', label: 'Instagram', count: 100 },
                                { value: 'facebook', label: 'Facebook', count: 100 },
                                { value: 'tiktok', label: 'Tik-Tok', count: 100 },
                                { value: 'vk', label: 'VK', count: 100 },
                                { value: 'youtube', label: 'Youtube', count: 100 }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: 'accounts.publicationDate',
            fields: [
                {
                    key: 'publicationPeriod',
                    type: 'dateRange',
                    label: 'accounts.publicationDate',
                    placeholder: 'accounts.selectPeriod'
                }
            ]
        },
        {
            title: 'accounts.publicationsCount',
            fields: [
                {
                    key: 'postCount',
                    type: 'numberRange',
                    label: 'accounts.publicationsCount',
                    min: 0,
                    max: 10000
                }
            ]
        },
        {
            title: 'accounts.groupsCount',
            fields: [
                {
                    key: 'groupCount',
                    type: 'numberRange',
                    label: 'accounts.groupsCount',
                    min: 0,
                    max: 1000
                }
            ]
        },
        {
            title: 'accounts.closedProfile',
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
            title: 'accounts.phoneNumberAvailability',
            fields: [
                {
                    key: 'hasPhoneNumber',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: true, label: 'common.yes', count: 100 },
                        { value: false, label: 'common.no', count: 100 }
                    ]
                }
            ]
        },
        {
            title: 'accounts.deanonResult',
            fields: [
                {
                    key: 'identified',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: true, label: 'accounts.identified', count: 100 },
                        { value: false, label: 'accounts.anonymous', count: 100 }
                    ]
                }
            ]
        },
        {
            title: 'accounts.deanonMethod',
            fields: [
                {
                    key: 'deanonMethod',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: 'activity', label: 'accounts.activity', count: 100 },
                        { value: 'osint', label: 'OSINT', count: 100 },
                        { value: 'call', label: 'accounts.call', count: 100 },
                        { value: 'ping_vpn', label: 'Ping VPN', count: 100 },
                        { value: 'phishing', label: 'accounts.phishing', count: 100 },
                        { value: 'photo', label: 'accounts.photo', count: 100 }
                    ]
                }
            ]
        },
        {
            title: 'accounts.collectionStatus',
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
            title: 'accounts.onMonitoring',
            fields: [
                {
                    key: 'monitor',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: true, label: 'common.yes', count: 100 },
                        { value: false, label: 'common.no', count: 100 }
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
