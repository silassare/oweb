import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import { forEach } from './utils';

type tKeyData = {
	value: any;
	expire: number;
};

const _hasExpired = (data: tKeyData): boolean => {
	const now = Date.now(),
		expire = data.expire;
	return expire !== -1 && now <= expire;
};

export default class OWebKeyStorage extends OWebEvent {
	private readonly _maxLifeTime: number;
	private _store: { [key: string]: tKeyData };

	/**
	 * @param appContext The app context.
	 * @param tagName The key storage name.
	 * @param persistent True to persists the key storage data.
	 * @param maxLifeTime The duration in seconds until key data deletion.
	 */
	constructor(
		private readonly appContext: OWebApp,
		private readonly tagName: string,
		private persistent: boolean = true,
		maxLifeTime: number = Infinity,
	) {
		super();

		const m = this;
		this._store = appContext.ls.load(this.tagName) || {};
		this._maxLifeTime = maxLifeTime * 1000;

		appContext.ls.onClear(function () {
			m._store = {};
		});

		this._clearExpired();
	}

	/**
	 * Returns the key storage data.
	 */
	getStoreData(): {} {
		const items: any = {};

		this._clearExpired();

		forEach(this._store, (data, key) => {
			items[key] = data.value;
		});

		return items;
	}

	/**
	 * Returns a given key value.
	 *
	 * @param key The key name.
	 */
	getItem(key: string): any {
		let data: tKeyData = this._store[key];

		if (data !== undefined) {
			data = _hasExpired(data)
				? this.removeItem(key) && undefined
				: data.value;
		}

		return data;
	}

	/**
	 * Sets an item to the key storage.
	 *
	 * @param key The key name.
	 * @param value The key value.
	 */

	setItem(key: string, value: any): this {
		this._store[key] = {
			value,
			expire:
				this._maxLifeTime === Infinity
					? -1
					: Date.now() + this._maxLifeTime,
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
			this.appContext.ls.save(this.tagName, this._store);
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
