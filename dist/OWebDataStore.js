import OWebEvent from './OWebEvent';
import Utils from './utils/Utils';
const ls = window.localStorage, parse = function (data) {
    let value = undefined;
    if (data !== null) {
        try {
            value = JSON.parse(data);
        }
        catch (e) {
            console.error(e);
        }
    }
    return value;
};
export default class OWebDataStore extends OWebEvent {
    constructor(_app_context) {
        super();
        this._app_context = _app_context;
        this.data = {};
        this.key = _app_context.getAppName();
        this.data = parse(ls.getItem(this.key)) || {};
    }
    /**
     * Save data to the store.
     *
     * @param key The data key name.
     * @param value The data value.
     */
    save(key, value) {
        this.data[key] = value;
        this._persist();
        return false;
    }
    /**
     * Load data with the given key.
     *
     * When the key is a regexp all data with a key name that match the given
     * regexp will be returned in an object.
     *
     * @param key The data key name.
     */
    load(key) {
        if (key instanceof RegExp) {
            let list = Object.keys(this.data), result = {};
            for (let i = 0; i < list.length; i++) {
                let k = list[i];
                if (key.test(k)) {
                    result[k] = this.data[k];
                }
            }
            return result;
        }
        else {
            return this.data[key];
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
                let list = Object.keys(this.data);
                for (let i = 0; i < list.length; i++) {
                    let k = list[i];
                    if (key.test(k)) {
                        delete this.data[k];
                    }
                }
            }
            else {
                delete this.data[key];
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
        this.data = {};
        this._persist();
        this.trigger(OWebDataStore.EVT_DATA_STORE_CLEAR);
        return true;
    }
    /**
     * Register data store clear event handler.
     *
     * @param cb
     */
    onClear(cb) {
        return this.on(OWebDataStore.EVT_DATA_STORE_CLEAR, cb);
    }
    /**
     * Helper to make data store persistent.
     *
     * @private
     */
    _persist() {
        if (ls) {
            try {
                ls.setItem(this.key, JSON.stringify(this.data));
                return true;
            }
            catch (e) {
                console.error(e);
            }
        }
        return false;
    }
}
OWebDataStore.EVT_DATA_STORE_CLEAR = Utils.id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkRhdGFTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViRGF0YVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFFbEMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFDN0IsS0FBSyxHQUFHLFVBQVMsSUFBbUI7SUFDbkMsSUFBSSxLQUFLLEdBQVEsU0FBUyxDQUFDO0lBRTNCLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtRQUNsQixJQUFJO1lBQ0gsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7S0FDRDtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLE9BQU8sT0FBTyxhQUFjLFNBQVEsU0FBUztJQUtuRCxZQUE2QixZQUFxQjtRQUNqRCxLQUFLLEVBQUUsQ0FBQztRQURvQixpQkFBWSxHQUFaLFlBQVksQ0FBUztRQUYxQyxTQUFJLEdBQVEsRUFBRSxDQUFDO1FBSXRCLElBQUksQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILElBQUksQ0FBQyxHQUFXLEVBQUUsS0FBVTtRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUV2QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFaEIsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILElBQUksQ0FBQyxHQUFvQjtRQUN4QixJQUFJLEdBQUcsWUFBWSxNQUFNLEVBQUU7WUFDMUIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ2hDLE1BQU0sR0FBUSxFQUFFLENBQUM7WUFFbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekI7YUFDRDtZQUVELE9BQU8sTUFBTSxDQUFDO1NBQ2Q7YUFBTTtZQUNOLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN0QjtJQUNGLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsTUFBTSxDQUFDLEdBQW9CO1FBQzFCLElBQUksRUFBRSxFQUFFO1lBQ1AsSUFBSSxHQUFHLFlBQVksTUFBTSxFQUFFO2dCQUMxQixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFbEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDaEIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUNoQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3BCO2lCQUNEO2FBQ0Q7aUJBQU07Z0JBQ04sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3RCO1lBRUQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWhCLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUs7UUFDSixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVmLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVoQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBRWpELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsRUFBd0I7UUFDL0IsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLFFBQVE7UUFDZixJQUFJLEVBQUUsRUFBRTtZQUNQLElBQUk7Z0JBQ0gsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO1NBQ0Q7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7O0FBdkhlLGtDQUFvQixHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XHJcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscy9VdGlscyc7XHJcblxyXG5jb25zdCBscyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UsXHJcblx0cGFyc2UgPSBmdW5jdGlvbihkYXRhOiBzdHJpbmcgfCBudWxsKTogYW55IHtcclxuXHRcdGxldCB2YWx1ZTogYW55ID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdGlmIChkYXRhICE9PSBudWxsKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0dmFsdWUgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG5cdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkRhdGFTdG9yZSBleHRlbmRzIE9XZWJFdmVudCB7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9EQVRBX1NUT1JFX0NMRUFSID0gVXRpbHMuaWQoKTtcclxuXHRwcml2YXRlIHJlYWRvbmx5IGtleTogc3RyaW5nO1xyXG5cdHByaXZhdGUgZGF0YTogYW55ID0ge307XHJcblxyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX2FwcF9jb250ZXh0OiBPV2ViQXBwKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5rZXkgPSBfYXBwX2NvbnRleHQuZ2V0QXBwTmFtZSgpO1xyXG5cdFx0dGhpcy5kYXRhID0gcGFyc2UobHMuZ2V0SXRlbSh0aGlzLmtleSkpIHx8IHt9O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2F2ZSBkYXRhIHRvIHRoZSBzdG9yZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGRhdGEga2V5IG5hbWUuXHJcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBkYXRhIHZhbHVlLlxyXG5cdCAqL1xyXG5cdHNhdmUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcclxuXHRcdHRoaXMuZGF0YVtrZXldID0gdmFsdWU7XHJcblxyXG5cdFx0dGhpcy5fcGVyc2lzdCgpO1xyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWQgZGF0YSB3aXRoIHRoZSBnaXZlbiBrZXkuXHJcblx0ICpcclxuXHQgKiBXaGVuIHRoZSBrZXkgaXMgYSByZWdleHAgYWxsIGRhdGEgd2l0aCBhIGtleSBuYW1lIHRoYXQgbWF0Y2ggdGhlIGdpdmVuXHJcblx0ICogcmVnZXhwIHdpbGwgYmUgcmV0dXJuZWQgaW4gYW4gb2JqZWN0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGtleSBUaGUgZGF0YSBrZXkgbmFtZS5cclxuXHQgKi9cclxuXHRsb2FkKGtleTogc3RyaW5nIHwgUmVnRXhwKTogYW55IHtcclxuXHRcdGlmIChrZXkgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuXHRcdFx0bGV0IGxpc3QgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEpLFxyXG5cdFx0XHRcdHJlc3VsdDogYW55ID0ge307XHJcblxyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRsZXQgayA9IGxpc3RbaV07XHJcblx0XHRcdFx0aWYgKGtleS50ZXN0KGspKSB7XHJcblx0XHRcdFx0XHRyZXN1bHRba10gPSB0aGlzLmRhdGFba107XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZGF0YVtrZXldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBkYXRhIHdpdGggdGhlIGdpdmVuIGtleS5cclxuXHQgKlxyXG5cdCAqIFdoZW4gdGhlIGtleSBpcyBhIHJlZ2V4cCBhbGwgZGF0YSB3aXRoIGEga2V5IG5hbWUgdGhhdCBtYXRjaCB0aGUgZ2l2ZW5cclxuXHQgKiByZWdleHAgd2lsbCBiZSByZW1vdmVkLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGtleVxyXG5cdCAqL1xyXG5cdHJlbW92ZShrZXk6IHN0cmluZyB8IFJlZ0V4cCk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKGxzKSB7XHJcblx0XHRcdGlmIChrZXkgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuXHRcdFx0XHRsZXQgbGlzdCA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YSk7XHJcblxyXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0bGV0IGsgPSBsaXN0W2ldO1xyXG5cdFx0XHRcdFx0aWYgKGtleS50ZXN0KGspKSB7XHJcblx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLmRhdGFba107XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGRlbGV0ZSB0aGlzLmRhdGFba2V5XTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fcGVyc2lzdCgpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2xlYXIgdGhlIGRhdGEgc3RvcmUuXHJcblx0ICovXHJcblx0Y2xlYXIoKTogYm9vbGVhbiB7XHJcblx0XHR0aGlzLmRhdGEgPSB7fTtcclxuXHJcblx0XHR0aGlzLl9wZXJzaXN0KCk7XHJcblxyXG5cdFx0dGhpcy50cmlnZ2VyKE9XZWJEYXRhU3RvcmUuRVZUX0RBVEFfU1RPUkVfQ0xFQVIpO1xyXG5cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVnaXN0ZXIgZGF0YSBzdG9yZSBjbGVhciBldmVudCBoYW5kbGVyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNiXHJcblx0ICovXHJcblx0b25DbGVhcihjYjogKHRoaXM6IHRoaXMpID0+IHZvaWQpIHtcclxuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJEYXRhU3RvcmUuRVZUX0RBVEFfU1RPUkVfQ0xFQVIsIGNiKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhlbHBlciB0byBtYWtlIGRhdGEgc3RvcmUgcGVyc2lzdGVudC5cclxuXHQgKlxyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfcGVyc2lzdCgpOiBib29sZWFuIHtcclxuXHRcdGlmIChscykge1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGxzLnNldEl0ZW0odGhpcy5rZXksIEpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YSkpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn1cclxuIl19