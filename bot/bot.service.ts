import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";

import { Bot, BotFilterPayload, GrabGroupPayload } from "./models/bot";
import { ServerResponse } from "../../../core/server-response";
import { CreateBotPayload, SendOtpPayload, VerifyOtpPayload } from "./models/create-bot";
import { Session } from "./models/session";
import { GroupEntity } from "../group/models/group.entity";
import { GetGroupsPayload } from "./models/details";
import { QR } from "./models/qr";

@Injectable({
    providedIn: 'root',
})
export class BotService {

    private http = inject(HttpClient);

    filterBots(payload: BotFilterPayload, params?: any): Observable<ServerResponse<Bot>> {
        return this.http.post<ServerResponse<Bot>>('resources/bot/filter', payload, { params });
    }

    createBot(payload: CreateBotPayload): Observable<Bot> {
        return this.http.post<Bot>('resources/bot/create', payload);
    }

    verifyOtp(payload: VerifyOtpPayload): Observable<Bot> {
        return this.http.post<Bot>('resources/bot/session/verifyOtp', payload);
    }

    sendOtp(payload: SendOtpPayload): Observable<void> {
        return this.http.post<void>('resources/bot/session/sendOtp', payload);
    }

    getSessions(botId: string, params?: any): Observable<ServerResponse<Session>> {
        return this.http.get<ServerResponse<Session>>(`resources-v2/bot/${botId}/session`, { params });
    }

    createSession(botId: string): Observable<Session> {
        return this.http.post<Session>(`resources-v2/bot/${botId}/session/create`, {});
    }

    getBotDetails(botId: string): Observable<Bot> {
        return this.http.get<Bot>(`resources-v2/bot/${botId}`);
    }

    getBotGroups(payload: GetGroupsPayload, params?: any): Observable<ServerResponse<GroupEntity>> {
        return this.http.post<ServerResponse<GroupEntity>>('resources/bot/groups', payload, { params }).pipe(
            switchMap((res  ) => {
                if (res.content.length === 0) {
                    return of(res);
                }
                return forkJoin(
                    res.content.map((item) => {
                        if (item.photo) {
                            return this.getPhoto(item.photo).pipe(
                                map((blob) => {
                                    return {
                                        ...item,
                                        photo: URL.createObjectURL(blob),
                                    }
                                }),
                                catchError(() => {
                                    return of({
                                        ...item,
                                        photo: 'assets/img/misc/person-avatar.png'
                                    })
                                })
                            )
                        } else {
                            return of({
                                ...item,
                                photo: 'assets/img/misc/person-avatar.png'
                            })
                        }
                    })
                ).pipe(map(content => ({
                    ...res,
                    content
                })));
            })
        );
    }

    grabGroups(botId: string, payload: GrabGroupPayload = {}) {
        return this.http.post(`resources-v2/bot/${botId}/grabGroups`, payload);
    }

    getPhoto(path: string): Observable<Blob> {
        return this.http.get('resources/media', {params:{path}, responseType: 'blob'});
    }

    fetchQR(payload: { botName?: string } = {}): Observable<QR> {
        return this.http.post<QR>('resources/bot/qr', payload);
    }

    fetchQrStatus(payload: { session_id?: string | null, session_name: string }): Observable<any> {
        return this.http.post('resources/bot/qr/status', payload);
    }

    checkQRPassword(payload: { password: string, session_id?: string | null, session_name: string }): Observable<{ status: string }> {
        return this.http.post<{ status: string }>('resources/bot/qr/password', payload);
    }
}
