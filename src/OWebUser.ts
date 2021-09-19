import OWebEvent from './OWebEvent';
import OWebApp, { OUser } from './OWebApp';
import OWebKeyStorage from './OWebKeyStorage';
import { logger } from './utils';

export default class OWebUser<UserEntity extends OUser> extends OWebEvent {
	private _keyStore: OWebKeyStorage;

	constructor(private readonly _appContext: OWebApp) {
		super();
		this._keyStore = new OWebKeyStorage(_appContext, 'current_user');
	}

	/**
	 * Checks if user session is active.
	 */
	sessionActive(): boolean {
		const now = new Date().getTime(); // milliseconds
		const hour = 60 * 60; // seconds
		const expire = this.getSessionExpire() - hour; // seconds
		return expire * 1000 > now;
	}

	/**
	 * Checks if the current user has been authenticated.
	 */
	userVerified(): boolean {
		return Boolean(this.getCurrentUser() && this.sessionActive());
	}

	/**
	 * Returns current user data.
	 */
	getCurrentUser(): UserEntity | null {
		return this._keyStore.getItem('user_data') as UserEntity | null;
	}

	/**
	 * Sets current user data.
	 *
	 * @param user
	 */
	setCurrentUser(user: UserEntity): this {
		logger.debug('[OWebCurrentUser] setting new user', user);
		this._keyStore.setItem('user_data', user);

		return this;
	}

	/**
	 * Sets current user session expire time.
	 *
	 * @param expire
	 */
	setSessionExpire(expire: number): this {
		this._keyStore.setItem('session_expire', expire);
		return this;
	}

	/**
	 * Returns current user session expire time.
	 */
	getSessionExpire(): number {
		const expire = Number(this._keyStore.getItem('session_expire'));
		return isNaN(expire) ? 0 : expire;
	}

	/**
	 * Sets current user session token.
	 *
	 * @param token
	 */
	setSessionToken(token: string): this {
		this._keyStore.setItem('session_token', token);
		return this;
	}

	/**
	 * Returns current user session token.
	 */
	getSessionToken(): string | null {
		return this._keyStore.getItem('session_token') as string | null;
	}

	/**
	 * Clear user data.
	 */
	clear(): this {
		this._keyStore.clear();
		return this;
	}
}
