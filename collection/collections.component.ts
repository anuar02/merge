import {Component, HostBinding, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {HeaderService} from '../../../core/services/header.service';

@Component({
    selector: 'app-collections-v2',
    standalone: true,
    imports: [
        RouterModule,
    ],
    template: `
        <router-outlet></router-outlet>
    `,
    styleUrl: 'collections.component.scss'
})
export class CollectionsComponent {
    private headerService = inject(HeaderService);

    constructor() {
        this.headerService.setTitle('modules.collections-v2');
        this.headerService.isNavButtonsVisible = false;
    }
}
