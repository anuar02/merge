import { ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { tap } from 'rxjs';
import { SetProfile } from '../../store/general/general.actions';
import { AccountDetailApiService } from '../../../shared/api/account-detail-api.service';
import { AccountProfileModel } from '../../../models/account-profile.model';
import { catchError } from 'rxjs/operators';
import { NotificationsService } from '../../../../../../shared/services/notifications.service';
import { TranslocoService } from '@jsverse/transloco';

export const profileResolver = (route: ActivatedRouteSnapshot) => {
    const store = inject(Store);
    const notificationService = inject(NotificationsService);
    const translocoService = inject(TranslocoService);

    return inject(AccountDetailApiService).getProfile(route.parent?.paramMap.get('id') as string).pipe(
        tap((profile: AccountProfileModel) => {
            store.dispatch(new SetProfile(profile));
        }),
        catchError((err) => {
            notificationService.addNotification(
                'error',
                'common.error',
                translocoService.translate('accounts.profileResolveErrorMessage') + err.status,
                1500
            );
            throw new Error(err);
        })
    );
}
