import {Component, computed, HostBinding, inject, effect, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterModule} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map, startWith} from 'rxjs/operators';
import {FacadeGeneralService} from '../../store/general/facade-general.service';
import {AccountMembersComponent} from '../members/social-media-members/social-media-members.component';
import {MessengerPublicationsComponent} from "../publications/messenger-publications/publications.component";
import {SocialMediaPublicationsComponent} from "../publications/social-media-publications/publications.component";

type TabType = 'followers' | 'following' | 'mutual';

@Component({
    selector: 'app-audience',
    imports: [
        AccountMembersComponent,
        RouterModule,
        MessengerPublicationsComponent,
        SocialMediaPublicationsComponent,
    ],
    templateUrl: './audience.component.html',
    standalone: true,
    styleUrl: 'audience.component.scss'
})
export class AudienceComponent implements OnInit {
    @HostBinding('class') class = 'group group--nowrap group--expand';

    private facadeGeneralService = inject(FacadeGeneralService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    public sourceType: string = 'MESSENGER'

    ngOnInit() {
        this.sourceType = this.generalInfo().sourceType
    }

    generalInfo = this.facadeGeneralService.generalInfo;

    currentTab = toSignal(
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            startWith(null),
            map(() => {
                const childRoute = this.route.firstChild;
                if (childRoute && childRoute.snapshot.url.length > 0) {
                    const segment = childRoute.snapshot.url[0].path;
                    return (segment as TabType) || 'followers';
                }
                return 'followers' as TabType;
            })
        ),
        {initialValue: 'followers' as TabType}
    );
}
