import {CollectionPayload, CollectionType} from "../models/collection.entity";
import {QueryParams} from "../../../../core/common";

export class GetCollections {
    static readonly type = '[Collections] Get Collections';
    constructor(
        public collectionType: CollectionType,
        public payload: CollectionPayload
    ) {}
}

export class SetQueryParams {
    static readonly type = '[Collections] Set Query Params';
    constructor(
        public collectionType: CollectionType,
        public queryParams: QueryParams
    ) {}
}

export class SetActiveCollectionType {
    static readonly type = '[Collections] Set Active Collection Type';
    constructor(public collectionType: CollectionType) {}
}

export class ResetCollections {
    static readonly type = '[Collections] Reset Collections';
    constructor(public collectionType: CollectionType) {}
}

export class AddToFolder {
    static readonly type = '[Collections] Add To Folder';
    constructor(
        public collectionType: CollectionType,
        public collectionId: string,
        public folderId: string
    ) {}
}

export class RemoveFromFolder {
    static readonly type = '[Collections] Remove From Folder';
    constructor(
        public collectionType: CollectionType,
        public collectionId: string
    ) {}
}

export class ToggleFavorite {
    static readonly type = '[Collections] Toggle Favorite';
    constructor(
        public collectionType: CollectionType,
        public collectionId: string,
        public isFavorite: boolean
    ) {}
}
