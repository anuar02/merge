import {Component, HostBinding, inject, Input, OnDestroy, OnInit, Pipe, PipeTransform, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {DatePipe, NgFor, NgIf} from '@angular/common';
import {GroupApiService} from '../../../shared/api/group-api.service';
import {Media, MediaType, Post} from '../../../models/group.entity';
import {Subject, takeUntil, fromEvent, debounceTime} from 'rxjs';
import {ServerResponse} from '../../../../../../core/server-response';
import {PageParams} from '../../../../../../shared/components/pagination-panel/pagination-panel';
import {GroupService} from '../../api/group.service';
import {environment} from '../../../../../../../environments/environment';
import {MediaViewComponent} from '../../../../base/media-view/media-view.component';
import {NotFoundComponent} from '../../../../../../shared/components/not-found/not-found.component';
import {TranslocoPipe} from '@jsverse/transloco';
import {Router} from '@angular/router';
import {CryptoRequest} from '../../../../../crypto-wallets/crypto-wallets';
import {StatusCode} from '../../../../../../shared/components/status-badge/status';
import {SearchBarComponent} from "../../../../../../shared/components/search-bar/search-bar.component";

interface PostGroup {
    dateLabel: string;
    posts: Post[];
}

const fielTypeMap: Record<string, { path: string, label: string }> = {
    'PHOTO': { label: 'Фото', path: 'assets/img/filetypes/file-image.png' },
    'VIDEO': { label: 'Видео', path: 'assets/img/filetypes/file.png' },
    'AUDIO': { label: 'Аудио', path: 'assets/img/filetypes/file.png' },
}
const appType = environment.appType.toUpperCase();
const appUrl = appType === 'ONLINE' ? 'https://knb-linxera-dev-online.pulsar.kazdream.kz' : 'https://knb-linxera-dev.pulsar.kazdream.kz';
const hostname = environment.apiUrl.indexOf('v1') > -1 ? appUrl : environment.apiUrl;

@Pipe({
    name: 'walletLink',
    standalone: true
})
export class WalletLinkPipe implements PipeTransform {
    transform(value: string): { before: string, token: string | null, after: string } {
        const regex = /(T[a-zA-Z0-9]{33})/;
        const match = value.match(regex);

        if (!match || appType === 'ONLINE') {
            return { before: value, token: null, after: '' };
        }

        const token = match[0];
        const index = match.index!;
        const before = value.substring(0, index);
        const after = value.substring(index + token.length);

        return { before, token, after };
    }
}


@Component({
    selector: 'app-publications',
    imports: [
        NgFor,
        NgIf,
        DatePipe,
        MediaViewComponent,
        NotFoundComponent,
        SearchBarComponent,
        TranslocoPipe,
        WalletLinkPipe,
    ],
    providers: [
        GroupApiService,
    ],
    templateUrl: './publications.component.html',
    standalone: true,
    styleUrl: './publications.component.scss'
})
export class PublicationsComponent implements OnInit, OnDestroy, AfterViewInit {
    @HostBinding('class') class = 'group group--expand group--nowrap';
    @Input() groupId: string | null = null;
    @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

    private destroyed: Subject<void> = new Subject<void>();
    private router = inject(Router);

    posts: ServerResponse<Post> = new ServerResponse<Post>;
    allPosts: Post[] = [];
    groupedPosts: PostGroup[] = [];
    isLoading = false;
    isLoadingMore = false;
    isLoaded = false;
    formats: MediaType[] = [];
    pageParams: PageParams = new PageParams(0, 20, 'createdAt,desc');
    shownMedia: Media | null = null;
    hasMore = true;
    private previousScrollHeight = 0;
    private isInitialLoad = true;

    constructor(
        private groupApiService: GroupApiService,
        private groupService: GroupService,
    ) {
        this.getMediaFormats();
    }

    ngOnInit(): void {
        if (this.groupId) {
            setTimeout(() => this.getPosts(), 200);
        }
    }

    ngAfterViewInit(): void {
        this.setupScrollListener();
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
    }

    setupScrollListener(): void {
        if (!this.scrollContainer) return;

        fromEvent(this.scrollContainer.nativeElement, 'scroll')
            .pipe(
                debounceTime(200),
                takeUntil(this.destroyed)
            )
            .subscribe(() => {
                this.onScroll();
            });
    }

    onScroll(): void {
        if (!this.scrollContainer || this.isLoadingMore || !this.hasMore) return;

        const element = this.scrollContainer.nativeElement;
        const scrollTop = element.scrollTop;

        // Load more when scrolling near the top (within 200px)
        if (scrollTop < 200) {
            this.loadMorePosts();
        }
    }

    getMediaFormats(): void {
        this.groupApiService.getMediaTypes().pipe(
            takeUntil(this.destroyed)
        ).subscribe(res => {
            this.formats = res;
        });
    }

    getPosts(search?: string): void {
        if (!this.groupId) {
            console.error('PublicationsComponent: groupId is required');
            return;
        }

        this.isLoading = true;
        this.isLoaded = false;
        this.allPosts = [];
        this.pageParams.page = 0;
        this.hasMore = true;
        this.isInitialLoad = true;

        this.groupApiService.getPosts({
            subject: {
                subjectId: this.groupId,
                subjectType: 'GROUP',
            },
            search,
        }, this.pageParams).pipe(
            takeUntil(this.destroyed)
        ).subscribe(res => {
            this.posts = res;
            this.allPosts = [...res.content];
            this.allPosts.forEach(post => {
                this.processPost(post);
            });
            this.groupPostsByDate();
            this.hasMore = !res.last;
            this.isLoading = false;
            this.isLoaded = true;

            // Scroll to bottom on initial load
            setTimeout(() => {
                this.scrollToBottom();
                this.isInitialLoad = false;
            }, 100);
        });
    }

    loadMorePosts(): void {
        if (this.isLoadingMore || !this.hasMore || this.isLoading || !this.groupId) return;

        this.isLoadingMore = true;
        this.pageParams.page++;

        // Store current scroll height before loading
        if (this.scrollContainer) {
            this.previousScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
        }

        this.groupApiService.getPosts({
            subject: {
                subjectId: this.groupId,
                subjectType: 'GROUP',
            },
        }, this.pageParams).pipe(
            takeUntil(this.destroyed)
        ).subscribe(res => {
            const newPosts = res.content;
            newPosts.forEach(post => {
                this.processPost(post);
            });

            // Add new posts at the beginning (older posts)
            this.allPosts = [...newPosts, ...this.allPosts];
            this.groupPostsByDate();
            this.hasMore = !res.last;
            this.isLoadingMore = false;

            // Maintain scroll position after new content loads
            setTimeout(() => {
                this.maintainScrollPosition();
            }, 50);
        });
    }

    scrollToBottom(): void {
        if (this.scrollContainer) {
            const element = this.scrollContainer.nativeElement;
            element.scrollTop = element.scrollHeight;
        }
    }

    maintainScrollPosition(): void {
        if (this.scrollContainer) {
            const element = this.scrollContainer.nativeElement;
            const newScrollHeight = element.scrollHeight;
            const scrollDifference = newScrollHeight - this.previousScrollHeight;
            element.scrollTop = scrollDifference;
        }
    }

    groupPostsByDate(): void {
        const groups = new Map<string, Post[]>();

        this.allPosts.forEach(post => {
            const dateKey = this.getDateKey(post.createdAt);
            if (!groups.has(dateKey)) {
                groups.set(dateKey, []);
            }
            groups.get(dateKey)!.push(post);
        });

        // Sort groups by date (oldest first for messenger-style display)
        const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
            return a[0].localeCompare(b[0]);
        });

        this.groupedPosts = sortedGroups.map(([dateKey, posts]) => ({
            dateLabel: this.formatDateLabel(dateKey),
            posts
        }));
    }

    getDateKey(dateString: string): string {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    formatDateLabel(dateKey: string): string {
        const [year, month, day] = dateKey.split('-').map(Number);
        const postDate = new Date(year, month - 1, day);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time parts for comparison
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        postDate.setHours(0, 0, 0, 0);

        if (postDate.getTime() === today.getTime()) {
            return 'common.today';
        } else if (postDate.getTime() === yesterday.getTime()) {
            return 'common.yesterday';
        } else {
            return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
        }
    }

    handleChangePage(event: EventTarget | null | number): void {
        if (typeof event === 'number') {
            this.pageParams.page = event;
            this.getPosts();
        }
    }

    handleChangeItemsPerPage(event: EventTarget | null | number): void {
        if (typeof event === 'number') {
            this.pageParams.page = 0;
            this.pageParams.size = event;
            this.getPosts();
        }
    }

    isFormat(attachment: string, type: string): boolean {
        const parts = attachment.split('.');
        const format = this.formats.find(v => v.extensions.includes(parts[parts.length - 1]));
        if (format) {
            return format.mediaType.toUpperCase() === type.toUpperCase();
        }
        return false;
    }

    processPost(post: Post): void {
        const allUrls = post.attachPaths;
        allUrls.forEach(url => {
            const tempUrl = `${hostname}/resources-v2/media?path=${url}`;
            const parts = tempUrl.split('.');
            if (this.isFormat(tempUrl, 'PHOTO')) {
                const result = { url: tempUrl, type: `${parts[parts.length - 1]}`, mediaType: 'image' };
                post.imgUrls ? post.imgUrls.push(result) : post.imgUrls = [result];
            }
            if (this.isFormat(tempUrl, 'AUDIO')) {
                const result = { url: tempUrl, type: `audio/${parts[parts.length - 1]}`, mediaType: 'audio' };
                post.audioUrls ? post.audioUrls.push(result) : post.audioUrls = [result];
            }
            if (this.isFormat(tempUrl, 'VIDEO')) {
                const result = { url: tempUrl, type: `video/${parts[parts.length - 1]}`, mediaType: 'video' };
                post.videoUrls ? post.videoUrls.push(result) : post.videoUrls = [result];
            }
        });
        if ((!post.text && (!post.attachPaths || post.attachPaths.length === 0))) {
            post.text = 'accounts.processPostErrorMessage';
        }
    }

    showMediaFullscreen(media: Media): void {
        this.shownMedia = media;
    }

    onMediaViewerClose(event: Event): void {
        const target = event.target as HTMLElement;
        if (target?.id === 'media-overlay') {
            this.shownMedia = null;
        }
    }

    navigateToCryptoWalletPage(event: Event): void {
        event.preventDefault();
        const url = this.router.serializeUrl(this.router.createUrlTree([`/crypto-page/results/8`]));
        const request: CryptoRequest = {
            "id": "8",
            "name": "Narco",
            "requestNumber": "20250602-CDW-0000008",
            "status": StatusCode.completed,
            "requestContent": {
                "key": "wallet",
                "value": "TCWQGNaEK9ke6BtXgbNkeWV7xhxcRQoDre"
            },
            "fromDate": "2025-05-01T12:00:00+05:00",
            "toDate": "2025-05-31T12:00:00+05:00",
            "createdDate": "2025-06-02T16:21:58.726014+05:00",
            "finishedDate": "2025-06-02T16:21:58.846655+05:00",
            "resultCount": 1,
            "type": "CRYPTO_WALLET",
            "author": "obr_m",
            "userId": 1,
            "errorReason": null,
            "currencies": [
                {
                    "id": 1,
                    "name": "bitcoin",
                    "title": "bitcoin",
                    "symbol": "BTC",
                    "rank": 1
                },
                {
                    "id": 3,
                    "name": "ethereum",
                    "title": "ethereum",
                    "symbol": "ETH",
                    "rank": 2
                },
                {
                    "id": 2,
                    "name": "tether",
                    "title": "erc-20",
                    "symbol": "USDT_ERC20",
                    "rank": 3
                },
                {
                    "id": 5,
                    "name": "bitcoin-cash",
                    "title": "bitcoin-cash",
                    "symbol": "BCH",
                    "rank": 12
                },
                {
                    "id": 4,
                    "name": "tron",
                    "title": "tron",
                    "symbol": "TRX",
                    "rank": 13
                },
                {
                    "id": 6,
                    "name": "tether",
                    "title": "trc-20",
                    "symbol": "USDT_TRC20",
                    "rank": 14
                },
                {
                    "id": 7,
                    "name": "litecoin",
                    "title": "LITECOIN (LTC)",
                    "symbol": "LITECOIN",
                    "rank": 15
                }
            ],
            workspace: '',
            workspaceId: 0,
        }
        sessionStorage.setItem('crypto-request', JSON.stringify(request));
        window.open(url, '_blank');
    }

    handleSearch(ev: { search: string }): void {
        this.pageParams.page = 0;
        this.getPosts(ev.search);
    }
}
