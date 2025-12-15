import { Platform } from "./bot";

export interface CreateBotPayload {
    name: string;
    phone?: string;
    platform: Platform,
    description: string;
}

export interface VerifyOtpPayload {
    sessionId: string;
    code: string;
    twoFactorPassword?: string;
}

export interface SendOtpPayload {
    sessionId: string;
}