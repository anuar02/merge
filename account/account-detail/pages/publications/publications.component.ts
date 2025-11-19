import {Component, HostBinding, inject, OnDestroy} from '@angular/core';
import {SearchBarComponent} from "../../../../../../shared/components/search-bar/search-bar.component";
import {AccountDetailApiService} from '../../api/account-detail-api.service';
import {FacadeGeneralService} from '../../store/general/facade-general.service';
import {
    PaginationPanelComponent
} from "../../../../../../shared/components/pagination-panel/pagination-panel.component";
import {CommonModule, NgFor, NgIf} from '@angular/common';
import {Subject, takeUntil} from 'rxjs';
import {ServerResponse} from '../../../../../../core/server-response';
import {PageParams} from '../../../../../../shared/components/pagination-panel/pagination-panel';
import {Media, MediaType} from '../../../../group/models/group.entity';
import {Post} from '../../account';
import {environment} from '../../../../../../../environments/environment';
import {MediaViewComponent} from '../../../../base/media-view/media-view.component';
import {NotFoundComponent} from '../../../../../../shared/components/not-found/not-found.component';
import {TranslocoPipe} from '@jsverse/transloco';


const appUrl = environment.appType.toUpperCase() === 'ONLINE' ? 'https://knb-linxera-dev-online.pulsar.kazdream.kz' : 'https://knb-linxera-dev.pulsar.kazdream.kz';
const hostname = environment.apiUrl.indexOf('v1') > -1 ? appUrl : environment.apiUrl;
@Component({
    selector: 'app-deanon',
    imports: [NgIf, NgFor, CommonModule, SearchBarComponent, PaginationPanelComponent, MediaViewComponent, NotFoundComponent, TranslocoPipe],
    templateUrl: './publications.component.html',
    styleUrl: './publications.component.scss',
})
export class PublicationsComponent implements OnDestroy {
    @HostBinding('class') class = 'group group--nowrap group--expand';

    private destroyed: Subject<void> = new Subject<void>();

    private facadeGeneralService: FacadeGeneralService = inject(FacadeGeneralService);
    subjectId = this.facadeGeneralService.generalInfo().id
    profilePhoto = this.facadeGeneralService.generalInfo().photo;

    posts: ServerResponse<Post> = new ServerResponse<Post>;
    isLoading = false;
    isLoaded = false;
    formats: MediaType[] = [];
    pageParams: PageParams = new PageParams(0, 50, 'createdAt,desc');
    shownMedia: Media | null = null;

    constructor(
        private accountApiService: AccountDetailApiService
    ) {
        this.getMediaFormats();
        setTimeout(() => this.getPosts(), 200);
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
    }

    getMediaFormats(): void {
        this.accountApiService.getMediaTypes().pipe(
            takeUntil(this.destroyed)
        ).subscribe(res => {
            this.formats = res;
        });
    }

    getPosts(search?: string): void {
        this.isLoading = true;
        this.isLoaded = false;
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
            this.posts.content.forEach(post => {
                this.processPost(post);
            });
            this.pageParams.page = res.number;
            this.pageParams.size = res.size;
            this.isLoading = false;
            this.isLoaded = true;
        });
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
            const tempUrl = `${hostname}/resources/media?path=${url}`;
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
        // post.audioUrls = [{ url: 'assets/test-audio/test-audio.mp3', type: 'audio/mp3', mediaType: 'audio' }];
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
