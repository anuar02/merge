import { GroupEntity } from '../../../models/group.entity';
import { ProfileModel } from '../../../models/profile.model';

export class GeneralStateModel {
    general: GroupEntity | null;
    profile: ProfileModel | null;

    constructor() {
        this.general = null;
        this.profile = null;
    }
}