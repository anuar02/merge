import { GroupService } from './api/group.service';
import { tap } from 'rxjs';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { GroupEntity } from '../models/group.entity';
import { Store } from '@ngxs/store';
import { SetGeneralInfo } from './store/general/general.actions';

export const groupDetailResolver = (route: ActivatedRouteSnapshot) => {

    const store = inject(Store);

    return inject(GroupService).getGeneralInfo(route.paramMap.get('id') as string).pipe(
        tap((group: GroupEntity) => {
            store.dispatch(new SetGeneralInfo(group));
        }),
    )
};