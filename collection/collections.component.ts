import {Component, HostBinding, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TabsComponent} from '../../../shared/components/tabs/tabs.component';
import {HeaderService} from '../../../core/services/header.service';

@Component({
    selector: 'app-collections',
    standalone: true,
    imports: [
        RouterModule,
        TabsComponent,
    ],
    template: `
        <router-outlet></router-outlet>
    `,
})
export class CollectionsComponent {
    private headerService = inject(HeaderService);

    constructor() {
        this.headerService.setTitle('modules.collections');
        this.headerService.isNavButtonsVisible = false;
    }
}
