import {OWebApp, OWebEvent, OWebKeyStorage} from "./oweb";

export default class OWebCurrentUser extends OWebEvent {
	static readonly SELF                 = "OWebCurrentUser";
	static readonly EVT_USER_INFO_UPDATE = "OWebCurrentUser:update";

	private _key_store: OWebKeyStorage;

	constructor(private readonly app_context: OWebApp) {
		super();

		this._key_store = new OWebKeyStorage(app_context, OWebCurrentUser.SELF);
		console.log("[OWebCurrentUser] ready!");
	}

	getCurrentUser(): any {
		let user = this._key_store.getItem("user_data");

		if (user) {
			if ("id" in user) {
				return user;
			} else {
				console.error("[OWebCurrentUser] invalid user data!");
			}
		}

		return undefined;
	}

	setCurrentUser(user: any): this {
		console.log("[OWebCurrentUser] setting new user ->", user);
		this._key_store.setItem("user_data", user);

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

	private _notifyChange(): this {
		this.trigger(OWebCurrentUser.EVT_USER_INFO_UPDATE, [this]);
		return this;
	}
}