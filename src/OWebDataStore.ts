import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";

const ls    = window.localStorage,
	  parse = function (data: string | null): any {
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
	private data: any                    = {};

	constructor(private readonly _app_context: OWebApp) {
		super();
		this.key  = _app_context.getAppName();
		this.data = parse(ls.getItem(this.key)) || {};
	}

	save(keyName: string, data: any): boolean {

		this.data[keyName] = data;

		this._persist();

		return false;
	}

	_persist(): boolean {

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

	load(keyName: string): any {
		if (arguments[0] instanceof RegExp) {
			let keyReg      = arguments[0];
			let list        = Object.keys(this.data);
			let result: any = {};

			for (let i = 0; i < list.length; i++) {
				let k = list[i];
				if (keyReg.test(k)) {
					result[k] = this.data[k];
				}
			}

			return result;
		} else {
			return this.data[keyName];
		}
	}

	remove(keyName: string): boolean {
		if (ls) {
			if (arguments[0] instanceof RegExp) {
				let list   = Object.keys(this.data);
				let keyReg = arguments[0];

				for (let i = 0; i < list.length; i++) {
					let k = list[i];
					if (keyReg.test(k)) {
						delete this.data[k];
					}
				}
			} else {
				delete this.data[keyName];
			}

			this._persist();

			return true;
		}

		return false;
	}

	clear(): boolean {
		this.data = {};

		this._persist();

		this.trigger(OWebDataStore.EVT_DATA_STORE_CLEAR);

		return true;
	}

	onClear(cb: () => void) {
		return this.on(OWebDataStore.EVT_DATA_STORE_CLEAR, cb);
	}
};