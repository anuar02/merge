export interface QR {
    status: string;
    data: string;
    timeout: number;
    expires_at: string;
    session_name: string;
}

export interface QrData {
    name?: string;
    sessionId?: string;
}