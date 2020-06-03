import OWebEvent from './OWebEvent';
import { id, logger } from './utils/Utils';
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
                    logger.error(e);
                }
            }
            return false;
        }
    }
    OWebDataStore.EVT_DATA_STORE_CLEAR = id();
    return OWebDataStore;
})();
export default OWebDataStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkRhdGFTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViRGF0YVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUM3QixLQUFLLEdBQUcsVUFBVSxJQUFtQjtJQUNwQyxJQUFJLEtBQVUsQ0FBQztJQUVmLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtRQUNsQixJQUFJO1lBQ0gsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7S0FDRDtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRUg7SUFBQSxNQUFxQixhQUFjLFNBQVEsU0FBUztRQUtuRCxZQUE2QixXQUFvQjtZQUNoRCxLQUFLLEVBQUUsQ0FBQztZQURvQixnQkFBVyxHQUFYLFdBQVcsQ0FBUztZQUZ6QyxTQUFJLEdBQVEsRUFBRSxDQUFDO1lBSXRCLElBQUksQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQy9DLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILElBQUksQ0FBQyxHQUFXLEVBQUUsS0FBVTtZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUV2QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFaEIsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILElBQUksQ0FBQyxHQUFvQjtZQUN4QixJQUFJLEdBQUcsWUFBWSxNQUFNLEVBQUU7Z0JBQzFCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNsQyxNQUFNLEdBQVEsRUFBRSxDQUFDO2dCQUVsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDckMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ2hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUN6QjtpQkFDRDtnQkFFRCxPQUFPLE1BQU0sQ0FBQzthQUNkO2lCQUFNO2dCQUNOLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN0QjtRQUNGLENBQUM7UUFFRDs7Ozs7OztXQU9HO1FBQ0gsTUFBTSxDQUFDLEdBQW9CO1lBQzFCLElBQUksRUFBRSxFQUFFO2dCQUNQLElBQUksR0FBRyxZQUFZLE1BQU0sRUFBRTtvQkFDMUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRXBDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUNyQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2xCLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTs0QkFDaEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNwQjtxQkFDRDtpQkFDRDtxQkFBTTtvQkFDTixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3RCO2dCQUVELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFFaEIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVEOztXQUVHO1FBQ0gsS0FBSztZQUNKLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRWYsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWhCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFakQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILE9BQU8sQ0FBQyxFQUF3QjtZQUMvQixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRDs7OztXQUlHO1FBQ0ssUUFBUTtZQUNmLElBQUksRUFBRSxFQUFFO2dCQUNQLElBQUk7b0JBQ0gsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2hELE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hCO2FBQ0Q7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7O0lBdkhlLGtDQUFvQixHQUFHLEVBQUUsRUFBRSxDQUFDO0lBd0g3QyxvQkFBQztLQUFBO2VBekhvQixhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcclxuaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuL09XZWJFdmVudCc7XHJcbmltcG9ydCB7IGlkLCBsb2dnZXIgfSBmcm9tICcuL3V0aWxzL1V0aWxzJztcclxuXHJcbmNvbnN0IGxzID0gd2luZG93LmxvY2FsU3RvcmFnZSxcclxuXHRwYXJzZSA9IGZ1bmN0aW9uIChkYXRhOiBzdHJpbmcgfCBudWxsKTogYW55IHtcclxuXHRcdGxldCB2YWx1ZTogYW55O1xyXG5cclxuXHRcdGlmIChkYXRhICE9PSBudWxsKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0dmFsdWUgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG5cdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0bG9nZ2VyLmVycm9yKGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHZhbHVlO1xyXG5cdH07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRGF0YVN0b3JlIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0RBVEFfU1RPUkVfQ0xFQVIgPSBpZCgpO1xyXG5cdHByaXZhdGUgcmVhZG9ubHkga2V5OiBzdHJpbmc7XHJcblx0cHJpdmF0ZSBkYXRhOiBhbnkgPSB7fTtcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfYXBwQ29udGV4dDogT1dlYkFwcCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMua2V5ID0gX2FwcENvbnRleHQuZ2V0QXBwTmFtZSgpO1xyXG5cdFx0dGhpcy5kYXRhID0gcGFyc2UobHMuZ2V0SXRlbSh0aGlzLmtleSkpIHx8IHt9O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2F2ZSBkYXRhIHRvIHRoZSBzdG9yZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGRhdGEga2V5IG5hbWUuXHJcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBkYXRhIHZhbHVlLlxyXG5cdCAqL1xyXG5cdHNhdmUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcclxuXHRcdHRoaXMuZGF0YVtrZXldID0gdmFsdWU7XHJcblxyXG5cdFx0dGhpcy5fcGVyc2lzdCgpO1xyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWQgZGF0YSB3aXRoIHRoZSBnaXZlbiBrZXkuXHJcblx0ICpcclxuXHQgKiBXaGVuIHRoZSBrZXkgaXMgYSByZWdleHAgYWxsIGRhdGEgd2l0aCBhIGtleSBuYW1lIHRoYXQgbWF0Y2ggdGhlIGdpdmVuXHJcblx0ICogcmVnZXhwIHdpbGwgYmUgcmV0dXJuZWQgaW4gYW4gb2JqZWN0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGtleSBUaGUgZGF0YSBrZXkgbmFtZS5cclxuXHQgKi9cclxuXHRsb2FkKGtleTogc3RyaW5nIHwgUmVnRXhwKTogYW55IHtcclxuXHRcdGlmIChrZXkgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuXHRcdFx0Y29uc3QgbGlzdCA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YSksXHJcblx0XHRcdFx0cmVzdWx0OiBhbnkgPSB7fTtcclxuXHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGNvbnN0IGsgPSBsaXN0W2ldO1xyXG5cdFx0XHRcdGlmIChrZXkudGVzdChrKSkge1xyXG5cdFx0XHRcdFx0cmVzdWx0W2tdID0gdGhpcy5kYXRhW2tdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmRhdGFba2V5XTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgZGF0YSB3aXRoIHRoZSBnaXZlbiBrZXkuXHJcblx0ICpcclxuXHQgKiBXaGVuIHRoZSBrZXkgaXMgYSByZWdleHAgYWxsIGRhdGEgd2l0aCBhIGtleSBuYW1lIHRoYXQgbWF0Y2ggdGhlIGdpdmVuXHJcblx0ICogcmVnZXhwIHdpbGwgYmUgcmVtb3ZlZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBrZXlcclxuXHQgKi9cclxuXHRyZW1vdmUoa2V5OiBzdHJpbmcgfCBSZWdFeHApOiBib29sZWFuIHtcclxuXHRcdGlmIChscykge1xyXG5cdFx0XHRpZiAoa2V5IGluc3RhbmNlb2YgUmVnRXhwKSB7XHJcblx0XHRcdFx0Y29uc3QgbGlzdCA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YSk7XHJcblxyXG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0Y29uc3QgayA9IGxpc3RbaV07XHJcblx0XHRcdFx0XHRpZiAoa2V5LnRlc3QoaykpIHtcclxuXHRcdFx0XHRcdFx0ZGVsZXRlIHRoaXMuZGF0YVtrXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0ZGVsZXRlIHRoaXMuZGF0YVtrZXldO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLl9wZXJzaXN0KCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDbGVhciB0aGUgZGF0YSBzdG9yZS5cclxuXHQgKi9cclxuXHRjbGVhcigpOiBib29sZWFuIHtcclxuXHRcdHRoaXMuZGF0YSA9IHt9O1xyXG5cclxuXHRcdHRoaXMuX3BlcnNpc3QoKTtcclxuXHJcblx0XHR0aGlzLnRyaWdnZXIoT1dlYkRhdGFTdG9yZS5FVlRfREFUQV9TVE9SRV9DTEVBUik7XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZWdpc3RlciBkYXRhIHN0b3JlIGNsZWFyIGV2ZW50IGhhbmRsZXIuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY2JcclxuXHQgKi9cclxuXHRvbkNsZWFyKGNiOiAodGhpczogdGhpcykgPT4gdm9pZCkge1xyXG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkRhdGFTdG9yZS5FVlRfREFUQV9TVE9SRV9DTEVBUiwgY2IpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGVscGVyIHRvIG1ha2UgZGF0YSBzdG9yZSBwZXJzaXN0ZW50LlxyXG5cdCAqXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9wZXJzaXN0KCk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKGxzKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0bHMuc2V0SXRlbSh0aGlzLmtleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhKSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRsb2dnZXIuZXJyb3IoZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG59XHJcbiJdfQ==