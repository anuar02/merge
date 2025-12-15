import { inject, Injectable, signal } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { BehaviorSubject, Observable, of, Subject, switchMap, takeUntil, tap, timer } from "rxjs";

import { BotService } from "./bot.service";
import { NotificationsService } from "../../../shared/services/notifications.service";
import { QR, QrData } from "./models/qr";

@Injectable({
    providedIn: 'root',
})
export class QrService {
    private sanitizer = inject(DomSanitizer);
    private botService = inject(BotService);
    private notificationsService = inject(NotificationsService);
    private qr = new BehaviorSubject<QrData>({});
    private qr$!: Observable<SafeResourceUrl>;
    private stopUpdates$ = new Subject<void>();
    public isQrCorrect = signal(false);
    public twoFactorAuth = signal(false);
    public sessionName = signal('');
    public sessionId = signal('');

    constructor() {
        this.setupQrFlow();
    }

    private setupQrFlow(): void {
        this.qr$ = this.qr.pipe(
            takeUntil(this.stopUpdates$),
            switchMap(({ name, sessionId }) => {
                if (sessionId) {
                    return this.fetchQRFromServer();
                }

                if (name) {
                    return this.fetchQRFromServer(name);
                } else {
                    return new Observable<QR>();
                }
            }),
            tap(response => {
                const expiresInMs = new Date(response.expires_at).getTime() - Date.now();
                if (expiresInMs > 0) {
                    timer(expiresInMs).pipe(takeUntil(this.stopUpdates$)).subscribe(() => this.requestNewQr(this.qr.value));
                }
            }),
            switchMap(response => {
                this.fetchQrStatus(response);
                return of('data:image/jpg;base64,' + response.data);
            }),
            tap(base64Image => {
                return this.sanitizer.bypassSecurityTrustResourceUrl(base64Image);
            })
        );
    }

    private fetchQRFromServer(botName?: string): Observable<QR> {
        return this.botService.fetchQR({ botName });
    }

    public requestNewQr(info: { name?: string, sessionId?: string }): void {
        this.qr.next(info);
    }

    public getQrImage(): Observable<SafeResourceUrl> {
        return this.qr$;
    }

    public stopUpdateQR(): void {
        this.stopUpdates$.next();
        this.qr.next({});
    }

    public resumeUpdateQR(): void {        
        this.stopUpdates$ = new Subject<void>(); 
        this.setupQrFlow();
        this.qr.next(this.qr.value); 
    }

    public resetQrInfo(): void {
        this.isQrCorrect.set(false);
        this.twoFactorAuth.set(false);
        this.sessionName.set('');
        this.sessionId.set('');
    }

    private fetchQrStatus(qrInfo: QR): void {
        this.botService.fetchQrStatus({ session_name: qrInfo.session_name, session_id: this.qr.value.sessionId }).subscribe({
            next: ({ status }) => {
                if (status === 'done') {
                    this.isQrCorrect.set(true);
                }

                if (status === '2fa_is_required') {
                    this.isQrCorrect.set(true);
                    this.twoFactorAuth.set(true);
                    this.sessionName.set(qrInfo.session_name);

                    if (this.qr.value.sessionId) {
                        this.sessionId.set(this.qr.value.sessionId);
                    }
                }

                if (status === 'different_bot') {
                    this.notificationsService.addNotification(
                        'error',
                        'common.error',
                        'bots.differentBotError'
                    );
                    this.requestNewQr(this.qr.value);
                }
            },
            error: error => {
                this.isQrCorrect.set(false);
                this.twoFactorAuth.set(false);
            }
        });
    }
}