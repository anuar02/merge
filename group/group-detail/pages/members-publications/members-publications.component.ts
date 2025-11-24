import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembersComponent } from '../members/members.component';
import { PublicationsComponent } from '../publications/publications.component';

@Component({
  selector: 'app-members-publications',
  standalone: true,
  imports: [
    CommonModule,
    MembersComponent,
    PublicationsComponent
  ],
  template: `
    <div class="members-publications-layout">
      <app-members class="members-publications-layout__members"></app-members>
      <app-publications class="members-publications-layout__publications"></app-publications>
    </div>
  `,
  styles: [`
    @use '../../../../../../../assets/scss/util/rem-mixin' as *;
    @use '../../../../../../../assets/scss/settings' as *;

    :host {
      display: block;
      height: 100%;
    }

    .members-publications-layout {
      display: flex;
      gap: rem($spacing-3xl);
      height: 100%;
      overflow: hidden;
    }

    .members-publications-layout__members {
      flex: 1;
      min-width: 0;
      height: 100%;
    }

    .members-publications-layout__publications {
      flex-shrink: 0;
      height: 100%;
    }
  `]
})
export class MembersPublicationsComponent {
  @HostBinding('class') class = 'members-publications-view';
}
