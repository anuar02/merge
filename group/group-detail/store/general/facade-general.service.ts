import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { GeneralState } from './general.state';
import { SetGeneralInfo } from './general.actions';

@Injectable()
export class FacadeGeneralService {
    private readonly store = inject(Store);

    generalInfo = this.store.selectSignal(GeneralState.getGeneralInfo);
    profile = this.store.selectSignal(GeneralState.getProfile);

    updateGeneralInfo = (generalInfo: any) => this.store.dispatch(new SetGeneralInfo(generalInfo));
}
