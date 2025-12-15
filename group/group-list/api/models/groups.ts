export interface GroupsPayload {
    search: string | null;
    platforms: (string | null)[];
};

export interface SourceTypes {
    sourceTypeName: string
    sourceTypeTitle: string
    platforms: Platform[]
}

export interface Platform {
    name: string
    title: string
}

export interface AccountGroupsPayload {
    search?: string | null;
    accountId?: string;
};
