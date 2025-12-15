import { AccountEntity } from '../../../models/account.entity';
import { AccountProfileModel } from '../../../models/account-profile.model';

export class GeneralStateModel {
    general: AccountEntity | null;
    profile: AccountProfileModel | null;

    constructor() {
        this.general = null;
        this.profile = null;
    }
}