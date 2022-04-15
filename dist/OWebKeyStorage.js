import OWebEvent from './OWebEvent';
import { forEach } from './utils';
const _hasExpired = (data) => {
    const now = Date.now(), expire = data.expire;
    return expire !== -1 && now <= expire;
};
export default class OWebKeyStorage extends OWebEvent {
    _appContext;
    tagName;
    persistent;
    _maxLifeTime;
    _store;
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
        _appContext.ls.onClear(() => {
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
        const data = this._store[key];
        if (data) {
            return _hasExpired(data) ? this.removeItem(key) && null : data.value;
        }
        return null;
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
            expire: this._maxLifeTime === Infinity ? -1 : Date.now() + this._maxLifeTime,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYktleVN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYktleVN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFRbEMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFjLEVBQVcsRUFBRTtJQUMvQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3RCLE9BQU8sTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUM7QUFDdkMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFlLFNBQVEsU0FBUztJQVdsQztJQUNBO0lBQ1Q7SUFaUSxZQUFZLENBQVM7SUFDOUIsTUFBTSxDQUE4QjtJQUU1Qzs7Ozs7T0FLRztJQUNILFlBQ2tCLFdBQW9CLEVBQ3BCLE9BQWUsRUFDeEIsYUFBc0IsSUFBSSxFQUNsQyxXQUFXLEdBQUcsUUFBUTtRQUV0QixLQUFLLEVBQUUsQ0FBQztRQUxTLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ3BCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDeEIsZUFBVSxHQUFWLFVBQVUsQ0FBZ0I7UUFLbEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JELElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQztRQUV2QyxXQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDM0IsQ0FBQyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZO1FBQ1gsTUFBTSxLQUFLLEdBQStCLEVBQUUsQ0FBQztRQUU3QyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEtBQVUsQ0FBQztJQUNuQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBdUIsR0FBVztRQUN4QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBZ0IsQ0FBQztRQUU3QyxJQUFJLElBQUksRUFBRTtZQUNULE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNyRTtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7OztPQUtHO0lBRUgsT0FBTyxDQUFDLEdBQVcsRUFBRSxLQUFpQjtRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHO1lBQ2xCLEtBQUs7WUFDTCxNQUFNLEVBQ0wsSUFBSSxDQUFDLFlBQVksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVk7U0FDckUsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsVUFBVSxDQUFDLEdBQVc7UUFDckIsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDeEI7UUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSyxLQUFLO1FBQ1osSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNuRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNKLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssYUFBYTtRQUNwQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDZixJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDbEMsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNyQjtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xuaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuL09XZWJFdmVudCc7XG5pbXBvcnQgeyBmb3JFYWNoIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyBPSlNPTlZhbHVlIH0gZnJvbSAnLi9PV2ViRGF0YVN0b3JlJztcblxudHlwZSBPS2V5RGF0YTxUIGV4dGVuZHMgT0pTT05WYWx1ZSA9IE9KU09OVmFsdWU+ID0ge1xuXHR2YWx1ZTogVDtcblx0ZXhwaXJlOiBudW1iZXI7XG59O1xuXG5jb25zdCBfaGFzRXhwaXJlZCA9IChkYXRhOiBPS2V5RGF0YSk6IGJvb2xlYW4gPT4ge1xuXHRjb25zdCBub3cgPSBEYXRlLm5vdygpLFxuXHRcdGV4cGlyZSA9IGRhdGEuZXhwaXJlO1xuXHRyZXR1cm4gZXhwaXJlICE9PSAtMSAmJiBub3cgPD0gZXhwaXJlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYktleVN0b3JhZ2UgZXh0ZW5kcyBPV2ViRXZlbnQge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9tYXhMaWZlVGltZTogbnVtYmVyO1xuXHRwcml2YXRlIF9zdG9yZTogeyBba2V5OiBzdHJpbmddOiBPS2V5RGF0YSB9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gX2FwcENvbnRleHQgVGhlIGFwcCBjb250ZXh0LlxuXHQgKiBAcGFyYW0gdGFnTmFtZSBUaGUga2V5IHN0b3JhZ2UgbmFtZS5cblx0ICogQHBhcmFtIHBlcnNpc3RlbnQgVHJ1ZSB0byBwZXJzaXN0cyB0aGUga2V5IHN0b3JhZ2UgZGF0YS5cblx0ICogQHBhcmFtIG1heExpZmVUaW1lIFRoZSBkdXJhdGlvbiBpbiBzZWNvbmRzIHVudGlsIGtleSBkYXRhIGRlbGV0aW9uLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBfYXBwQ29udGV4dDogT1dlYkFwcCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IHRhZ05hbWU6IHN0cmluZyxcblx0XHRwcml2YXRlIHBlcnNpc3RlbnQ6IGJvb2xlYW4gPSB0cnVlLFxuXHRcdG1heExpZmVUaW1lID0gSW5maW5pdHlcblx0KSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdGNvbnN0IG0gPSB0aGlzO1xuXHRcdHRoaXMuX3N0b3JlID0gX2FwcENvbnRleHQubHMuZ2V0KHRoaXMudGFnTmFtZSkgfHwge307XG5cdFx0dGhpcy5fbWF4TGlmZVRpbWUgPSBtYXhMaWZlVGltZSAqIDEwMDA7XG5cblx0XHRfYXBwQ29udGV4dC5scy5vbkNsZWFyKCgpID0+IHtcblx0XHRcdG0uX3N0b3JlID0ge307XG5cdFx0fSk7XG5cblx0XHR0aGlzLl9jbGVhckV4cGlyZWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBrZXkgc3RvcmFnZSBkYXRhLlxuXHQgKi9cblx0Z2V0U3RvcmVEYXRhPEQgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBPSlNPTlZhbHVlPj4oKTogRCB7XG5cdFx0Y29uc3QgaXRlbXM6IFJlY29yZDxzdHJpbmcsIE9KU09OVmFsdWU+ID0ge307XG5cblx0XHR0aGlzLl9jbGVhckV4cGlyZWQoKTtcblxuXHRcdGZvckVhY2godGhpcy5fc3RvcmUsIChkYXRhLCBrZXkpID0+IHtcblx0XHRcdGl0ZW1zW2tleV0gPSBkYXRhLnZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGl0ZW1zIGFzIEQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIGdpdmVuIGtleSB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IG5hbWUuXG5cdCAqL1xuXHRnZXRJdGVtPFQgZXh0ZW5kcyBPSlNPTlZhbHVlPihrZXk6IHN0cmluZyk6IFQgfCBudWxsIHtcblx0XHRjb25zdCBkYXRhID0gdGhpcy5fc3RvcmVba2V5XSBhcyBPS2V5RGF0YTxUPjtcblxuXHRcdGlmIChkYXRhKSB7XG5cdFx0XHRyZXR1cm4gX2hhc0V4cGlyZWQoZGF0YSkgPyB0aGlzLnJlbW92ZUl0ZW0oa2V5KSAmJiBudWxsIDogZGF0YS52YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGFuIGl0ZW0gdG8gdGhlIGtleSBzdG9yYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgbmFtZS5cblx0ICogQHBhcmFtIHZhbHVlIFRoZSBrZXkgdmFsdWUuXG5cdCAqL1xuXG5cdHNldEl0ZW0oa2V5OiBzdHJpbmcsIHZhbHVlOiBPSlNPTlZhbHVlKTogdGhpcyB7XG5cdFx0dGhpcy5fc3RvcmVba2V5XSA9IHtcblx0XHRcdHZhbHVlLFxuXHRcdFx0ZXhwaXJlOlxuXHRcdFx0XHR0aGlzLl9tYXhMaWZlVGltZSA9PT0gSW5maW5pdHkgPyAtMSA6IERhdGUubm93KCkgKyB0aGlzLl9tYXhMaWZlVGltZSxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHRoaXMuX3NhdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGl0ZW0gZnJvbSB0aGUga2V5IHN0b3JhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGl0ZW0ga2V5IG5hbWUuXG5cdCAqL1xuXHRyZW1vdmVJdGVtKGtleTogc3RyaW5nKTogdGhpcyB7XG5cdFx0aWYgKGtleSBpbiB0aGlzLl9zdG9yZSkge1xuXHRcdFx0ZGVsZXRlIHRoaXMuX3N0b3JlW2tleV07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX3NhdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIHRoZSBrZXkgc3RvcmFnZS5cblx0ICovXG5cdHByaXZhdGUgX3NhdmUoKTogdGhpcyB7XG5cdFx0aWYgKHRoaXMucGVyc2lzdGVudCkge1xuXHRcdFx0dGhpcy5fYXBwQ29udGV4dC5scy5zZXQodGhpcy50YWdOYW1lLCB0aGlzLl9zdG9yZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXIgdGhlIGtleSBzdG9yYWdlLlxuXHQgKi9cblx0Y2xlYXIoKTogdGhpcyB7XG5cdFx0dGhpcy5fc3RvcmUgPSB7fTtcblx0XHRyZXR1cm4gdGhpcy5fc2F2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciB0byBjbGVhciBhbGwgZXhwaXJlZCB2YWx1ZSBmcm9tIHRoZSBrZXkgc3RvcmFnZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX2NsZWFyRXhwaXJlZCgpIHtcblx0XHRjb25zdCBzID0gdGhpcztcblx0XHRsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblx0XHRmb3JFYWNoKHRoaXMuX3N0b3JlLCAoZGF0YSwga2V5KSA9PiB7XG5cdFx0XHRpZiAoX2hhc0V4cGlyZWQoZGF0YSkpIHtcblx0XHRcdFx0bW9kaWZpZWQgPSB0cnVlO1xuXHRcdFx0XHRkZWxldGUgcy5fc3RvcmVba2V5XTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdG1vZGlmaWVkICYmIHRoaXMuX3NhdmUoKTtcblx0fVxufVxuIl19