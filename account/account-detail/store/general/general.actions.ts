import { AccountEntity } from '../../../models/account.entity';
import { AccountProfileModel } from '../../../models/account-profile.model';


export class SetGeneralInfo {
    static readonly type = '[Account] Set General Info';
    constructor(public generalInfo: AccountEntity) {}
}

export class SetProfile {
    static readonly type = '[Account] Set Profile';
    constructor(public profile: AccountProfileModel) {}
}