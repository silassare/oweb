import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import Utils from './utils/Utils';

const ls = window.localStorage,
	parse = function(data: string | null): any {
		let value: any = undefined;

		if (data !== null) {
			try {
				value = JSON.parse(data);
			} catch (e) {
				console.error(e);
			}
		}

		return value;
	};

export default class OWebDataStore extends OWebEvent {
	static readonly EVT_DATA_STORE_CLEAR = Utils.id();
	private readonly key: string;
	private data: any = {};

	constructor(private readonly _app_context: OWebApp) {
		super();
		this.key = _app_context.getAppName();
		this.data = parse(ls.getItem(this.key)) || {};
	}

	/**
	 * Save data to the store.
	 *
	 * @param key The data key name.
	 * @param value The data value.
	 */
	save(key: string, value: any): boolean {
		this.data[key] = value;

		this._persist();

		return false;
	}

	/**
	 * Load data with the given key.
	 *
	 * When the key is a regexp all data with a key name that match the given
	 * regexp will be returned in an object.
	 *
	 * @param key The data key name.
	 */
	load(key: string | RegExp): any {
		if (key instanceof RegExp) {
			let list = Object.keys(this.data),
				result: any = {};

			for (let i = 0; i < list.length; i++) {
				let k = list[i];
				if (key.test(k)) {
					result[k] = this.data[k];
				}
			}

			return result;
		} else {
			return this.data[key];
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
				let list = Object.keys(this.data);

				for (let i = 0; i < list.length; i++) {
					let k = list[i];
					if (key.test(k)) {
						delete this.data[k];
					}
				}
			} else {
				delete this.data[key];
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
		this.data = {};

		this._persist();

		this.trigger(OWebDataStore.EVT_DATA_STORE_CLEAR);

		return true;
	}

	/**
	 * Register data store clear event handler.
	 *
	 * @param cb
	 */
	onClear(cb: (this: this) => void) {
		return this.on(OWebDataStore.EVT_DATA_STORE_CLEAR, cb);
	}

	/**
	 * Helper to make data store persistent.
	 *
	 * @private
	 */
	private _persist(): boolean {
		if (ls) {
			try {
				ls.setItem(this.key, JSON.stringify(this.data));
				return true;
			} catch (e) {
				console.error(e);
			}
		}

		return false;
	}
}
