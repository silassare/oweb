"use strict";

import OWebEvent from "./OWebEvent";
import OWebApp from "./OWebApp";
import OWebDataStore from "./OWebDataStore";

export default class OWebKeyStorage extends OWebEvent {
	private readonly _tag_name: string;
	private _store: { [key: string]: any };

	constructor(private readonly app_context: OWebApp, tag: string, private persistent: boolean = true) {
		super();

		this._tag_name = app_context.getAppName() + ":" + tag;
		this._store    = OWebDataStore.load(this._tag_name) || {};
	}

	getStoreData(): {} {
		return this._store;
	}

	getItem(key: string): any {
		return this._store[key];
	}

	setItem(key: string, value: any): this {
		this._store[key] = value;

		return this.save();
	}

	removeItem(key: string): this {
		if (key in this._store) {
			delete this._store[key];
		}

		return this.save();
	}

	save(): this {
		if (this.persistent) {
			OWebDataStore.save(this._tag_name, this._store);
		}
		return this;
	}

	clear(): this {
		this._store = {};
		return this.save();
	}
}
