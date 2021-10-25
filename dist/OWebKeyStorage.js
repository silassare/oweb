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
        let data = this._store[key];
        if (data !== undefined) {
            data = _hasExpired(data)
                ? this.removeItem(key) && null
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYktleVN0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYktleVN0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFRbEMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFjLEVBQVcsRUFBRTtJQUMvQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3RCLE9BQU8sTUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUM7QUFDdkMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFlLFNBQVEsU0FBUztJQVdsQztJQUNBO0lBQ1Q7SUFaUSxZQUFZLENBQVM7SUFDOUIsTUFBTSxDQUE4QjtJQUU1Qzs7Ozs7T0FLRztJQUNILFlBQ2tCLFdBQW9CLEVBQ3BCLE9BQWUsRUFDeEIsYUFBc0IsSUFBSSxFQUNsQyxXQUFXLEdBQUcsUUFBUTtRQUV0QixLQUFLLEVBQUUsQ0FBQztRQUxTLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ3BCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDeEIsZUFBVSxHQUFWLFVBQVUsQ0FBZ0I7UUFLbEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JELElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQztRQUV2QyxXQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDM0IsQ0FBQyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZO1FBQ1gsTUFBTSxLQUFLLEdBQStCLEVBQUUsQ0FBQztRQUU3QyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLEdBQVc7UUFDbEIsSUFBSSxJQUFJLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV0QyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDdkIsSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7Z0JBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUk7Z0JBQzlCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ2Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7T0FLRztJQUVILE9BQU8sQ0FBQyxHQUFXLEVBQUUsS0FBaUI7UUFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRztZQUNsQixLQUFLO1lBQ0wsTUFBTSxFQUNMLElBQUksQ0FBQyxZQUFZLEtBQUssUUFBUTtnQkFDN0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZO1NBQ2xDLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxHQUFXO1FBQ3JCLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssS0FBSztRQUNaLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbkQ7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUs7UUFDSixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLGFBQWE7UUFDcEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2xDLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN0QixRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNoQixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDckI7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDMUIsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xuaW1wb3J0IHsgZm9yRWFjaCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtPSlNPTlZhbHVlfSBmcm9tICcuL09XZWJEYXRhU3RvcmUnO1xuXG50eXBlIE9LZXlEYXRhID0ge1xuXHR2YWx1ZTogYW55O1xuXHRleHBpcmU6IG51bWJlcjtcbn07XG5cbmNvbnN0IF9oYXNFeHBpcmVkID0gKGRhdGE6IE9LZXlEYXRhKTogYm9vbGVhbiA9PiB7XG5cdGNvbnN0IG5vdyA9IERhdGUubm93KCksXG5cdFx0ZXhwaXJlID0gZGF0YS5leHBpcmU7XG5cdHJldHVybiBleHBpcmUgIT09IC0xICYmIG5vdyA8PSBleHBpcmU7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViS2V5U3RvcmFnZSBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX21heExpZmVUaW1lOiBudW1iZXI7XG5cdHByaXZhdGUgX3N0b3JlOiB7IFtrZXk6IHN0cmluZ106IE9LZXlEYXRhIH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBfYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSB0YWdOYW1lIFRoZSBrZXkgc3RvcmFnZSBuYW1lLlxuXHQgKiBAcGFyYW0gcGVyc2lzdGVudCBUcnVlIHRvIHBlcnNpc3RzIHRoZSBrZXkgc3RvcmFnZSBkYXRhLlxuXHQgKiBAcGFyYW0gbWF4TGlmZVRpbWUgVGhlIGR1cmF0aW9uIGluIHNlY29uZHMgdW50aWwga2V5IGRhdGEgZGVsZXRpb24uXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IF9hcHBDb250ZXh0OiBPV2ViQXBwLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgdGFnTmFtZTogc3RyaW5nLFxuXHRcdHByaXZhdGUgcGVyc2lzdGVudDogYm9vbGVhbiA9IHRydWUsXG5cdFx0bWF4TGlmZVRpbWUgPSBJbmZpbml0eVxuXHQpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0Y29uc3QgbSA9IHRoaXM7XG5cdFx0dGhpcy5fc3RvcmUgPSBfYXBwQ29udGV4dC5scy5nZXQodGhpcy50YWdOYW1lKSB8fCB7fTtcblx0XHR0aGlzLl9tYXhMaWZlVGltZSA9IG1heExpZmVUaW1lICogMTAwMDtcblxuXHRcdF9hcHBDb250ZXh0LmxzLm9uQ2xlYXIoKCkgPT4ge1xuXHRcdFx0bS5fc3RvcmUgPSB7fTtcblx0XHR9KTtcblxuXHRcdHRoaXMuX2NsZWFyRXhwaXJlZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGtleSBzdG9yYWdlIGRhdGEuXG5cdCAqL1xuXHRnZXRTdG9yZURhdGEoKTogUmVjb3JkPHN0cmluZywgT0pTT05WYWx1ZT4ge1xuXHRcdGNvbnN0IGl0ZW1zOiBSZWNvcmQ8c3RyaW5nLCBPSlNPTlZhbHVlPiA9IHt9O1xuXG5cdFx0dGhpcy5fY2xlYXJFeHBpcmVkKCk7XG5cblx0XHRmb3JFYWNoKHRoaXMuX3N0b3JlLCAoZGF0YSwga2V5KSA9PiB7XG5cdFx0XHRpdGVtc1trZXldID0gZGF0YS52YWx1ZTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBpdGVtcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgZ2l2ZW4ga2V5IHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgbmFtZS5cblx0ICovXG5cdGdldEl0ZW0oa2V5OiBzdHJpbmcpOiBPSlNPTlZhbHVlIHwgbnVsbCB7XG5cdFx0bGV0IGRhdGE6IE9LZXlEYXRhID0gdGhpcy5fc3RvcmVba2V5XTtcblxuXHRcdGlmIChkYXRhICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGRhdGEgPSBfaGFzRXhwaXJlZChkYXRhKVxuXHRcdFx0XHQ/IHRoaXMucmVtb3ZlSXRlbShrZXkpICYmIG51bGxcblx0XHRcdFx0OiBkYXRhLnZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBkYXRhO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgYW4gaXRlbSB0byB0aGUga2V5IHN0b3JhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSBuYW1lLlxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIGtleSB2YWx1ZS5cblx0ICovXG5cblx0c2V0SXRlbShrZXk6IHN0cmluZywgdmFsdWU6IE9KU09OVmFsdWUpOiB0aGlzIHtcblx0XHR0aGlzLl9zdG9yZVtrZXldID0ge1xuXHRcdFx0dmFsdWUsXG5cdFx0XHRleHBpcmU6XG5cdFx0XHRcdHRoaXMuX21heExpZmVUaW1lID09PSBJbmZpbml0eVxuXHRcdFx0XHRcdD8gLTFcblx0XHRcdFx0XHQ6IERhdGUubm93KCkgKyB0aGlzLl9tYXhMaWZlVGltZSxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHRoaXMuX3NhdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGl0ZW0gZnJvbSB0aGUga2V5IHN0b3JhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGl0ZW0ga2V5IG5hbWUuXG5cdCAqL1xuXHRyZW1vdmVJdGVtKGtleTogc3RyaW5nKTogdGhpcyB7XG5cdFx0aWYgKGtleSBpbiB0aGlzLl9zdG9yZSkge1xuXHRcdFx0ZGVsZXRlIHRoaXMuX3N0b3JlW2tleV07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX3NhdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIHRoZSBrZXkgc3RvcmFnZS5cblx0ICovXG5cdHByaXZhdGUgX3NhdmUoKTogdGhpcyB7XG5cdFx0aWYgKHRoaXMucGVyc2lzdGVudCkge1xuXHRcdFx0dGhpcy5fYXBwQ29udGV4dC5scy5zZXQodGhpcy50YWdOYW1lLCB0aGlzLl9zdG9yZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXIgdGhlIGtleSBzdG9yYWdlLlxuXHQgKi9cblx0Y2xlYXIoKTogdGhpcyB7XG5cdFx0dGhpcy5fc3RvcmUgPSB7fTtcblx0XHRyZXR1cm4gdGhpcy5fc2F2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciB0byBjbGVhciBhbGwgZXhwaXJlZCB2YWx1ZSBmcm9tIHRoZSBrZXkgc3RvcmFnZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX2NsZWFyRXhwaXJlZCgpIHtcblx0XHRjb25zdCBzID0gdGhpcztcblx0XHRsZXQgbW9kaWZpZWQgPSBmYWxzZTtcblx0XHRmb3JFYWNoKHRoaXMuX3N0b3JlLCAoZGF0YSwga2V5KSA9PiB7XG5cdFx0XHRpZiAoX2hhc0V4cGlyZWQoZGF0YSkpIHtcblx0XHRcdFx0bW9kaWZpZWQgPSB0cnVlO1xuXHRcdFx0XHRkZWxldGUgcy5fc3RvcmVba2V5XTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdG1vZGlmaWVkICYmIHRoaXMuX3NhdmUoKTtcblx0fVxufVxuIl19