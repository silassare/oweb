import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";
let _hasExpired = (data) => {
    let now = Date.now(), expire = data["expire"];
    return expire != -1 && now <= expire;
};
export default class OWebKeyStorage extends OWebEvent {
    /**
     * @param app_context The app context.
     * @param tag_name The key storage name.
     * @param persistent True to persists the key storage data.
     * @param max_life_time The duration in seconds until key data deletion.
     */
    constructor(app_context, tag_name, persistent = true, max_life_time = Infinity) {
        super();
        this.app_context = app_context;
        this.tag_name = tag_name;
        this.persistent = persistent;
        let m = this;
        this._store = app_context.ls.load(this.tag_name) || {};
        this._max_life_time = max_life_time * 1000;
        app_context.ls.onClear(function () {
            m._store = {};
        });
        this._clearExpired();
    }
    /**
     * Returns the key storage data.
     */
    getStoreData() {
        let items = {};
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
    getItem(key) {
        let data = this._store[key];
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
    setItem(key, value) {
        this._store[key] = {
            "value": value,
            "expire": this._max_life_time === Infinity ? -1 : Date.now() + this._max_life_time
        };
        return this._save();
    }
    /**
     * Removes item from the key storage.
     *
     * @param key The item key name.
     */
    removeItem(key) {
        if (key in this._store) {
            delete this._store[key];
        }
        return this._save();
    }
    /**
     * Save the key storage.
     */
    _save() {
        if (this.persistent) {
            this.app_context.ls.save(this.tag_name, this._store);
        }
        return this;
    }
    /**
     * Clear the key storage.
     */
    clear() {
        this._store = {};
        return this._save();
    }
    /**
     * Helper to clear all expired value from the key storage.
     *
     * @private
     */
    _clearExpired() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYktleVN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYktleVN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQU9sQyxJQUFJLFdBQVcsR0FBRyxDQUFDLElBQWMsRUFBVyxFQUFFO0lBQzdDLElBQUksR0FBRyxHQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFDdEIsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6QixPQUFPLE1BQU0sSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDO0FBQ3RDLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sY0FBZSxTQUFRLFNBQVM7SUFJcEQ7Ozs7O09BS0c7SUFDSCxZQUE2QixXQUFvQixFQUFtQixRQUFnQixFQUFVLGFBQXNCLElBQUksRUFBRSxnQkFBd0IsUUFBUTtRQUN6SixLQUFLLEVBQUUsQ0FBQztRQURvQixnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUFtQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVUsZUFBVSxHQUFWLFVBQVUsQ0FBZ0I7UUFHdkgsSUFBSSxDQUFDLEdBQWlCLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFXLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBRTNDLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsWUFBWTtRQUNYLElBQUksS0FBSyxHQUFRLEVBQUUsQ0FBQztRQUVwQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ3hDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLEdBQVc7UUFDbEIsSUFBSSxJQUFJLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV0QyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDdkIsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM3RTtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7OztPQUtHO0lBRUgsT0FBTyxDQUFDLEdBQVcsRUFBRSxLQUFVO1FBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUc7WUFDbEIsT0FBTyxFQUFHLEtBQUs7WUFDZixRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWM7U0FDbEYsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsVUFBVSxDQUFDLEdBQVc7UUFDckIsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDeEI7UUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSyxLQUFLO1FBQ1osSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNKLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssYUFBYTtRQUNwQixJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUMvQixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDeEMsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNyQjtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tIFwiLi9PV2ViQXBwXCI7XG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gXCIuL09XZWJFdmVudFwiO1xuaW1wb3J0IFV0aWxzIGZyb20gXCIuL3V0aWxzL1V0aWxzXCI7XG5cbnR5cGUgdEtleURhdGEgPSB7XG5cdHZhbHVlOiBhbnksXG5cdGV4cGlyZTogbnVtYmVyLFxufTtcblxubGV0IF9oYXNFeHBpcmVkID0gKGRhdGE6IHRLZXlEYXRhKTogYm9vbGVhbiA9PiB7XG5cdGxldCBub3cgICAgPSBEYXRlLm5vdygpLFxuXHRcdGV4cGlyZSA9IGRhdGFbXCJleHBpcmVcIl07XG5cdHJldHVybiBleHBpcmUgIT0gLTEgJiYgbm93IDw9IGV4cGlyZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJLZXlTdG9yYWdlIGV4dGVuZHMgT1dlYkV2ZW50IHtcblx0cHJpdmF0ZSByZWFkb25seSBfbWF4X2xpZmVfdGltZTogbnVtYmVyO1xuXHRwcml2YXRlIF9zdG9yZTogeyBba2V5OiBzdHJpbmddOiB0S2V5RGF0YSB9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYXBwX2NvbnRleHQgVGhlIGFwcCBjb250ZXh0LlxuXHQgKiBAcGFyYW0gdGFnX25hbWUgVGhlIGtleSBzdG9yYWdlIG5hbWUuXG5cdCAqIEBwYXJhbSBwZXJzaXN0ZW50IFRydWUgdG8gcGVyc2lzdHMgdGhlIGtleSBzdG9yYWdlIGRhdGEuXG5cdCAqIEBwYXJhbSBtYXhfbGlmZV90aW1lIFRoZSBkdXJhdGlvbiBpbiBzZWNvbmRzIHVudGlsIGtleSBkYXRhIGRlbGV0aW9uLlxuXHQgKi9cblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCwgcHJpdmF0ZSByZWFkb25seSB0YWdfbmFtZTogc3RyaW5nLCBwcml2YXRlIHBlcnNpc3RlbnQ6IGJvb2xlYW4gPSB0cnVlLCBtYXhfbGlmZV90aW1lOiBudW1iZXIgPSBJbmZpbml0eSkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHRsZXQgbSAgICAgICAgICAgICAgID0gdGhpcztcblx0XHR0aGlzLl9zdG9yZSAgICAgICAgID0gYXBwX2NvbnRleHQubHMubG9hZCh0aGlzLnRhZ19uYW1lKSB8fCB7fTtcblx0XHR0aGlzLl9tYXhfbGlmZV90aW1lID0gbWF4X2xpZmVfdGltZSAqIDEwMDA7XG5cblx0XHRhcHBfY29udGV4dC5scy5vbkNsZWFyKGZ1bmN0aW9uICgpIHtcblx0XHRcdG0uX3N0b3JlID0ge307XG5cdFx0fSk7XG5cblx0XHR0aGlzLl9jbGVhckV4cGlyZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBrZXkgc3RvcmFnZSBkYXRhLlxuXHQgKi9cblx0Z2V0U3RvcmVEYXRhKCk6IHt9IHtcblx0XHRsZXQgaXRlbXM6IGFueSA9IHt9O1xuXG5cdFx0dGhpcy5fY2xlYXJFeHBpcmVkKCk7XG5cblx0XHRVdGlscy5mb3JFYWNoKHRoaXMuX3N0b3JlLCAoZGF0YSwga2V5KSA9PiB7XG5cdFx0XHRpdGVtc1trZXldID0gZGF0YVtcInZhbHVlXCJdO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGl0ZW1zO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBnaXZlbiBrZXkgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSBuYW1lLlxuXHQgKi9cblx0Z2V0SXRlbShrZXk6IHN0cmluZyk6IGFueSB7XG5cdFx0bGV0IGRhdGE6IHRLZXlEYXRhID0gdGhpcy5fc3RvcmVba2V5XTtcblxuXHRcdGlmIChkYXRhICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGRhdGEgPSBfaGFzRXhwaXJlZChkYXRhKSA/IHRoaXMucmVtb3ZlSXRlbShrZXkpICYmIHVuZGVmaW5lZCA6IGRhdGFbXCJ2YWx1ZVwiXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGF0YTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGFuIGl0ZW0gdG8gdGhlIGtleSBzdG9yYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgbmFtZS5cblx0ICogQHBhcmFtIHZhbHVlIFRoZSBrZXkgdmFsdWUuXG5cdCAqL1xuXG5cdHNldEl0ZW0oa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB0aGlzIHtcblx0XHR0aGlzLl9zdG9yZVtrZXldID0ge1xuXHRcdFx0XCJ2YWx1ZVwiIDogdmFsdWUsXG5cdFx0XHRcImV4cGlyZVwiOiB0aGlzLl9tYXhfbGlmZV90aW1lID09PSBJbmZpbml0eSA/IC0xIDogRGF0ZS5ub3coKSArIHRoaXMuX21heF9saWZlX3RpbWVcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHRoaXMuX3NhdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGl0ZW0gZnJvbSB0aGUga2V5IHN0b3JhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGl0ZW0ga2V5IG5hbWUuXG5cdCAqL1xuXHRyZW1vdmVJdGVtKGtleTogc3RyaW5nKTogdGhpcyB7XG5cdFx0aWYgKGtleSBpbiB0aGlzLl9zdG9yZSkge1xuXHRcdFx0ZGVsZXRlIHRoaXMuX3N0b3JlW2tleV07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX3NhdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIHRoZSBrZXkgc3RvcmFnZS5cblx0ICovXG5cdHByaXZhdGUgX3NhdmUoKTogdGhpcyB7XG5cdFx0aWYgKHRoaXMucGVyc2lzdGVudCkge1xuXHRcdFx0dGhpcy5hcHBfY29udGV4dC5scy5zYXZlKHRoaXMudGFnX25hbWUsIHRoaXMuX3N0b3JlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhciB0aGUga2V5IHN0b3JhZ2UuXG5cdCAqL1xuXHRjbGVhcigpOiB0aGlzIHtcblx0XHR0aGlzLl9zdG9yZSA9IHt9O1xuXHRcdHJldHVybiB0aGlzLl9zYXZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIHRvIGNsZWFyIGFsbCBleHBpcmVkIHZhbHVlIGZyb20gdGhlIGtleSBzdG9yYWdlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfY2xlYXJFeHBpcmVkKCkge1xuXHRcdGxldCBzID0gdGhpcywgbW9kaWZpZWQgPSBmYWxzZTtcblx0XHRVdGlscy5mb3JFYWNoKHRoaXMuX3N0b3JlLCAoZGF0YSwga2V5KSA9PiB7XG5cdFx0XHRpZiAoX2hhc0V4cGlyZWQoZGF0YSkpIHtcblx0XHRcdFx0bW9kaWZpZWQgPSB0cnVlO1xuXHRcdFx0XHRkZWxldGUgcy5fc3RvcmVba2V5XTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdG1vZGlmaWVkICYmIHRoaXMuX3NhdmUoKTtcblx0fVxufVxuIl19