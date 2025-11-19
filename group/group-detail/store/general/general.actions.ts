import { GroupEntity } from '../../../models/group.entity';
import { ProfileModel } from '../../../models/profile.model';

export class SetGeneralInfo {
    static readonly type = '[Group] Set General Info';
    constructor(public generalInfo: GroupEntity) {}
}

export class SetProfile {
    static readonly type = '[Group] Set Profile';
    constructor(public profile: ProfileModel) {}
}