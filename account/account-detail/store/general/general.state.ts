import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GeneralStateModel } from './general.state-model';
import { SetGeneralInfo, SetProfile } from './general.actions';
import { AccountProfileModel } from '../../../models/account-profile.model';
import { AccountEntity } from '../../../models/account.entity';

@State<GeneralStateModel>({
    name: 'accountDetail',
    defaults: new GeneralStateModel()
})
@Injectable()
export class GeneralState {

    @Selector()
    static getState(state: GeneralStateModel): GeneralStateModel {
        return state;
    }

    @Selector()
    static getGeneralInfo(state: GeneralStateModel): AccountEntity {
        return state.general as AccountEntity;
    }

    @Selector()
    static getProfile(state: GeneralStateModel): AccountProfileModel {
        return state.profile as AccountProfileModel;
    }

    @Action(SetGeneralInfo)
    getGeneralInfo(ctx: StateContext<GeneralStateModel>, { generalInfo } : SetGeneralInfo) {
        ctx.patchState({ general: generalInfo });
    }

    @Action(SetProfile)
    setProfile(ctx: StateContext<GeneralStateModel>, { profile }: SetProfile) {
        ctx.patchState({ profile });
    }
}
