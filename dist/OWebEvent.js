import { isFunction, isString } from './utils';
export default class OWebEvent {
    _events = {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUkvQyxNQUFNLENBQUMsT0FBTyxPQUFPLFNBQVM7SUFDckIsT0FBTyxHQUF1QyxFQUFFLENBQUM7SUFFekQ7Ozs7O09BS0c7SUFDSCxFQUFFLENBQ0QsS0FBYSxFQUNiLE9BQWtFO1FBRWxFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3pCO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN6QixNQUFNLElBQUksU0FBUyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7U0FDL0Q7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVsQyxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEdBQUcsQ0FBQyxLQUFhLEVBQUUsT0FBbUI7UUFDckMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMzQixJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDcEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzNCO2lCQUFNLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM3QixPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNoQixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQzlCLElBQ0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQ3JEO3dCQUNELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ2xDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7d0JBQ3hCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7NEJBQ1gsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFO2dDQUM1QixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs2QkFDdEI7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7YUFDRDtTQUNEO2FBQU0sSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ2xELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDeEIsT0FBTyxDQUFDLEVBQUUsRUFBRTtnQkFDWCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7b0JBQzVCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN0QjthQUNEO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ08sT0FBTyxDQUNoQixLQUFhLEVBQ2IsT0FBYyxFQUFFLEVBQ2hCLFVBQVUsR0FBRyxLQUFLLEVBQ2xCLFVBQWUsSUFBSTtRQUVuQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDVCxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWxCLE9BQU8sRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUM3QixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxVQUFVLEVBQUU7Z0JBQzdELFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLE1BQU07YUFDTjtTQUNEO1FBRUQsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUNsQixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc0Z1bmN0aW9uLCBpc1N0cmluZyB9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgdHlwZSBPRXZlbnRIYW5kbGVyID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkIHwgYm9vbGVhbjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkV2ZW50IHtcblx0cHJpdmF0ZSBfZXZlbnRzOiB7IFtrZXk6IHN0cmluZ106IE9FdmVudEhhbmRsZXJbXSB9ID0ge307XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGV2ZW50IGhhbmRsZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgbmFtZS5cblx0ICogQHBhcmFtIGhhbmRsZXIgVGhlIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24uXG5cdCAqL1xuXHRvbihcblx0XHRldmVudDogc3RyaW5nLFxuXHRcdGhhbmRsZXI6ICh0aGlzOiB0aGlzLCAuLi5hcmdzOiBhbnlbXSkgPT4gUmV0dXJuVHlwZTxPRXZlbnRIYW5kbGVyPlxuXHQpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0pIHtcblx0XHRcdHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXTtcblx0XHR9XG5cblx0XHRpZiAoIWlzRnVuY3Rpb24oaGFuZGxlcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1tPV2ViRXZlbnRdIGhhbmRsZXIgc2hvdWxkIGJlIGZ1bmN0aW9uLicpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChoYW5kbGVyKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlci5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gaGFuZGxlciBUaGUgZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cblx0ICovXG5cdG9mZihldmVudDogc3RyaW5nLCBoYW5kbGVyOiAoKSA9PiB2b2lkKTogdGhpcyB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGlmIChpc1N0cmluZyhldmVudCkpIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuX2V2ZW50c1tldmVudF07XG5cdFx0XHR9IGVsc2UgaWYgKGlzRnVuY3Rpb24oZXZlbnQpKSB7XG5cdFx0XHRcdGhhbmRsZXIgPSBldmVudDtcblx0XHRcdFx0Zm9yIChjb25zdCBldiBpbiB0aGlzLl9ldmVudHMpIHtcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fZXZlbnRzLCBldilcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fZXZlbnRzW2V2XTtcblx0XHRcdFx0XHRcdGxldCBpID0gaGFuZGxlcnMubGVuZ3RoO1xuXHRcdFx0XHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoaGFuZGxlcnNbaV0gPT09IGhhbmRsZXIpIHtcblx0XHRcdFx0XHRcdFx0XHRoYW5kbGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGlzU3RyaW5nKGV2ZW50KSAmJiBpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG5cdFx0XHRjb25zdCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1tldmVudF0gfHwgW107XG5cdFx0XHRsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzW2ldID09PSBoYW5kbGVyKSB7XG5cdFx0XHRcdFx0aGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlciBhbiBldmVudC5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBldmVudCBoYW5kbGVycy5cblx0ICogQHBhcmFtIGNhbmNlbGFibGUgV2hlbiB0cnVlIHRoZSBldmVudCB3aWxsIHN0b3Agd2hlbiBhIGhhbmRsZXIgcmV0dXJucyBmYWxzZS5cblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGNvbnRleHQgaW4gd2hpY2ggZWFjaCBoYW5kbGVyIHdpbGwgYmUgY2FsbGVkLiBEZWZhdWx0OiB0aGlzLlxuXHQgKi9cblx0cHJvdGVjdGVkIHRyaWdnZXIoXG5cdFx0ZXZlbnQ6IHN0cmluZyxcblx0XHRkYXRhOiBhbnlbXSA9IFtdLFxuXHRcdGNhbmNlbGFibGUgPSBmYWxzZSxcblx0XHRjb250ZXh0OiBhbnkgPSB0aGlzXG5cdCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGhhbmRsZXJzID0gdGhpcy5fZXZlbnRzW2V2ZW50XSB8fCBbXTtcblx0XHRsZXQgaSA9IC0xLFxuXHRcdFx0Y2FuY2VsZWQgPSBmYWxzZTtcblxuXHRcdHdoaWxlICgrK2kgPCBoYW5kbGVycy5sZW5ndGgpIHtcblx0XHRcdGlmIChoYW5kbGVyc1tpXS5hcHBseShjb250ZXh0LCBkYXRhKSA9PT0gZmFsc2UgJiYgY2FuY2VsYWJsZSkge1xuXHRcdFx0XHRjYW5jZWxlZCA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAhY2FuY2VsZWQ7XG5cdH1cbn1cbiJdfQ==