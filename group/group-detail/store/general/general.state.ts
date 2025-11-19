import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { GeneralStateModel } from './general.state-model';
import { SetGeneralInfo, SetProfile } from './general.actions';
import { ProfileModel } from '../../../models/profile.model';

@State<GeneralStateModel>({
    name: 'general',
    defaults: new GeneralStateModel()
})
@Injectable()
export class GeneralState {

    @Selector()
    static getState(state: GeneralStateModel): GeneralStateModel {
        return state;
    }

    @Selector()
    static getGeneralInfo(state: GeneralStateModel): any {
        return state.general;
    }

    @Selector()
    static getProfile(state: GeneralStateModel): ProfileModel {
        return state.profile as ProfileModel;
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
