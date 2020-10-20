import OWebEvent from './OWebEvent';
import { forEach } from './utils';
const _hasExpired = (data) => {
    const now = Date.now(), expire = data.expire;
    return expire !== -1 && now <= expire;
};
export default class OWebKeyStorage extends OWebEvent {
    /**
     * @param _appContext The app context.
     * @param tagName The key storage name.
     * @param persistent True to persists the key storage data.
     * @param maxLifeTime The duration in seconds until key data deletion.
     */
    constructor(_appContext, tagName, persistent = true, maxLifeTime = Infinity) {
        super();
        this._appContext = _appContext;
        this.tagName = tagName;
        this.persistent = persistent;
        const m = this;
        this._store = _appContext.ls.get(this.tagName) || {};
        this._maxLifeTime = maxLifeTime * 1000;
        _appContext.ls.onClear(function () {
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
            this._appContext.ls.set(this.tagName, this._store);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYktleVN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYktleVN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFPbEMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFjLEVBQVcsRUFBRTtJQUMvQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3RCLE9BQU8sTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUM7QUFDdkMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFlLFNBQVEsU0FBUztJQUlwRDs7Ozs7T0FLRztJQUNILFlBQ2tCLFdBQW9CLEVBQ3BCLE9BQWUsRUFDeEIsYUFBc0IsSUFBSSxFQUNsQyxXQUFXLEdBQUcsUUFBUTtRQUV0QixLQUFLLEVBQUUsQ0FBQztRQUxTLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ3BCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDeEIsZUFBVSxHQUFWLFVBQVUsQ0FBZ0I7UUFLbEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JELElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQztRQUV2QyxXQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUN0QixDQUFDLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNILFlBQVk7UUFDWCxNQUFNLEtBQUssR0FBUSxFQUFFLENBQUM7UUFFdEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXJCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2xDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxHQUFXO1FBQ2xCLElBQUksSUFBSSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdEMsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ3ZCLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO2dCQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTO2dCQUNuQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFFSCxPQUFPLENBQUMsR0FBVyxFQUFFLEtBQVU7UUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRztZQUNsQixLQUFLO1lBQ0wsTUFBTSxFQUNMLElBQUksQ0FBQyxZQUFZLEtBQUssUUFBUTtnQkFDN0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZO1NBQ2xDLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxHQUFXO1FBQ3JCLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssS0FBSztRQUNaLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbkQ7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUs7UUFDSixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLGFBQWE7UUFDcEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2xDLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN0QixRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNoQixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDckI7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDMUIsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xuaW1wb3J0IHsgZm9yRWFjaCB9IGZyb20gJy4vdXRpbHMnO1xuXG50eXBlIE9LZXlEYXRhID0ge1xuXHR2YWx1ZTogYW55O1xuXHRleHBpcmU6IG51bWJlcjtcbn07XG5cbmNvbnN0IF9oYXNFeHBpcmVkID0gKGRhdGE6IE9LZXlEYXRhKTogYm9vbGVhbiA9PiB7XG5cdGNvbnN0IG5vdyA9IERhdGUubm93KCksXG5cdFx0ZXhwaXJlID0gZGF0YS5leHBpcmU7XG5cdHJldHVybiBleHBpcmUgIT09IC0xICYmIG5vdyA8PSBleHBpcmU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViS2V5U3RvcmFnZSBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX21heExpZmVUaW1lOiBudW1iZXI7XG5cdHByaXZhdGUgX3N0b3JlOiB7IFtrZXk6IHN0cmluZ106IE9LZXlEYXRhIH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBfYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSB0YWdOYW1lIFRoZSBrZXkgc3RvcmFnZSBuYW1lLlxuXHQgKiBAcGFyYW0gcGVyc2lzdGVudCBUcnVlIHRvIHBlcnNpc3RzIHRoZSBrZXkgc3RvcmFnZSBkYXRhLlxuXHQgKiBAcGFyYW0gbWF4TGlmZVRpbWUgVGhlIGR1cmF0aW9uIGluIHNlY29uZHMgdW50aWwga2V5IGRhdGEgZGVsZXRpb24uXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IF9hcHBDb250ZXh0OiBPV2ViQXBwLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgdGFnTmFtZTogc3RyaW5nLFxuXHRcdHByaXZhdGUgcGVyc2lzdGVudDogYm9vbGVhbiA9IHRydWUsXG5cdFx0bWF4TGlmZVRpbWUgPSBJbmZpbml0eSxcblx0KSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdGNvbnN0IG0gPSB0aGlzO1xuXHRcdHRoaXMuX3N0b3JlID0gX2FwcENvbnRleHQubHMuZ2V0KHRoaXMudGFnTmFtZSkgfHwge307XG5cdFx0dGhpcy5fbWF4TGlmZVRpbWUgPSBtYXhMaWZlVGltZSAqIDEwMDA7XG5cblx0XHRfYXBwQ29udGV4dC5scy5vbkNsZWFyKGZ1bmN0aW9uICgpIHtcblx0XHRcdG0uX3N0b3JlID0ge307XG5cdFx0fSk7XG5cblx0XHR0aGlzLl9jbGVhckV4cGlyZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBrZXkgc3RvcmFnZSBkYXRhLlxuXHQgKi9cblx0Z2V0U3RvcmVEYXRhKCk6IHt9IHtcblx0XHRjb25zdCBpdGVtczogYW55ID0ge307XG5cblx0XHR0aGlzLl9jbGVhckV4cGlyZWQoKTtcblxuXHRcdGZvckVhY2godGhpcy5fc3RvcmUsIChkYXRhLCBrZXkpID0+IHtcblx0XHRcdGl0ZW1zW2tleV0gPSBkYXRhLnZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGl0ZW1zO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBnaXZlbiBrZXkgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSBuYW1lLlxuXHQgKi9cblx0Z2V0SXRlbShrZXk6IHN0cmluZyk6IGFueSB7XG5cdFx0bGV0IGRhdGE6IE9LZXlEYXRhID0gdGhpcy5fc3RvcmVba2V5XTtcblxuXHRcdGlmIChkYXRhICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGRhdGEgPSBfaGFzRXhwaXJlZChkYXRhKVxuXHRcdFx0XHQ/IHRoaXMucmVtb3ZlSXRlbShrZXkpICYmIHVuZGVmaW5lZFxuXHRcdFx0XHQ6IGRhdGEudmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhbiBpdGVtIHRvIHRoZSBrZXkgc3RvcmFnZS5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IG5hbWUuXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUga2V5IHZhbHVlLlxuXHQgKi9cblxuXHRzZXRJdGVtKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XG5cdFx0dGhpcy5fc3RvcmVba2V5XSA9IHtcblx0XHRcdHZhbHVlLFxuXHRcdFx0ZXhwaXJlOlxuXHRcdFx0XHR0aGlzLl9tYXhMaWZlVGltZSA9PT0gSW5maW5pdHlcblx0XHRcdFx0XHQ/IC0xXG5cdFx0XHRcdFx0OiBEYXRlLm5vdygpICsgdGhpcy5fbWF4TGlmZVRpbWUsXG5cdFx0fTtcblxuXHRcdHJldHVybiB0aGlzLl9zYXZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBpdGVtIGZyb20gdGhlIGtleSBzdG9yYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBpdGVtIGtleSBuYW1lLlxuXHQgKi9cblx0cmVtb3ZlSXRlbShrZXk6IHN0cmluZyk6IHRoaXMge1xuXHRcdGlmIChrZXkgaW4gdGhpcy5fc3RvcmUpIHtcblx0XHRcdGRlbGV0ZSB0aGlzLl9zdG9yZVtrZXldO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9zYXZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogU2F2ZSB0aGUga2V5IHN0b3JhZ2UuXG5cdCAqL1xuXHRwcml2YXRlIF9zYXZlKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLnBlcnNpc3RlbnQpIHtcblx0XHRcdHRoaXMuX2FwcENvbnRleHQubHMuc2V0KHRoaXMudGFnTmFtZSwgdGhpcy5fc3RvcmUpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFyIHRoZSBrZXkgc3RvcmFnZS5cblx0ICovXG5cdGNsZWFyKCk6IHRoaXMge1xuXHRcdHRoaXMuX3N0b3JlID0ge307XG5cdFx0cmV0dXJuIHRoaXMuX3NhdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgdG8gY2xlYXIgYWxsIGV4cGlyZWQgdmFsdWUgZnJvbSB0aGUga2V5IHN0b3JhZ2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9jbGVhckV4cGlyZWQoKSB7XG5cdFx0Y29uc3QgcyA9IHRoaXM7XG5cdFx0bGV0IG1vZGlmaWVkID0gZmFsc2U7XG5cdFx0Zm9yRWFjaCh0aGlzLl9zdG9yZSwgKGRhdGEsIGtleSkgPT4ge1xuXHRcdFx0aWYgKF9oYXNFeHBpcmVkKGRhdGEpKSB7XG5cdFx0XHRcdG1vZGlmaWVkID0gdHJ1ZTtcblx0XHRcdFx0ZGVsZXRlIHMuX3N0b3JlW2tleV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRtb2RpZmllZCAmJiB0aGlzLl9zYXZlKCk7XG5cdH1cbn1cbiJdfQ==