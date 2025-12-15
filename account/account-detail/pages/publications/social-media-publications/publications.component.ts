import {Component, HostBinding, inject, OnDestroy, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {SearchBarComponent} from "../../../../../../../shared/components/search-bar/search-bar.component";
import {AccountDetailApiService} from '../../../../shared/api/account-detail-api.service';
import {FacadeGeneralService} from '../../../store/general/facade-general.service';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import {Subject, takeUntil, fromEvent, debounceTime} from 'rxjs';
import {ServerResponse} from '../../../../../../../core/server-response';
import {PageParams} from '../../../../../../../shared/components/pagination-panel/pagination-panel';
import {Media, MediaType} from '../../../../../group/models/group.entity';
import {Post} from '../../../account';
import {environment} from '../../../../../../../../environments/environment';
import {MediaViewComponent} from '../../../../../base/media-view/media-view.component';
import {NotFoundComponent} from '../../../../../../../shared/components/not-found/not-found.component';
import {TranslocoPipe} from '@jsverse/transloco';
import {SvgIconComponent} from "../../../../../../../shared/components/svg-icon/svg-icon.component";

interface PostGroup {
    dateLabel: string;
    posts: Post[];
}

const appUrl = environment.appType.toUpperCase() === 'ONLINE' ? 'https://knb-linxera-dev-online.pulsar.kazdream.kz' : 'https://knb-linxera-dev.pulsar.kazdream.kz';
const hostname = environment.apiUrl.indexOf('v1') > -1 ? appUrl : environment.apiUrl;

@Component({
    selector: 'app-social-media-publications',
    imports: [NgIf, NgFor, CommonModule, SearchBarComponent, MediaViewComponent, NotFoundComponent, TranslocoPipe, SvgIconComponent],
    templateUrl: './publications.component.html',
    styleUrl: './publications.component.scss',
    standalone: true
})
export class SocialMediaPublicationsComponent implements OnDestroy, AfterViewInit {
    @HostBinding('class') class = 'group group--nowrap group--expand group--column';
    @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

    private destroyed: Subject<void> = new Subject<void>();

    private facadeGeneralService: FacadeGeneralService = inject(FacadeGeneralService);
    private hasScrolledToBottomOnInit = false;
    subjectId = this.facadeGeneralService.generalInfo().id
    profilePhoto = this.facadeGeneralService.generalInfo().photo;

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
    private previousScrollTop = 0;

    constructor(
        private accountApiService: AccountDetailApiService
    ) {
        this.getMediaFormats();
        setTimeout(() => this.getPosts(), 200);
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
        this.accountApiService.getMediaTypes().pipe(
            takeUntil(this.destroyed)
        ).subscribe(res => {
            this.formats = res;
        });
    }

    getPosts(search?: string): void {
        console.log('triggered')
        this.isLoading = true;
        this.isLoaded = false;
        this.allPosts = [];
        this.pageParams.page = 0;
        this.hasMore = true;

        this.accountApiService.filterPosts({
            subject: {
                subjectId: this.subjectId,
                subjectType: 'ACCOUNT',
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

            // Only scroll to bottom once ever (on initial component load)
            if (!this.hasScrolledToBottomOnInit) {
                setTimeout(() => {
                    this.scrollToBottom();
                    this.hasScrolledToBottomOnInit = true;
                }, 100);
            }
        });
    }

    loadMorePosts(): void {
        if (this.isLoadingMore || !this.hasMore || this.isLoading) return;

        this.isLoadingMore = true; // Only set this, NOT isLoading
        this.pageParams.page++;

        // Store both scroll height and scroll position before loading
        if (this.scrollContainer) {
            const element = this.scrollContainer.nativeElement;
            this.previousScrollHeight = element.scrollHeight;
            this.previousScrollTop = element.scrollTop;
        }

        this.accountApiService.filterPosts({
            subject: {
                subjectId: this.subjectId,
                subjectType: 'ACCOUNT',
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
            this.isLoadingMore = false; // Only reset this

            // Maintain scroll position after new content loads
            setTimeout(() => {
                this.maintainScrollPosition();
            }, 150);
        });
    }

    scrollToBottom(): void {
        if (this.scrollContainer) {
            const element = this.scrollContainer.nativeElement;
            element.scrollTo({
                top: element.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    maintainScrollPosition(): void {
        if (this.scrollContainer) {
            const element = this.scrollContainer.nativeElement;
            const newScrollHeight = element.scrollHeight;
            const heightDifference = newScrollHeight - this.previousScrollHeight;

            // Set scroll position to maintain the same visual position
            // New scroll top = old scroll top + height added
            element.scrollTop = this.previousScrollTop + heightDifference;
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
        if (!post.text && (!post.attachPaths || post.attachPaths.length === 0))
            post.text = 'accounts.processPostErrorMessage';
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

    handleSearch(ev: { search: string }): void {
        this.pageParams.page = 0;
        this.getPosts(ev.search);
    }
}
