export interface AccountProfileModel {
    id: string;
    accountId: string;
    username: string;
    title: string;
    url: string;
    privacy: boolean;
    verified: boolean;
    postCount: number;
    groupCount: number;
    groupType: string;
    createdAt: string;
    lastCollection: string;
    tags: string;
    description: string;
    domains: string;
    phones: string;
    locations: string;
    sex: string;
    hometown: string;
    education: AccountEducation[];
    career: AccountCareer[];
    langs: string;
    sites: string;
}

export interface AccountEducation {
    company: string;
    url: string;
    department: string;
    division: string;
    title: string;
    period: string;
    city: string;
    description: string;
    positions: {
        title: string;
        period: string;
    }[];
}

export interface AccountCareer {
    company: string;
    title: string;
    period: string;
    country: string;
    city: string;
    url: string;
    positions: {
        title: string;
        period: string;
    }[];
}
