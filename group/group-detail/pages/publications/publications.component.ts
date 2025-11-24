import { Component, computed, HostBinding, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { SvgIconComponent } from '../../../../../../shared/components/svg-icon/svg-icon.component';
import {
    GroupedMessages, PublicationMessage,
    PublicationMessageComponent
} from "./components/publication-message/publication-message.component";

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslocoPipe,
    PublicationMessageComponent,
    SvgIconComponent
  ],
  templateUrl: './publications.component.html',
  styleUrl: './publications.component.scss'
})
export class PublicationsComponent {
  @HostBinding('class') class = 'publications-page';

  searchControl = new FormControl('');

  // Mock data - replace with actual service
  publications = computed<GroupedMessages[]>(() => {
    return this.groupMessagesByDate(this.mockPublications());
  });

  totalPublications = computed(() => 440);
  isLoading = computed(() => false);

  // Mock data
  private mockPublications = computed<PublicationMessage[]>(() => [
    {
      postId: '1',
      text: 'В многострадальных городах Экибастуз и Риддер поднимут тарифы на комуслуги\n\nЭтой зимой многие города страны чуть не замёрзли, но больше всего пострадали жители Экибастуза и Риддера. Теперь жителей этих двух городов ожидают перемены.\n\nСегодня министр нацэкономики Алибек Куантыров',
      createdAt: '2024-12-03T17:52:00Z',
      username: 'Ахметов Серик',
      attachPaths: []
    },
    {
      postId: '2',
      text: '',
      createdAt: '2024-12-03T17:52:00Z',
      username: 'Ахметов Серик',
      attachPaths: ['audio.mp3']
    },
    {
      postId: '3',
      text: '',
      createdAt: '2024-12-03T19:15:00Z',
      username: 'Ахметов Серик',
      attachPaths: ['picture.jpg']
    },
    {
      postId: '4',
      text: 'Казахстанцы продолжают убеждать государство, что введение единого времени в стране было ошибкой.',
      createdAt: '2024-12-03T20:07:00Z',
      username: 'Ахметов Серик',
      attachPaths: []
    },
    {
      postId: '5',
      text: '',
      createdAt: '2024-12-03T17:52:00Z',
      username: 'Olivia Rhye',
      attachPaths: ['audio2.mp3']
    },
    {
      postId: '6',
      text: 'Напряженная политическая обстановка не тревожит находящихся в Южной Корее казахстанцев.',
      createdAt: '2024-12-05T11:20:00Z',
      username: 'Ахметов Серик',
      attachPaths: []
    }
  ]);

  groupMessagesByDate(messages: PublicationMessage[]): GroupedMessages[] {
    const groups = new Map<string, PublicationMessage[]>();

    messages.forEach(message => {
      const date = new Date(message.createdAt);
      const dateKey = this.formatDateKey(date);
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(message);
    });

    return Array.from(groups.entries()).map(([date, messages]) => ({
      date,
      messages
    }));
  }

  formatDateKey(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.isSameDay(date, today)) {
      return 'Сегодня';
    } else if (this.isSameDay(date, yesterday)) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
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

  getAvatarUrl(): string {
    return 'assets/img/misc/person-avatar.png';
  }
}
