import { Component, effect, inject, OnDestroy, OnInit, signal, viewChild, WritableSignal } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SafeResourceUrl } from "@angular/platform-browser";
import { TranslocoPipe } from "@jsverse/transloco";
import { Observable, Subject, Subscription, switchMap, take, takeUntil, timer } from "rxjs";

import { ModalWrapperComponent } from "../../../../../../shared/components/modal/modal-wrap/modal-wrap.component";
import { SvgIconComponent } from "../../../../../../shared/components/svg-icon/svg-icon.component";
import { StepperComponent } from "../../../../../../shared/components/stepper/stepper.component";
import { StepComponent } from "../../../../../../shared/components/stepper/step/step.component";
import { OtpInputComponent } from "../../../../../../shared/components/otp-input/otp-input.component";
import { BaseModalComponent } from "../../../../../../shared/components/modal/base-modal/base-modal.component";
import { BotService } from "../../../bot.service";
import { CreateBotPayload, VerifyOtpPayload } from "../../../models/create-bot";
import { Bot, Platform } from "../../../models/bot";
import { NotificationsService } from "../../../../../../shared/services/notifications.service";
import { Session } from "../../../models/session";
import { LoaderComponent } from "../../../../../deanon/components/loader/loader.component";
import { QrService } from "../../../qr.service";

@Component({
    selector: 'app-add-bot-modal',
    imports: [
        ReactiveFormsModule,
        TranslocoPipe,
        ModalWrapperComponent,
        SvgIconComponent,
        StepperComponent,
        StepComponent,
        OtpInputComponent,
        LoaderComponent
    ],
    templateUrl: './add-bot-modal.component.html',
    styleUrl: './add-bot-modal.component.scss',
    providers: [
        TranslocoPipe
    ]
})
export class AddBotModalComponent extends BaseModalComponent implements OnInit, OnDestroy {
    private translocoPipe = inject(TranslocoPipe);
    private botService = inject(BotService);
    private notificationsService = inject(NotificationsService);
    private qrService = inject(QrService);

    private session: Session = {} as Session;
    private bot: Bot = {} as Bot;
    private destroyed: Subject<void> = new Subject<void>();
    private modalTimerSubscription!: Subscription;
    private qrSubscription!: Subscription;
    
    public stepper = viewChild.required(StepperComponent);
    public firstStepForm: FormGroup;
    public secondStepForm: FormGroup;
    public isOtpError = false;
    public isSmsCodeInfoVisible = false;
    public mode: WritableSignal<'qr' | 'phoneNumber'> = signal('qr');
    public imagePath: SafeResourceUrl | undefined;
    public isQrCorrect = this.qrService.isQrCorrect;
    public twoFactorAuth = this.qrService.twoFactorAuth;
    public sessionName = this.qrService.sessionName;

    get nextBtnName(): string {
        if (this.stepper().selectedIndex === (this.stepper().steps.length - 1)) {
            if (this.mode() === 'phoneNumber' && !this.isSmsCodeInfoVisible) {
                return 'button.getCode';
            } else {
                return 'button.confirm';
            }
        } else {
            return 'button.next';
        }
    }

    get isBackBtnVisible(): boolean {
        return this.stepper().selectedIndex !== 0;
    }

    get isNextBtnVisible(): boolean {
        return this.stepper().selectedIndex === 0 || (this.mode() === 'phoneNumber' || this.twoFactorAuth());
    }

    get name(): FormControl<string> {
        return this.firstStepForm.get('name') as FormControl<string>;
    }

    get platform(): FormControl<string> {
        return this.firstStepForm.get('platform') as FormControl<string>;
    }

    get description(): FormControl<string> {
        return this.firstStepForm.get('description') as FormControl<string>;
    }

    get phone(): FormControl<string> {
        return this.secondStepForm.get('phone') as FormControl<string>;
    }

    get code(): FormControl {
        return this.secondStepForm.get('code') as FormControl;
    }

    get twoFactorPassword(): FormControl<string> {
        return this.secondStepForm.get('twoFactorPassword') as FormControl<string>;
    }

    constructor(
        private fb: FormBuilder,
    ) {
        super();

        this.firstStepForm = this.fb.group({
            name: [null, [Validators.required]],
            platform: ['TELEGRAM', [Validators.required]],
            description: [null]
        });

        this.secondStepForm = this.fb.group({
            phone: [null, [Validators.required]],
            code: [null],
            twoFactorPassword: [null]
        });

        this.qrSubscription = this.qrService.getQrImage().subscribe(image => {
            this.imagePath = image;
        });

        effect(() => {
            const currentMode = this.mode();

            if (this.stepper().selectedIndex === 1 && currentMode === 'qr') {
                this.imagePath = undefined;
                this.createBotWithQR();         
            };

            if (this.stepper().selectedIndex === 1 && currentMode === 'phoneNumber') {
                this.isSmsCodeInfoVisible = false;
                this.phone.reset();
            };

            this.twoFactorPassword.reset();
            this.twoFactorPassword.setErrors(null);
        });

        effect(() => {
            if (this.isQrCorrect() && !this.twoFactorAuth()) {
                setTimeout(() => {
                    this.notificationsService.addNotification(
                        'success',
                        'bots.botCreatedSuccessTitle',
                        `${this.translocoPipe.transform('bots.botCreatedSuccess', { name: this.bot.name })}`,
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

    public back(): void {
        this.stepper().previous();
    }

    public next(): void {
        if (this.stepper().selectedIndex !== (this.stepper().steps.length - 1)) {
            switch (this.stepper().selectedIndex) {
            case 0:
                this.firstStepForm.markAllAsTouched();
                if (this.firstStepForm.invalid) {
                    return;
                }
                if (this.mode() === 'qr') {
                    this.createBotWithQR();
                }

            }

            this.stepper().next();
        } else {            
            if (this.mode() === 'qr' && this.twoFactorAuth()) {
                this.checkQRPassword();
            }

            if (this.mode() === 'phoneNumber') {
                if (this.isSmsCodeInfoVisible) {
                    this.secondStepForm.markAllAsTouched();
                    this.verifyOtp();
                } else {
                    this.createBot();
                }
            }
        }
    }

    public createBot(): void {
        if (this.phone.invalid) {
            return;
        }

        const payload: CreateBotPayload = {
            name: this.name.value,
            phone: this.phone.value,
            platform: this.platform.value as Platform,
            description: this.description.value ?? undefined
        };

        this.botService.createBot(payload).pipe(
            switchMap(bot => {
                this.bot = bot;
                return this.createSession(bot.id);
            }),
            switchMap(session => {
                this.session = session;
                return this.sendOtp();
            })
        ).subscribe({
            next: () => {
                this.isSmsCodeInfoVisible = true;
            }
        });
    }

    public createBotWithQR(): void {
        this.qrService.requestNewQr({ name: this.name.value });
    }

    public checkQRPassword(): void {
        const payload = {
            password: this.twoFactorPassword.value,
            session_name: this.sessionName()
        }
        this.botService.checkQRPassword(payload).subscribe({
            next: ({ status }) => {
                if (status === 'done') {
                    this.twoFactorPassword.setErrors(null);
                    this.notificationsService.addNotification(
                        'success',
                        'bots.botCreatedSuccessTitle',
                        `${this.translocoPipe.transform('bots.botCreatedSuccess', { name: this.bot.name })}`,
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

    public handleCodeRefresh(): void {
        this.sendOtp().subscribe();
    }

    public verifyOtp(): void {
        if (this.secondStepForm.invalid) {
            return;
        }

        const payload: VerifyOtpPayload = {
            sessionId: this.session.id,
            code: this.code.value,
            twoFactorPassword: this.twoFactorPassword.value ?? undefined
        };

        this.botService.verifyOtp(payload).subscribe({
            next: () => {
                this.notificationsService.addNotification(
                    'success',
                    'bots.botCreatedSuccessTitle',
                    `${this.translocoPipe.transform('bots.botCreatedSuccess', { name: this.bot.name })}`,
                );
                super.close(true);
            },
            error: error => {
                this.code.setErrors({ incorrect: true });
            }
        });
    }

    public changeMode(mode: 'qr' | 'phoneNumber'): void {
        this.mode.set(mode);
    }

    private createSession(botId: string): Observable<Session> {
        return this.botService.createSession(botId);
    }

    private sendOtp(): Observable<void> {
        return this.botService.sendOtp({ sessionId: this.session.id });
    }
}