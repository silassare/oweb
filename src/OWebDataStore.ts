import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import { id, logger } from './utils';

export interface OJSONSerializable {
	toJSON(): OJSONValue;
}

export type OJSONValue =
	| string
	| number
	| boolean
	| Date
	| OJSONSerializable
	| { [key: string]: OJSONValue }
	| OJSONValue[];

const ls = window.localStorage,
	parse = function parse(data: string | null): any {
		let value: any;

		if (data !== null) {
			try {
				value = JSON.parse(data);
			} catch (e) {
				logger.error(e);
			}
		}

		return value;
	};

export default class OWebDataStore extends OWebEvent {
	static readonly EVT_DATA_STORE_CLEARED = id();
	private readonly _key: string;
	private _data: { [key: string]: OJSONValue } = {};

	constructor(_appContext: OWebApp) {
		super();
		this._key = _appContext.getAppName();

		if (ls) {
			this._data = parse(ls.getItem(this._key)) || {};
		}
	}

	/**
	 * Sets key/value pair in the store.
	 *
	 * @param key The data key name.
	 * @param value The data value.
	 */
	set(key: string, value: OJSONValue): boolean {
		this._data[key] = value;

		this._persist();

		return false;
	}

	/**
	 * Gets data with the given key.
	 *
	 * When the key is a regexp all data with a key name that match the given
	 * regexp will be returned in an object.
	 *
	 * @param key The data key name.
	 */
	get(key: string | RegExp): any {
		if (key instanceof RegExp) {
			const list = Object.keys(this._data),
				result: any = {};

			for (let i = 0; i < list.length; i++) {
				const k = list[i];
				if (key.test(k)) {
					result[k] = this._data[k];
				}
			}

			return result;
		} else {
			return this._data[key];
		}
	}

	/**
	 * Removes data with the given key.
	 *
	 * When the key is a regexp all data with a key name that match the given
	 * regexp will be removed.
	 *
	 * @param key
	 */
	remove(key: string | RegExp): boolean {
		if (ls) {
			if (key instanceof RegExp) {
				const list = Object.keys(this._data);

				for (let i = 0; i < list.length; i++) {
					const k = list[i];
					if (key.test(k)) {
						delete this._data[k];
					}
				}
			} else {
				delete this._data[key];
			}

			this._persist();

			return true;
		}

		return false;
	}

	/**
	 * Clear the data store.
	 */
	clear(): boolean {
		this._data = {};

		this._persist();

		this.trigger(OWebDataStore.EVT_DATA_STORE_CLEARED);

		return true;
	}

	/**
	 * Register data store clear event handler.
	 *
	 * @param cb
	 */
	onClear(cb: (this: this) => void): this {
		return this.on(OWebDataStore.EVT_DATA_STORE_CLEARED, cb);
	}

	/**
	 * Helper to make data store persistent.
	 *
	 * @private
	 */
	private _persist(): boolean {
		if (ls) {
			try {
				ls.setItem(this._key, JSON.stringify(this._data));
				return true;
			} catch (e) {
				logger.error(e);
			}
		}

		return false;
	}
}
