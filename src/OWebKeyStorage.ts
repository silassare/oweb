import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import { forEach } from './utils';
import { OJSONValue } from './OWebDataStore';

type OKeyData<T extends OJSONValue = OJSONValue> = {
	value: T;
	expire: number;
};

const _hasExpired = (data: OKeyData): boolean => {
	const now = Date.now(),
		expire = data.expire;
	return expire !== -1 && now <= expire;
};

export default class OWebKeyStorage extends OWebEvent {
	private readonly _maxLifeTime: number;
	private _store: { [key: string]: OKeyData };

	/**
	 * @param _appContext The app context.
	 * @param tagName The key storage name.
	 * @param persistent True to persists the key storage data.
	 * @param maxLifeTime The duration in seconds until key data deletion.
	 */
	constructor(
		private readonly _appContext: OWebApp,
		private readonly tagName: string,
		private persistent: boolean = true,
		maxLifeTime = Infinity
	) {
		super();

		const m = this;
		this._store = _appContext.ls.get(this.tagName) || {};
		this._maxLifeTime = maxLifeTime * 1000;

		_appContext.ls.onClear(() => {
			m._store = {};
		});

		this._clearExpired();
	}

	/**
	 * Returns the key storage data.
	 */
	getStoreData<D extends Record<string, OJSONValue>>(): D {
		const items: Record<string, OJSONValue> = {};

		this._clearExpired();

		forEach(this._store, (data, key) => {
			items[key] = data.value;
		});

		return items as D;
	}

	/**
	 * Returns a given key value.
	 *
	 * @param key The key name.
	 */
	getItem<T extends OJSONValue>(key: string): T | null {
		const data = this._store[key] as OKeyData<T>;

		if (data) {
			return _hasExpired(data) ? this.removeItem(key) && null : data.value;
		}

		return null;
	}

	/**
	 * Sets an item to the key storage.
	 *
	 * @param key The key name.
	 * @param value The key value.
	 */

	setItem(key: string, value: OJSONValue): this {
		this._store[key] = {
			value,
			expire:
				this._maxLifeTime === Infinity ? -1 : Date.now() + this._maxLifeTime,
		};

		return this._save();
	}

	/**
	 * Removes item from the key storage.
	 *
	 * @param key The item key name.
	 */
	removeItem(key: string): this {
		if (key in this._store) {
			delete this._store[key];
		}

		return this._save();
	}

	/**
	 * Save the key storage.
	 */
	private _save(): this {
		if (this.persistent) {
			this._appContext.ls.set(this.tagName, this._store);
		}

		return this;
	}

	/**
	 * Clear the key storage.
	 */
	clear(): this {
		this._store = {};
		return this._save();
	}

	/**
	 * Helper to clear all expired value from the key storage.
	 *
	 * @private
	 */
	private _clearExpired() {
		const s = this;
		let modified = false;
		forEach(this._store, (data, key) => {
			if (_hasExpired(data)) {
				modified = true;
				delete s._store[key];
			}
		});

		modified && this._save();
	}
}
