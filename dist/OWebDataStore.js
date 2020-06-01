import OWebEvent from './OWebEvent';
import { id, _error } from './utils/Utils';
const ls = window.localStorage, parse = function (data) {
    let value;
    if (data !== null) {
        try {
            value = JSON.parse(data);
        }
        catch (e) {
            _error(e);
        }
    }
    return value;
};
let OWebDataStore = /** @class */ (() => {
    class OWebDataStore extends OWebEvent {
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
                    _error(e);
                }
            }
            return false;
        }
    }
    OWebDataStore.EVT_DATA_STORE_CLEAR = id();
    return OWebDataStore;
})();
export default OWebDataStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkRhdGFTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViRGF0YVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUM3QixLQUFLLEdBQUcsVUFBVSxJQUFtQjtJQUNwQyxJQUFJLEtBQVUsQ0FBQztJQUVmLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtRQUNsQixJQUFJO1lBQ0gsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNWO0tBQ0Q7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNkLENBQUMsQ0FBQztBQUVIO0lBQUEsTUFBcUIsYUFBYyxTQUFRLFNBQVM7UUFLbkQsWUFBNkIsV0FBb0I7WUFDaEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsZ0JBQVcsR0FBWCxXQUFXLENBQVM7WUFGekMsU0FBSSxHQUFRLEVBQUUsQ0FBQztZQUl0QixJQUFJLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQyxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCxJQUFJLENBQUMsR0FBVyxFQUFFLEtBQVU7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFFdkIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWhCLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVEOzs7Ozs7O1dBT0c7UUFDSCxJQUFJLENBQUMsR0FBb0I7WUFDeEIsSUFBSSxHQUFHLFlBQVksTUFBTSxFQUFFO2dCQUMxQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDbEMsTUFBTSxHQUFRLEVBQUUsQ0FBQztnQkFFbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3JDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDekI7aUJBQ0Q7Z0JBRUQsT0FBTyxNQUFNLENBQUM7YUFDZDtpQkFBTTtnQkFDTixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdEI7UUFDRixDQUFDO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILE1BQU0sQ0FBQyxHQUFvQjtZQUMxQixJQUFJLEVBQUUsRUFBRTtnQkFDUCxJQUFJLEdBQUcsWUFBWSxNQUFNLEVBQUU7b0JBQzFCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDckMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNsQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7NEJBQ2hCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDcEI7cUJBQ0Q7aUJBQ0Q7cUJBQU07b0JBQ04sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN0QjtnQkFFRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBRWhCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFRDs7V0FFRztRQUNILEtBQUs7WUFDSixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVmLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVoQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRWpELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxPQUFPLENBQUMsRUFBd0I7WUFDL0IsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNLLFFBQVE7WUFDZixJQUFJLEVBQUUsRUFBRTtnQkFDUCxJQUFJO29CQUNILEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNoRCxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDWCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ1Y7YUFDRDtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQzs7SUF2SGUsa0NBQW9CLEdBQUcsRUFBRSxFQUFFLENBQUM7SUF3SDdDLG9CQUFDO0tBQUE7ZUF6SG9CLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcclxuaW1wb3J0IHsgaWQsIF9lcnJvciB9IGZyb20gJy4vdXRpbHMvVXRpbHMnO1xyXG5cclxuY29uc3QgbHMgPSB3aW5kb3cubG9jYWxTdG9yYWdlLFxyXG5cdHBhcnNlID0gZnVuY3Rpb24gKGRhdGE6IHN0cmluZyB8IG51bGwpOiBhbnkge1xyXG5cdFx0bGV0IHZhbHVlOiBhbnk7XHJcblxyXG5cdFx0aWYgKGRhdGEgIT09IG51bGwpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHR2YWx1ZSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcblx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRfZXJyb3IoZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdmFsdWU7XHJcblx0fTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJEYXRhU3RvcmUgZXh0ZW5kcyBPV2ViRXZlbnQge1xyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfREFUQV9TVE9SRV9DTEVBUiA9IGlkKCk7XHJcblx0cHJpdmF0ZSByZWFkb25seSBrZXk6IHN0cmluZztcclxuXHRwcml2YXRlIGRhdGE6IGFueSA9IHt9O1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9hcHBDb250ZXh0OiBPV2ViQXBwKSB7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5rZXkgPSBfYXBwQ29udGV4dC5nZXRBcHBOYW1lKCk7XHJcblx0XHR0aGlzLmRhdGEgPSBwYXJzZShscy5nZXRJdGVtKHRoaXMua2V5KSkgfHwge307XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTYXZlIGRhdGEgdG8gdGhlIHN0b3JlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGtleSBUaGUgZGF0YSBrZXkgbmFtZS5cclxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIGRhdGEgdmFsdWUuXHJcblx0ICovXHJcblx0c2F2ZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IGJvb2xlYW4ge1xyXG5cdFx0dGhpcy5kYXRhW2tleV0gPSB2YWx1ZTtcclxuXHJcblx0XHR0aGlzLl9wZXJzaXN0KCk7XHJcblxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTG9hZCBkYXRhIHdpdGggdGhlIGdpdmVuIGtleS5cclxuXHQgKlxyXG5cdCAqIFdoZW4gdGhlIGtleSBpcyBhIHJlZ2V4cCBhbGwgZGF0YSB3aXRoIGEga2V5IG5hbWUgdGhhdCBtYXRjaCB0aGUgZ2l2ZW5cclxuXHQgKiByZWdleHAgd2lsbCBiZSByZXR1cm5lZCBpbiBhbiBvYmplY3QuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ga2V5IFRoZSBkYXRhIGtleSBuYW1lLlxyXG5cdCAqL1xyXG5cdGxvYWQoa2V5OiBzdHJpbmcgfCBSZWdFeHApOiBhbnkge1xyXG5cdFx0aWYgKGtleSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG5cdFx0XHRjb25zdCBsaXN0ID0gT2JqZWN0LmtleXModGhpcy5kYXRhKSxcclxuXHRcdFx0XHRyZXN1bHQ6IGFueSA9IHt9O1xyXG5cclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Y29uc3QgayA9IGxpc3RbaV07XHJcblx0XHRcdFx0aWYgKGtleS50ZXN0KGspKSB7XHJcblx0XHRcdFx0XHRyZXN1bHRba10gPSB0aGlzLmRhdGFba107XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZGF0YVtrZXldO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBkYXRhIHdpdGggdGhlIGdpdmVuIGtleS5cclxuXHQgKlxyXG5cdCAqIFdoZW4gdGhlIGtleSBpcyBhIHJlZ2V4cCBhbGwgZGF0YSB3aXRoIGEga2V5IG5hbWUgdGhhdCBtYXRjaCB0aGUgZ2l2ZW5cclxuXHQgKiByZWdleHAgd2lsbCBiZSByZW1vdmVkLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGtleVxyXG5cdCAqL1xyXG5cdHJlbW92ZShrZXk6IHN0cmluZyB8IFJlZ0V4cCk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKGxzKSB7XHJcblx0XHRcdGlmIChrZXkgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuXHRcdFx0XHRjb25zdCBsaXN0ID0gT2JqZWN0LmtleXModGhpcy5kYXRhKTtcclxuXHJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRjb25zdCBrID0gbGlzdFtpXTtcclxuXHRcdFx0XHRcdGlmIChrZXkudGVzdChrKSkge1xyXG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpcy5kYXRhW2tdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRkZWxldGUgdGhpcy5kYXRhW2tleV07XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuX3BlcnNpc3QoKTtcclxuXHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENsZWFyIHRoZSBkYXRhIHN0b3JlLlxyXG5cdCAqL1xyXG5cdGNsZWFyKCk6IGJvb2xlYW4ge1xyXG5cdFx0dGhpcy5kYXRhID0ge307XHJcblxyXG5cdFx0dGhpcy5fcGVyc2lzdCgpO1xyXG5cclxuXHRcdHRoaXMudHJpZ2dlcihPV2ViRGF0YVN0b3JlLkVWVF9EQVRBX1NUT1JFX0NMRUFSKTtcclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlZ2lzdGVyIGRhdGEgc3RvcmUgY2xlYXIgZXZlbnQgaGFuZGxlci5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjYlxyXG5cdCAqL1xyXG5cdG9uQ2xlYXIoY2I6ICh0aGlzOiB0aGlzKSA9PiB2b2lkKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViRGF0YVN0b3JlLkVWVF9EQVRBX1NUT1JFX0NMRUFSLCBjYik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIZWxwZXIgdG8gbWFrZSBkYXRhIHN0b3JlIHBlcnNpc3RlbnQuXHJcblx0ICpcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3BlcnNpc3QoKTogYm9vbGVhbiB7XHJcblx0XHRpZiAobHMpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRscy5zZXRJdGVtKHRoaXMua2V5LCBKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEpKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdF9lcnJvcihlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcbn1cclxuIl19