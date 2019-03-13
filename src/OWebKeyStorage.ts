import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";

type tKeyData = {
	value: any,
	expire: number,
};

let _hasExpired = (data: tKeyData): boolean => {
	let now    = Date.now(),
		expire = data["expire"];
	return expire != -1 && now <= expire;
};

export default class OWebKeyStorage extends OWebEvent {
	private readonly _max_life_time: number;
	private _store: { [key: string]: tKeyData };

	/**
	 * @param app_context The app context.
	 * @param tag_name The key storage name.
	 * @param persistent True to persists the key storage data.
	 * @param max_life_time The duration in seconds until key data deletion.
	 */
	constructor(private readonly app_context: OWebApp, private readonly tag_name: string, private persistent: boolean = true, max_life_time: number = Infinity) {
		super();

		let m               = this;
		this._store         = app_context.ls.load(this.tag_name) || {};
		this._max_life_time = max_life_time * 1000;

		app_context.ls.onClear(function () {
			m._store = {};
		});

		this._clearExpired();
	}

	/**
	 * Returns the key storage data.
	 */
	getStoreData(): {} {
		let items: any = {};

		this._clearExpired();

		Utils.forEach(this._store, (data, key) => {
			items[key] = data["value"];
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
			data = _hasExpired(data) ? this.removeItem(key) && undefined : data["value"];
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
			"value" : value,
			"expire": this._max_life_time === Infinity ? -1 : Date.now() + this._max_life_time
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
			this.app_context.ls.save(this.tag_name, this._store);
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
		let s = this, modified = false;
		Utils.forEach(this._store, (data, key) => {
			if (_hasExpired(data)) {
				modified = true;
				delete s._store[key];
			}
		});

		modified && this._save();
	}
}
