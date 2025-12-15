import { Component, effect, inject, OnDestroy, OnInit, signal, WritableSignal } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SafeResourceUrl } from "@angular/platform-browser";
import { TranslocoPipe } from "@jsverse/transloco";
import { EMPTY, Observable, Subject, Subscription, take, takeUntil, tap, timer } from "rxjs";

import { BaseModalComponent } from "../../../../../../shared/components/modal/base-modal/base-modal.component";
import { OtpInputComponent } from "../../../../../../shared/components/otp-input/otp-input.component";
import { ModalWrapperComponent } from "../../../../../../shared/components/modal/modal-wrap/modal-wrap.component";
import { SvgIconComponent } from "../../../../../../shared/components/svg-icon/svg-icon.component";
import { VerifyOtpPayload } from "../../../models/create-bot";
import { BotService } from "../../../bot.service";
import { NotificationsService } from "../../../../../../shared/services/notifications.service";
import { Session } from "../../../models/session";
import { LoaderComponent } from "../../../../../deanon/components/loader/loader.component";
import { QrService } from "../../../qr.service";

@Component({
    selector: 'app-add-session-modal',
    imports: [
        ReactiveFormsModule,
        TranslocoPipe,
        ModalWrapperComponent,
        SvgIconComponent,
        OtpInputComponent,
        LoaderComponent
    ],
    templateUrl: './add-session-modal.component.html',
    styleUrl: './add-session-modal.component.scss'
})
export class AddSessionModalComponent extends BaseModalComponent implements OnInit, OnDestroy {
    private botService = inject(BotService);
    private notificationsService = inject(NotificationsService);
    private qrService = inject(QrService);

    private destroyed: Subject<void> = new Subject<void>();
    private session: Session = {} as Session;
    private modalTimerSubscription!: Subscription;
    private qrSubscription!: Subscription;

    public addForm: FormGroup;
    public isOtpError = false;
    public isSmsCodeInfoVisible = false;
    public botName = '';
    public mode: WritableSignal<'qr' | 'phoneNumber'> = signal('qr');

    public imagePath: SafeResourceUrl | undefined;
    public isQrCorrect = this.qrService.isQrCorrect;
    public twoFactorAuth = this.qrService.twoFactorAuth;
    public sessionName = this.qrService.sessionName;
    public sessionId = this.qrService.sessionId;

    get code(): FormControl {
        return this.addForm.get('code') as FormControl;
    }

    get twoFactorPassword(): FormControl<string> {
        return this.addForm.get('twoFactorPassword') as FormControl<string>;
    }

    constructor(
        private fb: FormBuilder,
    ) {
        super();

        this.addForm = this.fb.group({
            code: [null],
            twoFactorPassword: [null]
        });

        this.qrSubscription = this.qrService.getQrImage().subscribe(image => {
            this.imagePath = image;
        });

        effect(() => {
            const currentMode = this.mode();

            if (currentMode === 'qr') {
                this.isSmsCodeInfoVisible = false;
                this.qrService.resumeUpdateQR();
            }

            if (currentMode === 'phoneNumber') {
                this.imagePath = undefined;
                this.qrService.stopUpdateQR();
                this.qrService.resetQrInfo();
            }

            this.twoFactorPassword.reset();
            this.twoFactorPassword.setErrors(null);

            if (Object.keys(this.session).length) {
                this.startActivation();
            }
        });

        effect(() => {
            if (this.isQrCorrect() && !this.twoFactorAuth()) {
                setTimeout(() => {
                    this.notificationsService.addNotification(
                        'success',
                        'bots.sessionAddedTtile',
                        'bots.sessionAdded'
                    );
                }, 0);

                this.modalTimerSubscription = timer(1000).pipe(take(1)).subscribe(() => {
                    super.close(true);
                });
            }

            if (this.twoFactorAuth()) {
                this.qrService.stopUpdateQR();
            }
        });
    }

    ngOnInit(): void {
        if (this._data) {
            this.botName = this._data.botName;
        }

        this.createSession();

        this.code.statusChanges.pipe(
            takeUntil(this.destroyed)
        ).subscribe(status => {
            if (status === 'INVALID') {
                this.isOtpError = true;
            }

            if (status === 'VALID') {
                this.isOtpError = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
        if (this.qrSubscription) {
            this.qrSubscription.unsubscribe();
        }
        this.qrService.stopUpdateQR();
        this.qrService.resetQrInfo();
    }

    public closeBtn(): void {
        super.close(false);
        if (this.modalTimerSubscription) {
            this.modalTimerSubscription.unsubscribe();
        }
    }

    public confirm(): void {
        this.addForm.markAllAsTouched();

        if (this.addForm.invalid) {
            return;
        }

        if (this.mode() === 'phoneNumber') {
            this.verifyOtp();
        }

        if (this.mode() === 'qr' && this.twoFactorAuth()) {
            this.checkQRPassword();
        }
    }

    public cancel(): void {
        super.close(false);
        if (this.modalTimerSubscription) {
            this.modalTimerSubscription.unsubscribe();
        }
    }

    public changeMode(mode: 'qr' | 'phoneNumber'): void {
        this.mode.set(mode);
    }

    private createSession(): void {
        this.botService.createSession(this.data.botId).pipe(
            tap(session => {
                this.session = session;
                this.startActivation();
            })
        ).subscribe();
    }

    private startActivation(): any {
        switch (this.mode()) {
        case 'phoneNumber':
            return this.sendOtp().subscribe({
                next: () => {
                    this.isSmsCodeInfoVisible = true;
                }
            });
        case 'qr':
            return this.addSessionWithQR();
        default:
            return EMPTY; 
        }
    }

    // QR

    private addSessionWithQR(): void {
        this.qrService.requestNewQr({ sessionId: this.session.id });
    }

    private checkQRPassword(): void {
        const payload = {
            password: this.twoFactorPassword.value,
            session_name: this.sessionName(),
            session_id: this.sessionId()
        }
        this.botService.checkQRPassword(payload).subscribe({
            next: ({ status }) => {
                if (status === 'done') {
                    this.twoFactorPassword.setErrors(null);
                    this.notificationsService.addNotification(
                        'success',
                        'bots.sessionAddedTtile',
                        'bots.sessionAdded',
                    );
                    super.close(true);
                }

                if (status === 'wrong_password') {
                    this.twoFactorPassword.setErrors({ wrongPassword: true });
                    this.notificationsService.addNotification(
                        'error',
                        'common.error',
                        'bots.2faError'
                    );
                }
            },
            error: error => console.log(error)
        })
    }

    // phone number

    private verifyOtp(): void {
        const payload: VerifyOtpPayload = {
            sessionId: this.session.id,
            code: this.code.value,
            twoFactorPassword: this.twoFactorPassword.value ?? undefined
        } 
        this.botService.verifyOtp(payload).subscribe({
            next: () => {
                this.notificationsService.addNotification(
                    'success',
                    'bots.sessionAddedTtile',
                    'bots.sessionAdded'
                );
                super.close(true);
            },
            error: error => {
                this.code.setErrors({ incorrect: true });
            }
        });
    }

    private sendOtp(): Observable<void> {
        return this.botService.sendOtp({ sessionId: this.session.id });
    }

    public handleCodeRefresh(): void {
        this.sendOtp().subscribe();
    }
}