export interface IOZoneApiJSON<R> {
	error: number;
	msg: string;
	data?: R;
	utime: number; // response time
	stime?: number; // session expire time
	stoken?: string; // session token
}
