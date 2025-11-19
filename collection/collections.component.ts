import { Component, HostBinding, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {TabsComponent} from "../../../shared/components/tabs/tabs.component";
import {HeaderService} from "../../../core/services/header.service";
import {Tab} from "../../../shared/components/tabs/tabs";

@Component({
    selector: 'app-collections',
    standalone: true,
    imports: [RouterModule, TabsComponent],
    template: `
        <div class="body__container container">
            <div class="body__wrapper">
                <div class="grid grid--group">
                    <app-tabs [tabs]="tabs" [useRoutes]="true"></app-tabs>
                    <router-outlet></router-outlet>
                </div>
            </div>
        </div>
    `,
})
export class CollectionsComponent {
    @HostBinding('class') class = 'body';

    private headerService = inject(HeaderService);

    tabs: Tab[] = [
        new Tab('navbar.groups', 'groups', true, '', 'groups'),
        new Tab('navbar.accounts', 'accounts', true, '', 'accounts'),
        new Tab('navbar.bots', 'bots', true, '', 'bots'),
    ];

    constructor() {
        this.headerService.setTitle('modules.collections');
        this.headerService.isNavButtonsVisible = false;
    }
}
