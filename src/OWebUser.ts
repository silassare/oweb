import OWebEvent from './OWebEvent';
import OWebApp, { OUser } from './OWebApp';
import OWebKeyStorage from './OWebKeyStorage';
import { logger } from './utils';
import OWebSignUp from './plugins/OWebSignUp';
import OWebLogin from './plugins/OWebLogin';
import OWebLogout from './plugins/OWebLogout';
import OWebAccountRecovery from './plugins/OWebAccountRecovery';
import OWebPassword from './plugins/OWebPassword';

export default class OWebUser<UserEntity extends OUser> extends OWebEvent {
	private _keyStore: OWebKeyStorage;

	constructor(protected _appContext: OWebApp) {
		super();
		this._keyStore = new OWebKeyStorage(_appContext, 'current_user');
	}

	/**
	 * Returns a new {@link OWebLogin} instance.
	 */
	login() {
		return new OWebLogin<UserEntity>(this._appContext);
	}

	/**
	 * Returns a new {@link OWebLogout} instance.
	 */
	logout() {
		return new OWebLogout<UserEntity>(this._appContext);
	}

	/**
	 * Returns a new {@link OWebSignUp} instance.
	 */
	signUp<Start, Validate, End>() {
		return new OWebSignUp<Start, Validate, End>(this._appContext);
	}

	/**
	 * Returns a new {@link OWebPassword} instance.
	 */
	password() {
		return new OWebPassword<UserEntity>(this._appContext);
	}

	/**
	 * Returns a new {@link OWebAccountRecovery} instance.
	 */
	accountRecovery<Start, Validate, End>() {
		return new OWebAccountRecovery<Start, Validate, End>(this._appContext);
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
	 *
	 * @deprecated use {@link OWebUser.isVerified }
	 */
	userVerified(): boolean {
		return this.isVerified();
	}

	/**
	 * Sets current user data.
	 *
	 * @param user
	 *
	 * @deprecated use {@link OWebUser.setCurrent}
	 */
	setCurrentUser(user: UserEntity): this {
		return this.setCurrent(user);
	}

	/**
	 * Returns current user data.
	 *
	 * @deprecated use {@link OWebUser.getCurrent}
	 */
	getCurrentUser(): UserEntity | null {
		return this.getCurrent();
	}

	/**
	 * Checks if the current user has been authenticated.
	 */
	isVerified(): boolean {
		return Boolean(this.getCurrent() && this.sessionActive());
	}

	/**
	 * Returns current user data.
	 */
	getCurrent() {
		return this._keyStore.getItem<UserEntity>('user_data');
	}

	/**
	 * Sets current user data.
	 *
	 * @param user
	 */
	setCurrent(user: UserEntity): this {
		logger.debug('[OWebUser] setting new user', user);
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
