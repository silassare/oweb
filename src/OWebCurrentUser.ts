import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import OWebKeyStorage from './OWebKeyStorage';
import { id, isPlainObject, _info, _debug, _error } from './utils/Utils';
import { GoblEntity, toInstance } from 'gobl-utils-ts';

export default class OWebCurrentUser extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_USER_DATA_UPDATE = id();

	private _keyStore: OWebKeyStorage;

	constructor(private readonly appContext: OWebApp) {
		super();

		this._keyStore = new OWebKeyStorage(appContext, 'current_user');
		_info('[OWebCurrentUser] ready!');
	}

	/**
	 * Returns current user data.
	 */
	getCurrentUser(): any {
		const data = this._keyStore.getItem('user_data');
		let user;

		if (data && data.id && typeof data.getId === 'function') {
			return data;
		} else if (
			isPlainObject(data) &&
			// tslint:disable-next-line: no-conditional-assignment
			(user = toInstance(data, true))
		) {
			return user;
		} else {
			_error('[OWebCurrentUser] invalid user data.', data);
		}

		return undefined;
	}

	/**
	 * Sets current user data.
	 *
	 * @param user
	 */
	setCurrentUser(user: any): this {
		_debug('[OWebCurrentUser] setting new user', user);
		this._keyStore.setItem('user_data', user);

		return this._notifyChange();
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
		const expire = this._keyStore.getItem('session_expire');
		return isNaN(expire) ? 0 : expire;
	}

	/**
	 * Clear user data.
	 */
	clear(): this {
		this._keyStore.clear();
		return this._notifyChange();
	}

	/**
	 * Trigger notification for user data change.
	 *
	 * @private
	 */
	private _notifyChange(): this {
		this.trigger(OWebCurrentUser.EVT_USER_DATA_UPDATE, [this]);
		return this;
	}
}
