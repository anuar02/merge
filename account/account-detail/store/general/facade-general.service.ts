import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { GeneralState } from './general.state';
import { SetGeneralInfo } from './general.actions';
import { AccountEntity } from '../../../models/account.entity';

@Injectable()
export class FacadeGeneralService {
    private readonly store = inject(Store);

    generalInfo = this.store.selectSignal(GeneralState.getGeneralInfo);
    profile = this.store.selectSignal(GeneralState.getProfile);

    getGeneralInfo = (generalInfo: AccountEntity) => this.store.dispatch(new SetGeneralInfo(generalInfo));
}
