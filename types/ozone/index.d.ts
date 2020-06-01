export interface IOZoneApiJSON<R> {
    error: number;
    msg: string;
    data?: R;
    utime: number;
    stime?: number;
    stoken?: string;
}
