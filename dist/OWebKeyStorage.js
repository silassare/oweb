import OWebEvent from './OWebEvent';
import { forEach } from './utils';
const _hasExpired = (data) => {
    const now = Date.now(), expire = data.expire;
    return expire !== -1 && now <= expire;
};
export default class OWebKeyStorage extends OWebEvent {
    /**
     * @param appContext The app context.
     * @param tagName The key storage name.
     * @param persistent True to persists the key storage data.
     * @param maxLifeTime The duration in seconds until key data deletion.
     */
    constructor(appContext, tagName, persistent = true, maxLifeTime = Infinity) {
        super();
        this.appContext = appContext;
        this.tagName = tagName;
        this.persistent = persistent;
        const m = this;
        this._store = appContext.ls.load(this.tagName) || {};
        this._maxLifeTime = maxLifeTime * 1000;
        appContext.ls.onClear(function () {
            m._store = {};
        });
        this._clearExpired();
    }
    /**
     * Returns the key storage data.
     */
    getStoreData() {
        const items = {};
        this._clearExpired();
        forEach(this._store, (data, key) => {
            items[key] = data.value;
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
            data = _hasExpired(data)
                ? this.removeItem(key) && undefined
                : data.value;
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
            value,
            expire: this._maxLifeTime === Infinity
                ? -1
                : Date.now() + this._maxLifeTime,
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
            this.appContext.ls.save(this.tagName, this._store);
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
        const s = this;
        let modified = false;
        forEach(this._store, (data, key) => {
            if (_hasExpired(data)) {
                modified = true;
                delete s._store[key];
            }
        });
        modified && this._save();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYktleVN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYktleVN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFPbEMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFjLEVBQVcsRUFBRTtJQUMvQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3RCLE9BQU8sTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUM7QUFDdkMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFlLFNBQVEsU0FBUztJQUlwRDs7Ozs7T0FLRztJQUNILFlBQ2tCLFVBQW1CLEVBQ25CLE9BQWUsRUFDeEIsYUFBc0IsSUFBSSxFQUNsQyxjQUFzQixRQUFRO1FBRTlCLEtBQUssRUFBRSxDQUFDO1FBTFMsZUFBVSxHQUFWLFVBQVUsQ0FBUztRQUNuQixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ3hCLGVBQVUsR0FBVixVQUFVLENBQWdCO1FBS2xDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyRCxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFFdkMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDckIsQ0FBQyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZO1FBQ1gsTUFBTSxLQUFLLEdBQVEsRUFBRSxDQUFDO1FBRXRCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNsQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsR0FBVztRQUNsQixJQUFJLElBQUksR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXRDLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUN2QixJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztnQkFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUztnQkFDbkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDZDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7OztPQUtHO0lBRUgsT0FBTyxDQUFDLEdBQVcsRUFBRSxLQUFVO1FBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUc7WUFDbEIsS0FBSztZQUNMLE1BQU0sRUFDTCxJQUFJLENBQUMsWUFBWSxLQUFLLFFBQVE7Z0JBQzdCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWTtTQUNsQyxDQUFDO1FBRUYsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxVQUFVLENBQUMsR0FBVztRQUNyQixJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN4QjtRQUVELE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7T0FFRztJQUNLLEtBQUs7UUFDWixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ25EO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLO1FBQ0osSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxhQUFhO1FBQ3BCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNsQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdEIsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDaEIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3JCO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzFCLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcbmltcG9ydCB7IGZvckVhY2ggfSBmcm9tICcuL3V0aWxzJztcblxudHlwZSB0S2V5RGF0YSA9IHtcblx0dmFsdWU6IGFueTtcblx0ZXhwaXJlOiBudW1iZXI7XG59O1xuXG5jb25zdCBfaGFzRXhwaXJlZCA9IChkYXRhOiB0S2V5RGF0YSk6IGJvb2xlYW4gPT4ge1xuXHRjb25zdCBub3cgPSBEYXRlLm5vdygpLFxuXHRcdGV4cGlyZSA9IGRhdGEuZXhwaXJlO1xuXHRyZXR1cm4gZXhwaXJlICE9PSAtMSAmJiBub3cgPD0gZXhwaXJlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYktleVN0b3JhZ2UgZXh0ZW5kcyBPV2ViRXZlbnQge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9tYXhMaWZlVGltZTogbnVtYmVyO1xuXHRwcml2YXRlIF9zdG9yZTogeyBba2V5OiBzdHJpbmddOiB0S2V5RGF0YSB9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSB0YWdOYW1lIFRoZSBrZXkgc3RvcmFnZSBuYW1lLlxuXHQgKiBAcGFyYW0gcGVyc2lzdGVudCBUcnVlIHRvIHBlcnNpc3RzIHRoZSBrZXkgc3RvcmFnZSBkYXRhLlxuXHQgKiBAcGFyYW0gbWF4TGlmZVRpbWUgVGhlIGR1cmF0aW9uIGluIHNlY29uZHMgdW50aWwga2V5IGRhdGEgZGVsZXRpb24uXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IGFwcENvbnRleHQ6IE9XZWJBcHAsXG5cdFx0cHJpdmF0ZSByZWFkb25seSB0YWdOYW1lOiBzdHJpbmcsXG5cdFx0cHJpdmF0ZSBwZXJzaXN0ZW50OiBib29sZWFuID0gdHJ1ZSxcblx0XHRtYXhMaWZlVGltZTogbnVtYmVyID0gSW5maW5pdHksXG5cdCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHRjb25zdCBtID0gdGhpcztcblx0XHR0aGlzLl9zdG9yZSA9IGFwcENvbnRleHQubHMubG9hZCh0aGlzLnRhZ05hbWUpIHx8IHt9O1xuXHRcdHRoaXMuX21heExpZmVUaW1lID0gbWF4TGlmZVRpbWUgKiAxMDAwO1xuXG5cdFx0YXBwQ29udGV4dC5scy5vbkNsZWFyKGZ1bmN0aW9uICgpIHtcblx0XHRcdG0uX3N0b3JlID0ge307XG5cdFx0fSk7XG5cblx0XHR0aGlzLl9jbGVhckV4cGlyZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBrZXkgc3RvcmFnZSBkYXRhLlxuXHQgKi9cblx0Z2V0U3RvcmVEYXRhKCk6IHt9IHtcblx0XHRjb25zdCBpdGVtczogYW55ID0ge307XG5cblx0XHR0aGlzLl9jbGVhckV4cGlyZWQoKTtcblxuXHRcdGZvckVhY2godGhpcy5fc3RvcmUsIChkYXRhLCBrZXkpID0+IHtcblx0XHRcdGl0ZW1zW2tleV0gPSBkYXRhLnZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGl0ZW1zO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBnaXZlbiBrZXkgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSBuYW1lLlxuXHQgKi9cblx0Z2V0SXRlbShrZXk6IHN0cmluZyk6IGFueSB7XG5cdFx0bGV0IGRhdGE6IHRLZXlEYXRhID0gdGhpcy5fc3RvcmVba2V5XTtcblxuXHRcdGlmIChkYXRhICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGRhdGEgPSBfaGFzRXhwaXJlZChkYXRhKVxuXHRcdFx0XHQ/IHRoaXMucmVtb3ZlSXRlbShrZXkpICYmIHVuZGVmaW5lZFxuXHRcdFx0XHQ6IGRhdGEudmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhbiBpdGVtIHRvIHRoZSBrZXkgc3RvcmFnZS5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IG5hbWUuXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUga2V5IHZhbHVlLlxuXHQgKi9cblxuXHRzZXRJdGVtKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XG5cdFx0dGhpcy5fc3RvcmVba2V5XSA9IHtcblx0XHRcdHZhbHVlLFxuXHRcdFx0ZXhwaXJlOlxuXHRcdFx0XHR0aGlzLl9tYXhMaWZlVGltZSA9PT0gSW5maW5pdHlcblx0XHRcdFx0XHQ/IC0xXG5cdFx0XHRcdFx0OiBEYXRlLm5vdygpICsgdGhpcy5fbWF4TGlmZVRpbWUsXG5cdFx0fTtcblxuXHRcdHJldHVybiB0aGlzLl9zYXZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBpdGVtIGZyb20gdGhlIGtleSBzdG9yYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBpdGVtIGtleSBuYW1lLlxuXHQgKi9cblx0cmVtb3ZlSXRlbShrZXk6IHN0cmluZyk6IHRoaXMge1xuXHRcdGlmIChrZXkgaW4gdGhpcy5fc3RvcmUpIHtcblx0XHRcdGRlbGV0ZSB0aGlzLl9zdG9yZVtrZXldO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9zYXZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogU2F2ZSB0aGUga2V5IHN0b3JhZ2UuXG5cdCAqL1xuXHRwcml2YXRlIF9zYXZlKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLnBlcnNpc3RlbnQpIHtcblx0XHRcdHRoaXMuYXBwQ29udGV4dC5scy5zYXZlKHRoaXMudGFnTmFtZSwgdGhpcy5fc3RvcmUpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFyIHRoZSBrZXkgc3RvcmFnZS5cblx0ICovXG5cdGNsZWFyKCk6IHRoaXMge1xuXHRcdHRoaXMuX3N0b3JlID0ge307XG5cdFx0cmV0dXJuIHRoaXMuX3NhdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgdG8gY2xlYXIgYWxsIGV4cGlyZWQgdmFsdWUgZnJvbSB0aGUga2V5IHN0b3JhZ2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9jbGVhckV4cGlyZWQoKSB7XG5cdFx0Y29uc3QgcyA9IHRoaXM7XG5cdFx0bGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cdFx0Zm9yRWFjaCh0aGlzLl9zdG9yZSwgKGRhdGEsIGtleSkgPT4ge1xuXHRcdFx0aWYgKF9oYXNFeHBpcmVkKGRhdGEpKSB7XG5cdFx0XHRcdG1vZGlmaWVkID0gdHJ1ZTtcblx0XHRcdFx0ZGVsZXRlIHMuX3N0b3JlW2tleV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRtb2RpZmllZCAmJiB0aGlzLl9zYXZlKCk7XG5cdH1cbn1cbiJdfQ==