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
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkRhdGFTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViRGF0YVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFFbEMsTUFBTSxFQUFFLEdBQU0sTUFBTSxDQUFDLFlBQVksRUFDOUIsS0FBSyxHQUFHLFVBQVUsSUFBbUI7SUFDcEMsSUFBSSxLQUFLLEdBQVEsU0FBUyxDQUFDO0lBRTNCLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtRQUNsQixJQUFJO1lBQ0gsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7S0FDRDtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRUwsTUFBTSxDQUFDLE9BQU8sb0JBQXFCLFNBQVEsU0FBUztJQUtuRCxZQUE2QixZQUFxQjtRQUNqRCxLQUFLLEVBQUUsQ0FBQztRQURvQixpQkFBWSxHQUFaLFlBQVksQ0FBUztRQUYxQyxTQUFJLEdBQTJCLEVBQUUsQ0FBQztRQUl6QyxJQUFJLENBQUMsR0FBRyxHQUFJLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxJQUFJLENBQUMsR0FBVyxFQUFFLEtBQVU7UUFFM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFdkIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWhCLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxJQUFJLENBQUMsR0FBb0I7UUFDeEIsSUFBSSxHQUFHLFlBQVksTUFBTSxFQUFFO1lBQzFCLElBQUksSUFBSSxHQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUN2QyxNQUFNLEdBQVEsRUFBRSxDQUFDO1lBRWxCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNyQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDaEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3pCO2FBQ0Q7WUFFRCxPQUFPLE1BQU0sQ0FBQztTQUNkO2FBQU07WUFDTixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEI7SUFDRixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQyxHQUFvQjtRQUMxQixJQUFJLEVBQUUsRUFBRTtZQUNQLElBQUksR0FBRyxZQUFZLE1BQU0sRUFBRTtnQkFDMUIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRWxDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNyQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDaEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNwQjtpQkFDRDthQUNEO2lCQUFNO2dCQUNOLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN0QjtZQUVELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVoQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLO1FBQ0osSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFFZixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUVqRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLEVBQXdCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyxRQUFRO1FBRWYsSUFBSSxFQUFFLEVBQUU7WUFDUCxJQUFJO2dCQUNILEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxPQUFPLElBQUksQ0FBQzthQUNaO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqQjtTQUNEO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDOztBQXpIZSxrQ0FBb0IsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUEwSGxELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tIFwiLi9PV2ViQXBwXCI7XHJcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSBcIi4vT1dlYkV2ZW50XCI7XHJcbmltcG9ydCBVdGlscyBmcm9tIFwiLi91dGlscy9VdGlsc1wiO1xyXG5cclxuY29uc3QgbHMgICAgPSB3aW5kb3cubG9jYWxTdG9yYWdlLFxyXG5cdCAgcGFyc2UgPSBmdW5jdGlvbiAoZGF0YTogc3RyaW5nIHwgbnVsbCk6IGFueSB7XHJcblx0XHQgIGxldCB2YWx1ZTogYW55ID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdCAgaWYgKGRhdGEgIT09IG51bGwpIHtcclxuXHRcdFx0ICB0cnkge1xyXG5cdFx0XHRcdCAgdmFsdWUgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG5cdFx0XHQgIH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHQgIGNvbnNvbGUuZXJyb3IoZSk7XHJcblx0XHRcdCAgfVxyXG5cdFx0ICB9XHJcblxyXG5cdFx0ICByZXR1cm4gdmFsdWU7XHJcblx0ICB9O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkRhdGFTdG9yZSBleHRlbmRzIE9XZWJFdmVudCB7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9EQVRBX1NUT1JFX0NMRUFSID0gVXRpbHMuaWQoKTtcclxuXHRwcml2YXRlIHJlYWRvbmx5IGtleTogc3RyaW5nO1xyXG5cdHByaXZhdGUgZGF0YTogYW55ICAgICAgICAgICAgICAgICAgICA9IHt9O1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9hcHBfY29udGV4dDogT1dlYkFwcCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMua2V5ICA9IF9hcHBfY29udGV4dC5nZXRBcHBOYW1lKCk7XHJcblx0XHR0aGlzLmRhdGEgPSBwYXJzZShscy5nZXRJdGVtKHRoaXMua2V5KSkgfHwge307XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTYXZlIGRhdGEgdG8gdGhlIHN0b3JlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGtleSBUaGUgZGF0YSBrZXkgbmFtZS5cclxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIGRhdGEgdmFsdWUuXHJcblx0ICovXHJcblx0c2F2ZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IGJvb2xlYW4ge1xyXG5cclxuXHRcdHRoaXMuZGF0YVtrZXldID0gdmFsdWU7XHJcblxyXG5cdFx0dGhpcy5fcGVyc2lzdCgpO1xyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWQgZGF0YSB3aXRoIHRoZSBnaXZlbiBrZXkuXHJcblx0ICpcclxuXHQgKiBXaGVuIHRoZSBrZXkgaXMgYSByZWdleHAgYWxsIGRhdGEgd2l0aCBhIGtleSBuYW1lIHRoYXQgbWF0Y2ggdGhlIGdpdmVuXHJcblx0ICogcmVnZXhwIHdpbGwgYmUgcmV0dXJuZWQgaW4gYW4gb2JqZWN0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGtleSBUaGUgZGF0YSBrZXkgbmFtZS5cclxuXHQgKi9cclxuXHRsb2FkKGtleTogc3RyaW5nIHwgUmVnRXhwKTogYW55IHtcclxuXHRcdGlmIChrZXkgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuXHRcdFx0bGV0IGxpc3QgICAgICAgID0gT2JqZWN0LmtleXModGhpcy5kYXRhKSxcclxuXHRcdFx0XHRyZXN1bHQ6IGFueSA9IHt9O1xyXG5cclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0bGV0IGsgPSBsaXN0W2ldO1xyXG5cdFx0XHRcdGlmIChrZXkudGVzdChrKSkge1xyXG5cdFx0XHRcdFx0cmVzdWx0W2tdID0gdGhpcy5kYXRhW2tdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmRhdGFba2V5XTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgZGF0YSB3aXRoIHRoZSBnaXZlbiBrZXkuXHJcblx0ICpcclxuXHQgKiBXaGVuIHRoZSBrZXkgaXMgYSByZWdleHAgYWxsIGRhdGEgd2l0aCBhIGtleSBuYW1lIHRoYXQgbWF0Y2ggdGhlIGdpdmVuXHJcblx0ICogcmVnZXhwIHdpbGwgYmUgcmVtb3ZlZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBrZXlcclxuXHQgKi9cclxuXHRyZW1vdmUoa2V5OiBzdHJpbmcgfCBSZWdFeHApOiBib29sZWFuIHtcclxuXHRcdGlmIChscykge1xyXG5cdFx0XHRpZiAoa2V5IGluc3RhbmNlb2YgUmVnRXhwKSB7XHJcblx0XHRcdFx0bGV0IGxpc3QgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEpO1xyXG5cclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGxldCBrID0gbGlzdFtpXTtcclxuXHRcdFx0XHRcdGlmIChrZXkudGVzdChrKSkge1xyXG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpcy5kYXRhW2tdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRkZWxldGUgdGhpcy5kYXRhW2tleV07XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX3BlcnNpc3QoKTtcclxuXHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENsZWFyIHRoZSBkYXRhIHN0b3JlLlxyXG5cdCAqL1xyXG5cdGNsZWFyKCk6IGJvb2xlYW4ge1xyXG5cdFx0dGhpcy5kYXRhID0ge307XHJcblxyXG5cdFx0dGhpcy5fcGVyc2lzdCgpO1xyXG5cclxuXHRcdHRoaXMudHJpZ2dlcihPV2ViRGF0YVN0b3JlLkVWVF9EQVRBX1NUT1JFX0NMRUFSKTtcclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlZ2lzdGVyIGRhdGEgc3RvcmUgY2xlYXIgZXZlbnQgaGFuZGxlci5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjYlxyXG5cdCAqL1xyXG5cdG9uQ2xlYXIoY2I6ICh0aGlzOiB0aGlzKSA9PiB2b2lkKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViRGF0YVN0b3JlLkVWVF9EQVRBX1NUT1JFX0NMRUFSLCBjYik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIZWxwZXIgdG8gbWFrZSBkYXRhIHN0b3JlIHBlcnNpc3RlbnQuXHJcblx0ICpcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3BlcnNpc3QoKTogYm9vbGVhbiB7XHJcblxyXG5cdFx0aWYgKGxzKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0bHMuc2V0SXRlbSh0aGlzLmtleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhKSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxufTsiXX0=