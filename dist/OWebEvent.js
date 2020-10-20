import { isFunction, isString } from './utils';
export default class OWebEvent {
    constructor() {
        this._events = {};
    }
    /**
     * Register event handler.
     *
     * @param event The event name.
     * @param handler The event handler function.
     */
    on(event, handler) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        if (!isFunction(handler)) {
            throw new TypeError('[OWebEvent] handler should be function.');
        }
        this._events[event].push(handler);
        return this;
    }
    /**
     * Removes event handler.
     *
     * @param event The event name.
     * @param handler The event handler function.
     */
    off(event, handler) {
        if (arguments.length === 1) {
            if (isString(event)) {
                delete this._events[event];
            }
            else if (isFunction(event)) {
                handler = event;
                for (const ev in this._events) {
                    if (Object.prototype.hasOwnProperty.call(this._events, ev)) {
                        const handlers = this._events[ev];
                        let i = handlers.length;
                        while (i--) {
                            if (handlers[i] === handler) {
                                handlers.splice(i, 1);
                            }
                        }
                    }
                }
            }
        }
        else if (isString(event) && isFunction(handler)) {
            const handlers = this._events[event] || [];
            let i = handlers.length;
            while (i--) {
                if (handlers[i] === handler) {
                    handlers.splice(i, 1);
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
     * @param context The context in which each handler will be called. Default: this.
     */
    trigger(event, data = [], cancelable = false, context = this) {
        const handlers = this._events[event] || [];
        let i = -1, canceled = false;
        while (++i < handlers.length) {
            if (handlers[i].apply(context, data) === false && cancelable) {
                canceled = true;
                break;
            }
        }
        return !canceled;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUkvQyxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVM7SUFBOUI7UUFDUyxZQUFPLEdBQXVDLEVBQUUsQ0FBQztJQTJGMUQsQ0FBQztJQXpGQTs7Ozs7T0FLRztJQUNILEVBQUUsQ0FDRCxLQUFhLEVBQ2IsT0FBa0U7UUFFbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDekI7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxTQUFTLENBQUMseUNBQXlDLENBQUMsQ0FBQztTQUMvRDtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWxDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsR0FBRyxDQUFDLEtBQWEsRUFBRSxPQUFtQjtRQUNyQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzNCLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNwQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDM0I7aUJBQU0sSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzdCLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDOUIsSUFDQyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFDckQ7d0JBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDbEMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQzt3QkFDeEIsT0FBTyxDQUFDLEVBQUUsRUFBRTs0QkFDWCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7Z0NBQzVCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzZCQUN0Qjt5QkFDRDtxQkFDRDtpQkFDRDthQUNEO1NBQ0Q7YUFBTSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUN4QixPQUFPLENBQUMsRUFBRSxFQUFFO2dCQUNYLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sRUFBRTtvQkFDNUIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3RCO2FBQ0Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDTyxPQUFPLENBQ2hCLEtBQWEsRUFDYixPQUFjLEVBQUUsRUFDaEIsVUFBVSxHQUFHLEtBQUssRUFDbEIsVUFBZSxJQUFJO1FBRW5CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNULFFBQVEsR0FBRyxLQUFLLENBQUM7UUFFbEIsT0FBTyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQzdCLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLFVBQVUsRUFBRTtnQkFDN0QsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDaEIsTUFBTTthQUNOO1NBQ0Q7UUFFRCxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzRnVuY3Rpb24sIGlzU3RyaW5nIH0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCB0eXBlIE9FdmVudEhhbmRsZXIgPSAoLi4uYXJnczogYW55W10pID0+IHZvaWQgfCBib29sZWFuO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRXZlbnQge1xuXHRwcml2YXRlIF9ldmVudHM6IHsgW2tleTogc3RyaW5nXTogT0V2ZW50SGFuZGxlcltdIH0gPSB7fTtcblxuXHQvKipcblx0ICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlci5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gaGFuZGxlciBUaGUgZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cblx0ICovXG5cdG9uKFxuXHRcdGV2ZW50OiBzdHJpbmcsXG5cdFx0aGFuZGxlcjogKHRoaXM6IHRoaXMsIC4uLmFyZ3M6IGFueVtdKSA9PiBSZXR1cm5UeXBlPE9FdmVudEhhbmRsZXI+LFxuXHQpIHtcblx0XHRpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0pIHtcblx0XHRcdHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXTtcblx0XHR9XG5cblx0XHRpZiAoIWlzRnVuY3Rpb24oaGFuZGxlcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1tPV2ViRXZlbnRdIGhhbmRsZXIgc2hvdWxkIGJlIGZ1bmN0aW9uLicpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChoYW5kbGVyKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlci5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gaGFuZGxlciBUaGUgZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cblx0ICovXG5cdG9mZihldmVudDogc3RyaW5nLCBoYW5kbGVyOiAoKSA9PiB2b2lkKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGlmIChpc1N0cmluZyhldmVudCkpIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuX2V2ZW50c1tldmVudF07XG5cdFx0XHR9IGVsc2UgaWYgKGlzRnVuY3Rpb24oZXZlbnQpKSB7XG5cdFx0XHRcdGhhbmRsZXIgPSBldmVudDtcblx0XHRcdFx0Zm9yIChjb25zdCBldiBpbiB0aGlzLl9ldmVudHMpIHtcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fZXZlbnRzLCBldilcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fZXZlbnRzW2V2XTtcblx0XHRcdFx0XHRcdGxldCBpID0gaGFuZGxlcnMubGVuZ3RoO1xuXHRcdFx0XHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoaGFuZGxlcnNbaV0gPT09IGhhbmRsZXIpIHtcblx0XHRcdFx0XHRcdFx0XHRoYW5kbGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGlzU3RyaW5nKGV2ZW50KSAmJiBpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG5cdFx0XHRjb25zdCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1tldmVudF0gfHwgW107XG5cdFx0XHRsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzW2ldID09PSBoYW5kbGVyKSB7XG5cdFx0XHRcdFx0aGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlciBhbiBldmVudC5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBldmVudCBoYW5kbGVycy5cblx0ICogQHBhcmFtIGNhbmNlbGFibGUgV2hlbiB0cnVlIHRoZSBldmVudCB3aWxsIHN0b3Agd2hlbiBhIGhhbmRsZXIgcmV0dXJucyBmYWxzZS5cblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGNvbnRleHQgaW4gd2hpY2ggZWFjaCBoYW5kbGVyIHdpbGwgYmUgY2FsbGVkLiBEZWZhdWx0OiB0aGlzLlxuXHQgKi9cblx0cHJvdGVjdGVkIHRyaWdnZXIoXG5cdFx0ZXZlbnQ6IHN0cmluZyxcblx0XHRkYXRhOiBhbnlbXSA9IFtdLFxuXHRcdGNhbmNlbGFibGUgPSBmYWxzZSxcblx0XHRjb250ZXh0OiBhbnkgPSB0aGlzLFxuXHQpOiBib29sZWFuIHtcblx0XHRjb25zdCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1tldmVudF0gfHwgW107XG5cdFx0bGV0IGkgPSAtMSxcblx0XHRcdGNhbmNlbGVkID0gZmFsc2U7XG5cblx0XHR3aGlsZSAoKytpIDwgaGFuZGxlcnMubGVuZ3RoKSB7XG5cdFx0XHRpZiAoaGFuZGxlcnNbaV0uYXBwbHkoY29udGV4dCwgZGF0YSkgPT09IGZhbHNlICYmIGNhbmNlbGFibGUpIHtcblx0XHRcdFx0Y2FuY2VsZWQgPSB0cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gIWNhbmNlbGVkO1xuXHR9XG59XG4iXX0=