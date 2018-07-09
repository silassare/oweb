"use strict";
import OWebEvent from "./OWebEvent";
import OWebDataStore from "./OWebDataStore";
export default class OWebKeyStorage extends OWebEvent {
    constructor(app_context, tag, persistent = true) {
        super();
        this.app_context = app_context;
        this.persistent = persistent;
        this._tag_name = app_context.getAppName() + ":" + tag;
        this._store = OWebDataStore.load(this._tag_name) || {};
    }
    getStoreData() {
        return this._store;
    }
    getItem(key) {
        return this._store[key];
    }
    setItem(key, value) {
        this._store[key] = value;
        return this.save();
    }
    removeItem(key) {
        if (key in this._store) {
            delete this._store[key];
        }
        return this.save();
    }
    save() {
        if (this.persistent) {
            OWebDataStore.save(this._tag_name, this._store);
        }
        return this;
    }
    clear() {
        this._store = {};
        return this.save();
    }
}
//# sourceMappingURL=OWebKeyStorage.js.map