import {Platform} from '../../deanon/deanon';

const allowedPlatforms = {
    "platforms": [
        {
            "id": 0,
            "name": "FACEBOOK",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO",
                "ACTIVITY"
            ]
        },
        {
            "id": 1,
            "name": "INSTAGRAM",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO",
                "ACTIVITY",
                "OSINT"
            ]
        },
        {
            "id": 2,
            "name": "TELEGRAM",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO",
                "ACTIVITY",
                "PING_VPN",
                "OSINT"
            ]
        },
        {
            "id": 3,
            "name": "TIKTOK",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO",
                "ACTIVITY"
            ]
        },
        {
            "id": 4,
            "name": "YOUTUBE_UPLOADS",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO",
                "ACTIVITY"
            ]
        },
        {
            "id": 5,
            "name": "YOUTUBE_COMMENTS",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO",
                "ACTIVITY"
            ]
        },
        {
            "id": 6,
            "name": "VK",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO",
                "OSINT"
            ]
        },
        {
            "id": 7,
            "name": "X",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO"
            ]
        },
        {
            "id": 8,
            "name": "WHATSAPP",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO"
            ]
        },
        {
            "id": 9,
            "name": "LINKEDIN",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO"
            ]
        },
        {
            "id": 10,
            "name": "REDDIT",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO"
            ]
        },
        {
            "id": 11,
            "name": "OK",
            "key": "okru",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO"
            ]
        },
        {
            "id": 12,
            "name": "YOUTUBE",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO",
                "ACTIVITY"
            ]
        },
        {
            "id": 13,
            "name": "OK",
            "key": "okru_phone",
            "methods": [
                "CALL",
                "PHISHING",
                "PHOTO"
            ]
        },
    ]
};

export function getPlatforms(): Platform[] {
    return allowedPlatforms.platforms.map(platform => {
        const item = platform;
        item.name = item.name.split('_').join(' ').toLowerCase();
        return item;
    })
}
