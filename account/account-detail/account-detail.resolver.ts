import { tap } from 'rxjs';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetGeneralInfo } from './store/general/general.actions';
import { AccountDetailApiService } from '../shared/api/account-detail-api.service';
import { AccountEntity } from '../models/account.entity';

export const accountDetailResolver = (route: ActivatedRouteSnapshot) => {

    const store = inject(Store);

    return inject(AccountDetailApiService).getGeneralInfo(route.paramMap.get('id') as string).pipe(
        tap((account: AccountEntity) => {
            store.dispatch(new SetGeneralInfo(account));
        }),
    )
};
