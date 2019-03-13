import Utils from "./utils/Utils";
export default class OWebEvent {
    constructor() {
        this._app_events = {};
    }
    /**
     * Register event handler.
     *
     * @param event The event name.
     * @param handler The event handler function.
     */
    on(event, handler) {
        if (!this._app_events[event]) {
            this._app_events[event] = [];
        }
        if (!Utils.isFunction(handler)) {
            throw new TypeError("[OWebEvent] handler should be function.");
        }
        this._app_events[event].push(handler);
        return this;
    }
    /**
     * Remove event handler.
     *
     * @param event The event name.
     * @param handler The event handler function.
     */
    off(event, handler) {
        if (arguments.length === 1) {
            if (Utils.isString(event)) {
                delete this._app_events[event];
            }
            else if (Utils.isFunction(event)) {
                handler = event;
                for (let ev in this._app_events) {
                    let handlers = this._app_events[ev];
                    let i = handlers.length;
                    while (i--) {
                        if (handlers[i] === handler) {
                            handlers.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }
        else if (Utils.isString(event) && Utils.isFunction(handler)) {
            let handlers = this._app_events[event] || [];
            let i = handlers.length;
            while (i--) {
                if (handlers[i] === handler) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        }
        return this;
    }
    /**
     * Trigger an event.
     *
     * @param event The event name.
     * @param data The data to be passed as arguments to the event handlers.
     * @param cancelable When true the event will stop when a handler returns false.
     * @param callback The callback
     */
    trigger(event, data = [], cancelable = false, callback) {
        let handlers = this._app_events[event] || [], i = -1, canceled = false;
        while (++i < handlers.length) {
            if (handlers[i].apply(this, data) === false &&
                cancelable) {
                canceled = true;
                break;
            }
        }
        callback && Utils.callback(callback, [canceled]);
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFFbEMsTUFBTSxDQUFDLE9BQU87SUFHYjtRQUZRLGdCQUFXLEdBQXVDLEVBQUUsQ0FBQztJQUc3RCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxFQUFFLENBQUMsS0FBYSxFQUFFLE9BQWlCO1FBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzdCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQzdCO1FBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDL0IsTUFBTSxJQUFJLFNBQVMsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1NBQy9EO1FBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdEMsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxHQUFHLENBQUMsS0FBYSxFQUFFLE9BQWlCO1FBRW5DLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMxQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDL0I7aUJBQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNuQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNoQixLQUFLLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2hDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxHQUFVLFFBQVEsQ0FBQyxNQUFNLENBQUM7b0JBQy9CLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ1gsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFOzRCQUM1QixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDdEIsTUFBTTt5QkFDTjtxQkFDRDtpQkFDRDthQUNEO1NBQ0Q7YUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM5RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsR0FBVSxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFO29CQUM1QixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdEIsTUFBTTtpQkFDTjthQUNEO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ08sT0FBTyxDQUFDLEtBQWEsRUFBRSxPQUFtQixFQUFFLEVBQUUsYUFBc0IsS0FBSyxFQUFFLFFBQW1CO1FBQ3ZHLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUMzQyxDQUFDLEdBQVUsQ0FBQyxDQUFDLEVBQ2IsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUVsQixPQUFPLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDN0IsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxLQUFLO2dCQUMxQyxVQUFVLEVBQUU7Z0JBQ1osUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDaEIsTUFBTTthQUNOO1NBQ0Q7UUFFRCxRQUFRLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRWpELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFV0aWxzIGZyb20gXCIuL3V0aWxzL1V0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJFdmVudCB7XG5cdHByaXZhdGUgX2FwcF9ldmVudHM6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8RnVuY3Rpb24+IH0gPSB7fTtcblxuXHRwcm90ZWN0ZWQgY29uc3RydWN0b3IoKSB7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlci5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gaGFuZGxlciBUaGUgZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cblx0ICovXG5cdG9uKGV2ZW50OiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKSB7XG5cdFx0aWYgKCF0aGlzLl9hcHBfZXZlbnRzW2V2ZW50XSkge1xuXHRcdFx0dGhpcy5fYXBwX2V2ZW50c1tldmVudF0gPSBbXTtcblx0XHR9XG5cblx0XHRpZiAoIVV0aWxzLmlzRnVuY3Rpb24oaGFuZGxlcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJbT1dlYkV2ZW50XSBoYW5kbGVyIHNob3VsZCBiZSBmdW5jdGlvbi5cIik7XG5cdFx0fVxuXG5cdFx0dGhpcy5fYXBwX2V2ZW50c1tldmVudF0ucHVzaChoYW5kbGVyKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZSBldmVudCBoYW5kbGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG5cdCAqIEBwYXJhbSBoYW5kbGVyIFRoZSBldmVudCBoYW5kbGVyIGZ1bmN0aW9uLlxuXHQgKi9cblx0b2ZmKGV2ZW50OiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKSB7XG5cblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0aWYgKFV0aWxzLmlzU3RyaW5nKGV2ZW50KSkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5fYXBwX2V2ZW50c1tldmVudF07XG5cdFx0XHR9IGVsc2UgaWYgKFV0aWxzLmlzRnVuY3Rpb24oZXZlbnQpKSB7XG5cdFx0XHRcdGhhbmRsZXIgPSBldmVudDtcblx0XHRcdFx0Zm9yIChsZXQgZXYgaW4gdGhpcy5fYXBwX2V2ZW50cykge1xuXHRcdFx0XHRcdGxldCBoYW5kbGVycyA9IHRoaXMuX2FwcF9ldmVudHNbZXZdO1xuXHRcdFx0XHRcdGxldCBpICAgICAgICA9IGhhbmRsZXJzLmxlbmd0aDtcblx0XHRcdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdFx0XHRpZiAoaGFuZGxlcnNbaV0gPT09IGhhbmRsZXIpIHtcblx0XHRcdFx0XHRcdFx0aGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKFV0aWxzLmlzU3RyaW5nKGV2ZW50KSAmJiBVdGlscy5pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG5cdFx0XHRsZXQgaGFuZGxlcnMgPSB0aGlzLl9hcHBfZXZlbnRzW2V2ZW50XSB8fCBbXTtcblx0XHRcdGxldCBpICAgICAgICA9IGhhbmRsZXJzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzW2ldID09PSBoYW5kbGVyKSB7XG5cdFx0XHRcdFx0aGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlciBhbiBldmVudC5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBldmVudCBoYW5kbGVycy5cblx0ICogQHBhcmFtIGNhbmNlbGFibGUgV2hlbiB0cnVlIHRoZSBldmVudCB3aWxsIHN0b3Agd2hlbiBhIGhhbmRsZXIgcmV0dXJucyBmYWxzZS5cblx0ICogQHBhcmFtIGNhbGxiYWNrIFRoZSBjYWxsYmFja1xuXHQgKi9cblx0cHJvdGVjdGVkIHRyaWdnZXIoZXZlbnQ6IHN0cmluZywgZGF0YTogQXJyYXk8YW55PiA9IFtdLCBjYW5jZWxhYmxlOiBib29sZWFuID0gZmFsc2UsIGNhbGxiYWNrPzogRnVuY3Rpb24pIHtcblx0XHRsZXQgaGFuZGxlcnMgPSB0aGlzLl9hcHBfZXZlbnRzW2V2ZW50XSB8fCBbXSxcblx0XHRcdGkgICAgICAgID0gLTEsXG5cdFx0XHRjYW5jZWxlZCA9IGZhbHNlO1xuXG5cdFx0d2hpbGUgKCsraSA8IGhhbmRsZXJzLmxlbmd0aCkge1xuXHRcdFx0aWYgKGhhbmRsZXJzW2ldLmFwcGx5KHRoaXMsIGRhdGEpID09PSBmYWxzZSAmJlxuXHRcdFx0XHRjYW5jZWxhYmxlKSB7XG5cdFx0XHRcdGNhbmNlbGVkID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y2FsbGJhY2sgJiYgVXRpbHMuY2FsbGJhY2soY2FsbGJhY2ssIFtjYW5jZWxlZF0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0iXX0=