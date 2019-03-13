import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";
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
     * Remove data with the given key.
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
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkRhdGFTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViRGF0YVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFFbEMsTUFBTSxFQUFFLEdBQU0sTUFBTSxDQUFDLFlBQVksRUFDOUIsS0FBSyxHQUFHLFVBQVUsSUFBbUI7SUFDcEMsSUFBSSxLQUFLLEdBQVEsU0FBUyxDQUFDO0lBRTNCLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtRQUNsQixJQUFJO1lBQ0gsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7S0FDRDtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRUwsTUFBTSxDQUFDLE9BQU8sb0JBQXFCLFNBQVEsU0FBUztJQUtuRCxZQUE2QixZQUFxQjtRQUNqRCxLQUFLLEVBQUUsQ0FBQztRQURvQixpQkFBWSxHQUFaLFlBQVksQ0FBUztRQUYxQyxTQUFJLEdBQTJCLEVBQUUsQ0FBQztRQUl6QyxJQUFJLENBQUMsR0FBRyxHQUFJLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxJQUFJLENBQUMsR0FBVyxFQUFFLEtBQVU7UUFFM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFdkIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWhCLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxJQUFJLENBQUMsR0FBb0I7UUFDeEIsSUFBSSxHQUFHLFlBQVksTUFBTSxFQUFFO1lBQzFCLElBQUksSUFBSSxHQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUN2QyxNQUFNLEdBQVEsRUFBRSxDQUFDO1lBRWxCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNyQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDaEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3pCO2FBQ0Q7WUFFRCxPQUFPLE1BQU0sQ0FBQztTQUNkO2FBQU07WUFDTixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEI7SUFDRixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQyxHQUFvQjtRQUMxQixJQUFJLEVBQUUsRUFBRTtZQUNQLElBQUksR0FBRyxZQUFZLE1BQU0sRUFBRTtnQkFDMUIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRWxDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNyQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDaEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNwQjtpQkFDRDthQUNEO2lCQUFNO2dCQUNOLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN0QjtZQUVELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVoQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLO1FBQ0osSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFFZixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUVqRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLEVBQWM7UUFDckIsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLFFBQVE7UUFFZixJQUFJLEVBQUUsRUFBRTtZQUNQLElBQUk7Z0JBQ0gsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO1NBQ0Q7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7O0FBekhlLGtDQUFvQixHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQTBIbEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gXCIuL09XZWJBcHBcIjtcclxuaW1wb3J0IE9XZWJFdmVudCBmcm9tIFwiLi9PV2ViRXZlbnRcIjtcclxuaW1wb3J0IFV0aWxzIGZyb20gXCIuL3V0aWxzL1V0aWxzXCI7XHJcblxyXG5jb25zdCBscyAgICA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UsXHJcblx0ICBwYXJzZSA9IGZ1bmN0aW9uIChkYXRhOiBzdHJpbmcgfCBudWxsKTogYW55IHtcclxuXHRcdCAgbGV0IHZhbHVlOiBhbnkgPSB1bmRlZmluZWQ7XHJcblxyXG5cdFx0ICBpZiAoZGF0YSAhPT0gbnVsbCkge1xyXG5cdFx0XHQgIHRyeSB7XHJcblx0XHRcdFx0ICB2YWx1ZSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcblx0XHRcdCAgfSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdCAgY29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0ICB9XHJcblx0XHQgIH1cclxuXHJcblx0XHQgIHJldHVybiB2YWx1ZTtcclxuXHQgIH07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRGF0YVN0b3JlIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0RBVEFfU1RPUkVfQ0xFQVIgPSBVdGlscy5pZCgpO1xyXG5cdHByaXZhdGUgcmVhZG9ubHkga2V5OiBzdHJpbmc7XHJcblx0cHJpdmF0ZSBkYXRhOiBhbnkgICAgICAgICAgICAgICAgICAgID0ge307XHJcblxyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX2FwcF9jb250ZXh0OiBPV2ViQXBwKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5rZXkgID0gX2FwcF9jb250ZXh0LmdldEFwcE5hbWUoKTtcclxuXHRcdHRoaXMuZGF0YSA9IHBhcnNlKGxzLmdldEl0ZW0odGhpcy5rZXkpKSB8fCB7fTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNhdmUgZGF0YSB0byB0aGUgc3RvcmUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ga2V5IFRoZSBkYXRhIGtleSBuYW1lLlxyXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgZGF0YSB2YWx1ZS5cclxuXHQgKi9cclxuXHRzYXZlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogYm9vbGVhbiB7XHJcblxyXG5cdFx0dGhpcy5kYXRhW2tleV0gPSB2YWx1ZTtcclxuXHJcblx0XHR0aGlzLl9wZXJzaXN0KCk7XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTG9hZCBkYXRhIHdpdGggdGhlIGdpdmVuIGtleS5cclxuXHQgKlxyXG5cdCAqIFdoZW4gdGhlIGtleSBpcyBhIHJlZ2V4cCBhbGwgZGF0YSB3aXRoIGEga2V5IG5hbWUgdGhhdCBtYXRjaCB0aGUgZ2l2ZW5cclxuXHQgKiByZWdleHAgd2lsbCBiZSByZXR1cm5lZCBpbiBhbiBvYmplY3QuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ga2V5IFRoZSBkYXRhIGtleSBuYW1lLlxyXG5cdCAqL1xyXG5cdGxvYWQoa2V5OiBzdHJpbmcgfCBSZWdFeHApOiBhbnkge1xyXG5cdFx0aWYgKGtleSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG5cdFx0XHRsZXQgbGlzdCAgICAgICAgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEpLFxyXG5cdFx0XHRcdHJlc3VsdDogYW55ID0ge307XHJcblxyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRsZXQgayA9IGxpc3RbaV07XHJcblx0XHRcdFx0aWYgKGtleS50ZXN0KGspKSB7XHJcblx0XHRcdFx0XHRyZXN1bHRba10gPSB0aGlzLmRhdGFba107XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZGF0YVtrZXldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlIGRhdGEgd2l0aCB0aGUgZ2l2ZW4ga2V5LlxyXG5cdCAqXHJcblx0ICogV2hlbiB0aGUga2V5IGlzIGEgcmVnZXhwIGFsbCBkYXRhIHdpdGggYSBrZXkgbmFtZSB0aGF0IG1hdGNoIHRoZSBnaXZlblxyXG5cdCAqIHJlZ2V4cCB3aWxsIGJlIHJlbW92ZWQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ga2V5XHJcblx0ICovXHJcblx0cmVtb3ZlKGtleTogc3RyaW5nIHwgUmVnRXhwKTogYm9vbGVhbiB7XHJcblx0XHRpZiAobHMpIHtcclxuXHRcdFx0aWYgKGtleSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG5cdFx0XHRcdGxldCBsaXN0ID0gT2JqZWN0LmtleXModGhpcy5kYXRhKTtcclxuXHJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRsZXQgayA9IGxpc3RbaV07XHJcblx0XHRcdFx0XHRpZiAoa2V5LnRlc3QoaykpIHtcclxuXHRcdFx0XHRcdFx0ZGVsZXRlIHRoaXMuZGF0YVtrXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZGVsZXRlIHRoaXMuZGF0YVtrZXldO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9wZXJzaXN0KCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDbGVhciB0aGUgZGF0YSBzdG9yZS5cclxuXHQgKi9cclxuXHRjbGVhcigpOiBib29sZWFuIHtcclxuXHRcdHRoaXMuZGF0YSA9IHt9O1xyXG5cclxuXHRcdHRoaXMuX3BlcnNpc3QoKTtcclxuXHJcblx0XHR0aGlzLnRyaWdnZXIoT1dlYkRhdGFTdG9yZS5FVlRfREFUQV9TVE9SRV9DTEVBUik7XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZWdpc3RlciBkYXRhIHN0b3JlIGNsZWFyIGV2ZW50IGhhbmRsZXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY2JcclxuXHQgKi9cclxuXHRvbkNsZWFyKGNiOiAoKSA9PiB2b2lkKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViRGF0YVN0b3JlLkVWVF9EQVRBX1NUT1JFX0NMRUFSLCBjYik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIZWxwZXIgdG8gbWFrZSBkYXRhIHN0b3JlIHBlcnNpc3RlbnQuXHJcblx0ICpcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3BlcnNpc3QoKTogYm9vbGVhbiB7XHJcblxyXG5cdFx0aWYgKGxzKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0bHMuc2V0SXRlbSh0aGlzLmtleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhKSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxufTsiXX0=