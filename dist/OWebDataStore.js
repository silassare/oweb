import OWebEvent from './OWebEvent';
import { id, logger } from './utils';
const ls = window.localStorage, parse = function (data) {
    let value;
    if (data !== null) {
        try {
            value = JSON.parse(data);
        }
        catch (e) {
            logger.error(e);
        }
    }
    return value;
};
export default class OWebDataStore extends OWebEvent {
    constructor(_appContext) {
        super();
        this._appContext = _appContext;
        this._data = {};
        this._key = _appContext.getAppName();
        this._data = parse(ls.getItem(this._key)) || {};
    }
    /**
     * Sets key/value pair in the store.
     *
     * @param key The data key name.
     * @param value The data value.
     */
    set(key, value) {
        this._data[key] = value;
        this._persist();
        return false;
    }
    /**
     * Gets data with the given key.
     *
     * When the key is a regexp all data with a key name that match the given
     * regexp will be returned in an object.
     *
     * @param key The data key name.
     */
    get(key) {
        if (key instanceof RegExp) {
            const list = Object.keys(this._data), result = {};
            for (let i = 0; i < list.length; i++) {
                const k = list[i];
                if (key.test(k)) {
                    result[k] = this._data[k];
                }
            }
            return result;
        }
        else {
            return this._data[key];
        }
    }
    /**
     * Removes data with the given key.
     *
     * When the key is a regexp all data with a key name that match the given
     * regexp will be removed.
     *
     * @param key
     */
    remove(key) {
        if (ls) {
            if (key instanceof RegExp) {
                const list = Object.keys(this._data);
                for (let i = 0; i < list.length; i++) {
                    const k = list[i];
                    if (key.test(k)) {
                        delete this._data[k];
                    }
                }
            }
            else {
                delete this._data[key];
            }
            this._persist();
            return true;
        }
        return false;
    }
    /**
     * Clear the data store.
     */
    clear() {
        this._data = {};
        this._persist();
        this.trigger(OWebDataStore.EVT_DATA_STORE_CLEARED);
        return true;
    }
    /**
     * Register data store clear event handler.
     *
     * @param cb
     */
    onClear(cb) {
        return this.on(OWebDataStore.EVT_DATA_STORE_CLEARED, cb);
    }
    /**
     * Helper to make data store persistent.
     *
     * @private
     */
    _persist() {
        if (ls) {
            try {
                ls.setItem(this._key, JSON.stringify(this._data));
                return true;
            }
            catch (e) {
                logger.error(e);
            }
        }
        return false;
    }
}
OWebDataStore.EVT_DATA_STORE_CLEARED = id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkRhdGFTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViRGF0YVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUluQyxNQUFNLEVBQUUsR0FBTSxNQUFNLENBQUMsWUFBWSxFQUM5QixLQUFLLEdBQUcsVUFBVSxJQUFtQjtJQUNwQyxJQUFJLEtBQVUsQ0FBQztJQUVmLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtRQUNsQixJQUFJO1lBQ0gsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7S0FDRDtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRUwsTUFBTSxDQUFDLE9BQU8sT0FBTyxhQUFjLFNBQVEsU0FBUztJQUtuRCxZQUE2QixXQUFvQjtRQUNoRCxLQUFLLEVBQUUsQ0FBQztRQURvQixnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUZ6QyxVQUFLLEdBQXlDLEVBQUUsQ0FBQztRQUl4RCxJQUFJLENBQUMsSUFBSSxHQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxHQUFHLENBQUMsR0FBVyxFQUFFLEtBQXdCO1FBQ3hDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRXhCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVoQixPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsR0FBRyxDQUFDLEdBQW9CO1FBQ3ZCLElBQUksR0FBRyxZQUFZLE1BQU0sRUFBRTtZQUMxQixNQUFNLElBQUksR0FBVSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDeEMsTUFBTSxHQUFRLEVBQUUsQ0FBQztZQUVwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ2hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMxQjthQUNEO1lBRUQsT0FBTyxNQUFNLENBQUM7U0FDZDthQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZCO0lBQ0YsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxNQUFNLENBQUMsR0FBb0I7UUFDMUIsSUFBSSxFQUFFLEVBQUU7WUFDUCxJQUFJLEdBQUcsWUFBWSxNQUFNLEVBQUU7Z0JBQzFCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVyQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDckMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ2hCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDckI7aUJBQ0Q7YUFDRDtpQkFBTTtnQkFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdkI7WUFFRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFaEIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNKLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBRWhCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVoQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRW5ELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsRUFBd0I7UUFDL0IsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLFFBQVE7UUFDZixJQUFJLEVBQUUsRUFBRTtZQUNQLElBQUk7Z0JBQ0gsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2xELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2hCO1NBQ0Q7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7O0FBdkhlLG9DQUFzQixHQUFpQixFQUFFLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcbmltcG9ydCB7aWQsIGxvZ2dlcn0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCB0eXBlIE9KU09OU2VyaWFsaXphYmxlID0gc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IERhdGUgfCB7IFtrZXk6IHN0cmluZ106IE9KU09OU2VyaWFsaXphYmxlIH0gfCBPSlNPTlNlcmlhbGl6YWJsZVtdO1xuXG5jb25zdCBscyAgICA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UsXG5cdCAgcGFyc2UgPSBmdW5jdGlvbiAoZGF0YTogc3RyaW5nIHwgbnVsbCk6IGFueSB7XG5cdFx0ICBsZXQgdmFsdWU6IGFueTtcblxuXHRcdCAgaWYgKGRhdGEgIT09IG51bGwpIHtcblx0XHRcdCAgdHJ5IHtcblx0XHRcdFx0ICB2YWx1ZSA9IEpTT04ucGFyc2UoZGF0YSk7XG5cdFx0XHQgIH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0ICBsb2dnZXIuZXJyb3IoZSk7XG5cdFx0XHQgIH1cblx0XHQgIH1cblxuXHRcdCAgcmV0dXJuIHZhbHVlO1xuXHQgIH07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJEYXRhU3RvcmUgZXh0ZW5kcyBPV2ViRXZlbnQge1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0RBVEFfU1RPUkVfQ0xFQVJFRCAgICAgICAgICAgICAgID0gaWQoKTtcblx0cHJpdmF0ZSByZWFkb25seSBfa2V5OiBzdHJpbmc7XG5cdHByaXZhdGUgX2RhdGE6IHsgW2tleTogc3RyaW5nXTogT0pTT05TZXJpYWxpemFibGUgfSA9IHt9O1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX2FwcENvbnRleHQ6IE9XZWJBcHApIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuX2tleSAgPSBfYXBwQ29udGV4dC5nZXRBcHBOYW1lKCk7XG5cdFx0dGhpcy5fZGF0YSA9IHBhcnNlKGxzLmdldEl0ZW0odGhpcy5fa2V5KSkgfHwge307XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBrZXkvdmFsdWUgcGFpciBpbiB0aGUgc3RvcmUuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGRhdGEga2V5IG5hbWUuXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgZGF0YSB2YWx1ZS5cblx0ICovXG5cdHNldChrZXk6IHN0cmluZywgdmFsdWU6IE9KU09OU2VyaWFsaXphYmxlKTogYm9vbGVhbiB7XG5cdFx0dGhpcy5fZGF0YVtrZXldID0gdmFsdWU7XG5cblx0XHR0aGlzLl9wZXJzaXN0KCk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBkYXRhIHdpdGggdGhlIGdpdmVuIGtleS5cblx0ICpcblx0ICogV2hlbiB0aGUga2V5IGlzIGEgcmVnZXhwIGFsbCBkYXRhIHdpdGggYSBrZXkgbmFtZSB0aGF0IG1hdGNoIHRoZSBnaXZlblxuXHQgKiByZWdleHAgd2lsbCBiZSByZXR1cm5lZCBpbiBhbiBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGRhdGEga2V5IG5hbWUuXG5cdCAqL1xuXHRnZXQoa2V5OiBzdHJpbmcgfCBSZWdFeHApOiBhbnkge1xuXHRcdGlmIChrZXkgaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdGNvbnN0IGxpc3QgICAgICAgID0gT2JqZWN0LmtleXModGhpcy5fZGF0YSksXG5cdFx0XHRcdCAgcmVzdWx0OiBhbnkgPSB7fTtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IGsgPSBsaXN0W2ldO1xuXHRcdFx0XHRpZiAoa2V5LnRlc3QoaykpIHtcblx0XHRcdFx0XHRyZXN1bHRba10gPSB0aGlzLl9kYXRhW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9kYXRhW2tleV07XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgZGF0YSB3aXRoIHRoZSBnaXZlbiBrZXkuXG5cdCAqXG5cdCAqIFdoZW4gdGhlIGtleSBpcyBhIHJlZ2V4cCBhbGwgZGF0YSB3aXRoIGEga2V5IG5hbWUgdGhhdCBtYXRjaCB0aGUgZ2l2ZW5cblx0ICogcmVnZXhwIHdpbGwgYmUgcmVtb3ZlZC5cblx0ICpcblx0ICogQHBhcmFtIGtleVxuXHQgKi9cblx0cmVtb3ZlKGtleTogc3RyaW5nIHwgUmVnRXhwKTogYm9vbGVhbiB7XG5cdFx0aWYgKGxzKSB7XG5cdFx0XHRpZiAoa2V5IGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRcdGNvbnN0IGxpc3QgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhKTtcblxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb25zdCBrID0gbGlzdFtpXTtcblx0XHRcdFx0XHRpZiAoa2V5LnRlc3QoaykpIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLl9kYXRhW2tdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuX2RhdGFba2V5XTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fcGVyc2lzdCgpO1xuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXIgdGhlIGRhdGEgc3RvcmUuXG5cdCAqL1xuXHRjbGVhcigpOiBib29sZWFuIHtcblx0XHR0aGlzLl9kYXRhID0ge307XG5cblx0XHR0aGlzLl9wZXJzaXN0KCk7XG5cblx0XHR0aGlzLnRyaWdnZXIoT1dlYkRhdGFTdG9yZS5FVlRfREFUQV9TVE9SRV9DTEVBUkVEKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGRhdGEgc3RvcmUgY2xlYXIgZXZlbnQgaGFuZGxlci5cblx0ICpcblx0ICogQHBhcmFtIGNiXG5cdCAqL1xuXHRvbkNsZWFyKGNiOiAodGhpczogdGhpcykgPT4gdm9pZCkge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJEYXRhU3RvcmUuRVZUX0RBVEFfU1RPUkVfQ0xFQVJFRCwgY2IpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciB0byBtYWtlIGRhdGEgc3RvcmUgcGVyc2lzdGVudC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX3BlcnNpc3QoKTogYm9vbGVhbiB7XG5cdFx0aWYgKGxzKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRscy5zZXRJdGVtKHRoaXMuX2tleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5fZGF0YSkpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0bG9nZ2VyLmVycm9yKGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuIl19