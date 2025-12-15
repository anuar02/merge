export interface ProfileModel {
    id: string;
    groupId: string;
    username: string;
    title: string;
    url: string;
    privacy: boolean;
    verified: boolean;
    postCount: number;
    subscriberCount: number;
    groupType: string;
    createdAt: string;
    lastCollection: string;
    tags: string;
    description: string;
    domains: string;
}