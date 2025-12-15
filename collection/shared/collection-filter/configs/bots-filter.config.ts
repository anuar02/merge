import {FilterConfig} from "./filter.config";

export const botsFilterConfig: FilterConfig = {
    sections: [
        {
            title: 'bots.platform',
            fields: [
                {
                    key: 'platform',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: 'telegram', label: 'Telegram', count: 100 },
                        { value: 'discord', label: 'Discord', count: 100 }
                    ]
                }
            ]
        },
        {
            title: 'bots.status',
            fields: [
                {
                    key: 'status',
                    type: 'checkboxList',
                    label: '',
                    options: [
                        { value: 'active', label: 'common.active', count: 100 },
                        { value: 'inactive', label: 'common.inactive', count: 100 }
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
