import OWebEvent from './OWebEvent';
import { id } from './utils/Utils';
const ls = window.localStorage, parse = function (data) {
    let value;
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
    constructor(_appContext) {
        super();
        this._appContext = _appContext;
        this.data = {};
        this.key = _appContext.getAppName();
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
            const list = Object.keys(this.data), result = {};
            for (let i = 0; i < list.length; i++) {
                const k = list[i];
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
                const list = Object.keys(this.data);
                for (let i = 0; i < list.length; i++) {
                    const k = list[i];
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
OWebDataStore.EVT_DATA_STORE_CLEAR = id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkRhdGFTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViRGF0YVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRW5DLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQzdCLEtBQUssR0FBRyxVQUFVLElBQW1CO0lBQ3BDLElBQUksS0FBVSxDQUFDO0lBRWYsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1FBQ2xCLElBQUk7WUFDSCxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtLQUNEO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZCxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxPQUFPLGFBQWMsU0FBUSxTQUFTO0lBS25ELFlBQTZCLFdBQW9CO1FBQ2hELEtBQUssRUFBRSxDQUFDO1FBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBRnpDLFNBQUksR0FBUSxFQUFFLENBQUM7UUFJdEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsSUFBSSxDQUFDLEdBQVcsRUFBRSxLQUFVO1FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRXZCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVoQixPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsSUFBSSxDQUFDLEdBQW9CO1FBQ3hCLElBQUksR0FBRyxZQUFZLE1BQU0sRUFBRTtZQUMxQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDbEMsTUFBTSxHQUFRLEVBQUUsQ0FBQztZQUVsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ2hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjthQUNEO1lBRUQsT0FBTyxNQUFNLENBQUM7U0FDZDthQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RCO0lBQ0YsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxNQUFNLENBQUMsR0FBb0I7UUFDMUIsSUFBSSxFQUFFLEVBQUU7WUFDUCxJQUFJLEdBQUcsWUFBWSxNQUFNLEVBQUU7Z0JBQzFCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDckMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ2hCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDcEI7aUJBQ0Q7YUFDRDtpQkFBTTtnQkFDTixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdEI7WUFFRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFaEIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNKLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWYsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWhCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFFakQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxFQUF3QjtRQUMvQixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssUUFBUTtRQUNmLElBQUksRUFBRSxFQUFFO1lBQ1AsSUFBSTtnQkFDSCxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakI7U0FDRDtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQzs7QUF2SGUsa0NBQW9CLEdBQUcsRUFBRSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcclxuaW1wb3J0IHsgaWQgfSBmcm9tICcuL3V0aWxzL1V0aWxzJztcclxuXHJcbmNvbnN0IGxzID0gd2luZG93LmxvY2FsU3RvcmFnZSxcclxuXHRwYXJzZSA9IGZ1bmN0aW9uIChkYXRhOiBzdHJpbmcgfCBudWxsKTogYW55IHtcclxuXHRcdGxldCB2YWx1ZTogYW55O1xyXG5cclxuXHRcdGlmIChkYXRhICE9PSBudWxsKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0dmFsdWUgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG5cdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB2YWx1ZTtcclxuXHR9O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkRhdGFTdG9yZSBleHRlbmRzIE9XZWJFdmVudCB7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9EQVRBX1NUT1JFX0NMRUFSID0gaWQoKTtcclxuXHRwcml2YXRlIHJlYWRvbmx5IGtleTogc3RyaW5nO1xyXG5cdHByaXZhdGUgZGF0YTogYW55ID0ge307XHJcblxyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX2FwcENvbnRleHQ6IE9XZWJBcHApIHtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmtleSA9IF9hcHBDb250ZXh0LmdldEFwcE5hbWUoKTtcclxuXHRcdHRoaXMuZGF0YSA9IHBhcnNlKGxzLmdldEl0ZW0odGhpcy5rZXkpKSB8fCB7fTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNhdmUgZGF0YSB0byB0aGUgc3RvcmUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ga2V5IFRoZSBkYXRhIGtleSBuYW1lLlxyXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgZGF0YSB2YWx1ZS5cclxuXHQgKi9cclxuXHRzYXZlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogYm9vbGVhbiB7XHJcblx0XHR0aGlzLmRhdGFba2V5XSA9IHZhbHVlO1xyXG5cclxuXHRcdHRoaXMuX3BlcnNpc3QoKTtcclxuXHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBMb2FkIGRhdGEgd2l0aCB0aGUgZ2l2ZW4ga2V5LlxyXG5cdCAqXHJcblx0ICogV2hlbiB0aGUga2V5IGlzIGEgcmVnZXhwIGFsbCBkYXRhIHdpdGggYSBrZXkgbmFtZSB0aGF0IG1hdGNoIHRoZSBnaXZlblxyXG5cdCAqIHJlZ2V4cCB3aWxsIGJlIHJldHVybmVkIGluIGFuIG9iamVjdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGRhdGEga2V5IG5hbWUuXHJcblx0ICovXHJcblx0bG9hZChrZXk6IHN0cmluZyB8IFJlZ0V4cCk6IGFueSB7XHJcblx0XHRpZiAoa2V5IGluc3RhbmNlb2YgUmVnRXhwKSB7XHJcblx0XHRcdGNvbnN0IGxpc3QgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEpLFxyXG5cdFx0XHRcdHJlc3VsdDogYW55ID0ge307XHJcblxyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCBrID0gbGlzdFtpXTtcclxuXHRcdFx0XHRpZiAoa2V5LnRlc3QoaykpIHtcclxuXHRcdFx0XHRcdHJlc3VsdFtrXSA9IHRoaXMuZGF0YVtrXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5kYXRhW2tleV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZW1vdmVzIGRhdGEgd2l0aCB0aGUgZ2l2ZW4ga2V5LlxyXG5cdCAqXHJcblx0ICogV2hlbiB0aGUga2V5IGlzIGEgcmVnZXhwIGFsbCBkYXRhIHdpdGggYSBrZXkgbmFtZSB0aGF0IG1hdGNoIHRoZSBnaXZlblxyXG5cdCAqIHJlZ2V4cCB3aWxsIGJlIHJlbW92ZWQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ga2V5XHJcblx0ICovXHJcblx0cmVtb3ZlKGtleTogc3RyaW5nIHwgUmVnRXhwKTogYm9vbGVhbiB7XHJcblx0XHRpZiAobHMpIHtcclxuXHRcdFx0aWYgKGtleSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG5cdFx0XHRcdGNvbnN0IGxpc3QgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEpO1xyXG5cclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGNvbnN0IGsgPSBsaXN0W2ldO1xyXG5cdFx0XHRcdFx0aWYgKGtleS50ZXN0KGspKSB7XHJcblx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLmRhdGFba107XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGRlbGV0ZSB0aGlzLmRhdGFba2V5XTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5fcGVyc2lzdCgpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2xlYXIgdGhlIGRhdGEgc3RvcmUuXHJcblx0ICovXHJcblx0Y2xlYXIoKTogYm9vbGVhbiB7XHJcblx0XHR0aGlzLmRhdGEgPSB7fTtcclxuXHJcblx0XHR0aGlzLl9wZXJzaXN0KCk7XHJcblxyXG5cdFx0dGhpcy50cmlnZ2VyKE9XZWJEYXRhU3RvcmUuRVZUX0RBVEFfU1RPUkVfQ0xFQVIpO1xyXG5cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVnaXN0ZXIgZGF0YSBzdG9yZSBjbGVhciBldmVudCBoYW5kbGVyLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNiXHJcblx0ICovXHJcblx0b25DbGVhcihjYjogKHRoaXM6IHRoaXMpID0+IHZvaWQpIHtcclxuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJEYXRhU3RvcmUuRVZUX0RBVEFfU1RPUkVfQ0xFQVIsIGNiKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhlbHBlciB0byBtYWtlIGRhdGEgc3RvcmUgcGVyc2lzdGVudC5cclxuXHQgKlxyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfcGVyc2lzdCgpOiBib29sZWFuIHtcclxuXHRcdGlmIChscykge1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGxzLnNldEl0ZW0odGhpcy5rZXksIEpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YSkpO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn1cclxuIl19