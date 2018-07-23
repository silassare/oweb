"use strict";

import OWebEvent from "./OWebEvent";
import OWebApp from "./OWebApp";
import OWebDataStore from "./OWebDataStore";
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
	private readonly _tag_name: string;
	private _store: { [key: string]: tKeyData };

	constructor(private readonly app_context: OWebApp, tag: string, private persistent: boolean = true, private max_life_time: number = Infinity) {
		super();

		this._tag_name     = app_context.getAppName() + ":" + tag;
		this._store        = OWebDataStore.load(this._tag_name) || {};
		this.max_life_time = max_life_time * 1000;

		this._clearExpired();
	}

	getStoreData(): {} {
		let items: any = {};

		this._clearExpired();

		Utils.forEach(this._store, (key, data) => {
			items[key] = data['value'];
		});

		return items;
	}

	getItem(key: string): any {
		let data: tKeyData = this._store[key];

		if (data !== undefined) {
			data = _hasExpired(data) ? this.removeItem(key) && undefined : data["value"];
		}

		return data;
	}

	setItem(key: string, value: any): this {
		this._store[key] = {
			"value" : value,
			"expire": this.max_life_time === Infinity ? -1 : Date.now() + this.max_life_time
		};

		return this.save();
	}

	removeItem(key: string): this {
		if (key in this._store) {
			delete this._store[key];
		}

		return this.save();
	}

	private save(): this {
		if (this.persistent) {
			OWebDataStore.save(this._tag_name, this._store);
		}

		return this;
	}

	clear(): this {
		this._store = {};
		return this.save();
	}

	private _clearExpired() {
		let s = this, modified = false;
		Utils.forEach(this._store, (key, value) => {
			if (_hasExpired(value)) {
				modified = true;
				delete s._store[key];
			}
		});

		modified && this.save();
	}
}
