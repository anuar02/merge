import { Component, computed, HostBinding, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { MemberCardComponent, MemberCardData } from './components/member-card/member-card.component';
import { SvgIconComponent } from '../../../../../../shared/components/svg-icon/svg-icon.component';
import {BasePageableListComponent} from "../../../../base/base-pageable-list/base-pageable-list.component";
import {FacadeAccountsService} from "../../../../account/store/facade-accounts.service";

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoPipe,
    MemberCardComponent,
    SvgIconComponent,
    BasePageableListComponent
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent {
  @HostBinding('class') class = 'members-page';

  private facadeAccountsService = inject(FacadeAccountsService);

  searchControl = new FormControl('');
  selectedView: 'table' | 'cards' = 'cards';
  selectAll = false;

  members: Signal<MemberCardData[]> = computed(() => {
    return this.facadeAccountsService.accounts() as MemberCardData[];
  });
  //
  // totalMembers: Signal<number> = computed(() => {
  //   return this.facadeAccountsService.total();
  // });

  isLoading: Signal<boolean> = this.facadeAccountsService.isLoading;

  toggleView(view: 'table' | 'cards'): void {
    this.selectedView = view;
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
  }

  onMemberCardClick(member: MemberCardData): void {
    console.log('Card clicked:', member);
    // TODO: Navigate to member detail page
  }

  onMemberInfoClick(member: MemberCardData): void {
    console.log('Info clicked:', member);
    // TODO: Show member info modal
  }

  onMemberMoreClick(member: MemberCardData): void {
    console.log('More clicked:', member);
    // TODO: Show actions menu
  }

  onSearch(): void {
    const searchValue = this.searchControl.value;
    console.log('Search:', searchValue);
    // TODO: Implement search
  }

  onFilterClick(): void {
    console.log('Filter clicked');
    // TODO: Show filter modal
  }

  onSortClick(): void {
    console.log('Sort clicked');
    // TODO: Show sort options
  }
}
