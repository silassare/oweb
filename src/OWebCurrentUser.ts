"use strict";

import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";
import OWebApp from "./OWebApp";
import OWebKeyStorage from "./OWebKeyStorage";
import OWebLogout from "./plugins/OWebLogout";

export type tUserData = { [key: string]: any };

export default class OWebCurrentUser extends OWebEvent {
	static readonly SELF                 = "OWebCurrentUser";
	static readonly EVT_USER_INFO_UPDATE = "OWebCurrentUser:update";

	private _key_store: OWebKeyStorage;

	constructor(private readonly app_context: OWebApp) {
		super();

		this._key_store = new OWebKeyStorage(app_context, OWebCurrentUser.SELF);
	}

	logout() {
		return (new OWebLogout(this.app_context)).logout();
	}

	getCurrentUserData(field?: string): any | tUserData {
		let user_data = this._key_store.getItem("user_data");

		if (field !== undefined) {
			return user_data ? user_data[field] : undefined;
		}

		return user_data;
	}

	setCurrentUserData(data: tUserData, overwrite: boolean = false): this {
		let user_data = this._key_store.getItem("user_data");

		if (!overwrite && Utils.isPlainObject(user_data) && Utils.isPlainObject(data)) {
			data = Utils.assign(user_data, data);
		}

		this._key_store.setItem("user_data", data);
		return this._notifyChange();
	}

	setSessionExpire(expire: number): this {
		this._key_store.setItem("session_expire", expire);
		return this;
	}

	getSessionExpire(): number {
		let expire = this._key_store.getItem("session_expire");
		return isNaN(expire) ? 0 : expire;
	}

	clear(): this {
		this._key_store.clear();
		return this._notifyChange();
	}

	_notifyChange(): this {
		this.trigger(OWebCurrentUser.EVT_USER_INFO_UPDATE, [this]);
		return this;
	}
}