import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { MembersState } from './members.state';
import { GetMembers } from './members.actions';

@Injectable({
    providedIn: 'root'
})
export class FacadeMembersService {
    private readonly store = inject(Store);

    state$: Observable<any> = inject(Store).select(MembersState.getState);
    membersContent$: Observable<any> = inject(Store).select(MembersState.getMembersContent);

    getMembers = () => this.store.dispatch(new GetMembers());

}
