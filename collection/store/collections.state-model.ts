import { CollectionEntity, CollectionType } from '../models/collection.entity';
import {ServerResponse} from "../../../../core/server-response";
import {QueryParams} from "../../../../core/common";

export class CollectionsStateModel {
    // Collections data per type
    groups: ServerResponse<CollectionEntity>;
    accounts: ServerResponse<CollectionEntity>;
    bots: ServerResponse<CollectionEntity>;

    // Query params per type
    groupsQueryParams: QueryParams;
    accountsQueryParams: QueryParams;
    botsQueryParams: QueryParams;

    // Loading states per type
    groupsLoading: boolean;
    accountsLoading: boolean;
    botsLoading: boolean;

    // Current active type
    activeCollectionType: CollectionType;

    constructor() {
        // Initialize collections-v2
        this.groups = new ServerResponse<CollectionEntity>();
        this.accounts = new ServerResponse<CollectionEntity>();
        this.bots = new ServerResponse<CollectionEntity>();

        // Initialize query params with default sorting
        this.groupsQueryParams = {
            page: 0,
            size: 50,
            sort: 'lastCollectedAt,desc'
        };
        this.accountsQueryParams = {
            page: 0,
            size: 50,
            sort: 'lastCollectedAt,desc'
        };
        this.botsQueryParams = {
            page: 0,
            size: 50,
            sort: 'lastCollectedAt,desc'
        };

        // Initialize loading states
        this.groupsLoading = false;
        this.accountsLoading = false;
        this.botsLoading = false;

        // Set default active type
        this.activeCollectionType = 'GROUP';
    }

    // Helper methods to get data for a specific type
    getCollectionsForType(type: CollectionType): ServerResponse<CollectionEntity> {
        switch (type) {
            case 'GROUP':
                return this.groups;
            case 'ACCOUNT':
                return this.accounts;
            case 'BOT':
                return this.bots;
            default:
                return new ServerResponse<CollectionEntity>();
        }
    }

    getQueryParamsForType(type: CollectionType): QueryParams {
        switch (type) {
            case 'GROUP':
                return this.groupsQueryParams;
            case 'ACCOUNT':
                return this.accountsQueryParams;
            case 'BOT':
                return this.botsQueryParams;
            default:
                return { page: 0, size: 50, sort: 'lastCollectedAt,desc' };
        }
    }

    getLoadingStateForType(type: CollectionType): boolean {
        switch (type) {
            case 'GROUP':
                return this.groupsLoading;
            case 'ACCOUNT':
                return this.accountsLoading;
            case 'BOT':
                return this.botsLoading;
            default:
                return false;
        }
    }
}
