import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import OWebKeyStorage from './OWebKeyStorage';
import Utils from './utils/Utils';
import { GoblEntity } from 'gobl-utils-ts';

export default class OWebCurrentUser extends OWebEvent {
	static readonly SELF = Utils.id();
	static readonly EVT_USER_DATA_UPDATE = Utils.id();

	private _key_store: OWebKeyStorage;

	constructor(private readonly app_context: OWebApp) {
		super();

		this._key_store = new OWebKeyStorage(app_context, 'current_user');
		console.log('[OWebCurrentUser] ready!');
	}

	/**
	 * Returns current user data.
	 */
	getCurrentUser(): any {
		let data = this._key_store.getItem('user_data');
		let user = undefined;

		if (data && data.id && typeof data.getId === 'function') {
			return data;
		} else if (
			Utils.isPlainObject(data) &&
			(user = GoblEntity.toInstance(data, true))
		) {
			return user;
		} else {
			console.error('[OWebCurrentUser] invalid user data!', data);
		}

		return undefined;
	}

	/**
	 * Sets current user data.
	 *
	 * @param user
	 */
	setCurrentUser(user: any): this {
		console.log('[OWebCurrentUser] setting new user ->', user);
		this._key_store.setItem('user_data', user);

		return this._notifyChange();
	}

	/**
	 * Sets current user session expire time.
	 *
	 * @param expire
	 */
	setSessionExpire(expire: number): this {
		this._key_store.setItem('session_expire', expire);
		return this;
	}

	/**
	 * Returns current user session expire time.
	 */
	getSessionExpire(): number {
		let expire = this._key_store.getItem('session_expire');
		return isNaN(expire) ? 0 : expire;
	}

	/**
	 * Clear user data.
	 */
	clear(): this {
		this._key_store.clear();
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
