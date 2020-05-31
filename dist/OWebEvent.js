import { isFunction, isString } from './utils/Utils';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUlyRCxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVM7SUFHN0I7UUFGUSxZQUFPLEdBQXVDLEVBQUUsQ0FBQztJQUVoQyxDQUFDO0lBRTFCOzs7OztPQUtHO0lBQ0gsRUFBRSxDQUNELEtBQWEsRUFDYixPQUFrRTtRQUVsRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUN6QjtRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekIsTUFBTSxJQUFJLFNBQVMsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1NBQy9EO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFbEMsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxHQUFHLENBQUMsS0FBYSxFQUFFLE9BQW1CO1FBQ3JDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzQjtpQkFBTSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDN0IsT0FBTyxHQUFHLEtBQUssQ0FBQztnQkFDaEIsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUM5QixJQUNDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUNyRDt3QkFDRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNsQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO3dCQUN4QixPQUFPLENBQUMsRUFBRSxFQUFFOzRCQUNYLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sRUFBRTtnQ0FDNUIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7NkJBQ3RCO3lCQUNEO3FCQUNEO2lCQUNEO2FBQ0Q7U0FDRDthQUFNLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNsRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ3hCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFO29CQUM1QixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDdEI7YUFDRDtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNPLE9BQU8sQ0FDaEIsS0FBYSxFQUNiLE9BQWMsRUFBRSxFQUNoQixhQUFzQixLQUFLLEVBQzNCLFVBQWUsSUFBSTtRQUVuQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDVCxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWxCLE9BQU8sRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUM3QixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxVQUFVLEVBQUU7Z0JBQzdELFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLE1BQU07YUFDTjtTQUNEO1FBRUQsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUNsQixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc0Z1bmN0aW9uLCBpc1N0cmluZyB9IGZyb20gJy4vdXRpbHMvVXRpbHMnO1xuXG5leHBvcnQgdHlwZSB0RXZlbnRIYW5kbGVyID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkIHwgYm9vbGVhbjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkV2ZW50IHtcblx0cHJpdmF0ZSBfZXZlbnRzOiB7IFtrZXk6IHN0cmluZ106IHRFdmVudEhhbmRsZXJbXSB9ID0ge307XG5cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKCkge31cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlci5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gaGFuZGxlciBUaGUgZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cblx0ICovXG5cdG9uKFxuXHRcdGV2ZW50OiBzdHJpbmcsXG5cdFx0aGFuZGxlcjogKHRoaXM6IHRoaXMsIC4uLmFyZ3M6IGFueVtdKSA9PiBSZXR1cm5UeXBlPHRFdmVudEhhbmRsZXI+LFxuXHQpIHtcblx0XHRpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0pIHtcblx0XHRcdHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXTtcblx0XHR9XG5cblx0XHRpZiAoIWlzRnVuY3Rpb24oaGFuZGxlcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1tPV2ViRXZlbnRdIGhhbmRsZXIgc2hvdWxkIGJlIGZ1bmN0aW9uLicpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChoYW5kbGVyKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlci5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gaGFuZGxlciBUaGUgZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cblx0ICovXG5cdG9mZihldmVudDogc3RyaW5nLCBoYW5kbGVyOiAoKSA9PiB2b2lkKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGlmIChpc1N0cmluZyhldmVudCkpIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuX2V2ZW50c1tldmVudF07XG5cdFx0XHR9IGVsc2UgaWYgKGlzRnVuY3Rpb24oZXZlbnQpKSB7XG5cdFx0XHRcdGhhbmRsZXIgPSBldmVudDtcblx0XHRcdFx0Zm9yIChjb25zdCBldiBpbiB0aGlzLl9ldmVudHMpIHtcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fZXZlbnRzLCBldilcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fZXZlbnRzW2V2XTtcblx0XHRcdFx0XHRcdGxldCBpID0gaGFuZGxlcnMubGVuZ3RoO1xuXHRcdFx0XHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoaGFuZGxlcnNbaV0gPT09IGhhbmRsZXIpIHtcblx0XHRcdFx0XHRcdFx0XHRoYW5kbGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGlzU3RyaW5nKGV2ZW50KSAmJiBpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG5cdFx0XHRjb25zdCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1tldmVudF0gfHwgW107XG5cdFx0XHRsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzW2ldID09PSBoYW5kbGVyKSB7XG5cdFx0XHRcdFx0aGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlciBhbiBldmVudC5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBldmVudCBoYW5kbGVycy5cblx0ICogQHBhcmFtIGNhbmNlbGFibGUgV2hlbiB0cnVlIHRoZSBldmVudCB3aWxsIHN0b3Agd2hlbiBhIGhhbmRsZXIgcmV0dXJucyBmYWxzZS5cblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGNvbnRleHQgaW4gd2hpY2ggZWFjaCBoYW5kbGVyIHdpbGwgYmUgY2FsbGVkLiBEZWZhdWx0OiB0aGlzLlxuXHQgKi9cblx0cHJvdGVjdGVkIHRyaWdnZXIoXG5cdFx0ZXZlbnQ6IHN0cmluZyxcblx0XHRkYXRhOiBhbnlbXSA9IFtdLFxuXHRcdGNhbmNlbGFibGU6IGJvb2xlYW4gPSBmYWxzZSxcblx0XHRjb250ZXh0OiBhbnkgPSB0aGlzLFxuXHQpOiBib29sZWFuIHtcblx0XHRjb25zdCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1tldmVudF0gfHwgW107XG5cdFx0bGV0IGkgPSAtMSxcblx0XHRcdGNhbmNlbGVkID0gZmFsc2U7XG5cblx0XHR3aGlsZSAoKytpIDwgaGFuZGxlcnMubGVuZ3RoKSB7XG5cdFx0XHRpZiAoaGFuZGxlcnNbaV0uYXBwbHkoY29udGV4dCwgZGF0YSkgPT09IGZhbHNlICYmIGNhbmNlbGFibGUpIHtcblx0XHRcdFx0Y2FuY2VsZWQgPSB0cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gIWNhbmNlbGVkO1xuXHR9XG59XG4iXX0=