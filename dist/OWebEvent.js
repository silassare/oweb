import Utils from './utils/Utils';
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
        if (!Utils.isFunction(handler)) {
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
            if (Utils.isString(event)) {
                delete this._events[event];
            }
            else if (Utils.isFunction(event)) {
                handler = event;
                for (let ev in this._events) {
                    let handlers = this._events[ev];
                    let i = handlers.length;
                    while (i--) {
                        if (handlers[i] === handler) {
                            handlers.splice(i, 1);
                        }
                    }
                }
            }
        }
        else if (Utils.isString(event) && Utils.isFunction(handler)) {
            let handlers = this._events[event] || [];
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
        let handlers = this._events[event] || [], i = -1, canceled = false;
        while (++i < handlers.length) {
            if (handlers[i].apply(context, data) === false && cancelable) {
                canceled = true;
                break;
            }
        }
        return !canceled;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFFbEMsTUFBTSxDQUFDLE9BQU8sT0FBTyxTQUFTO0lBRzdCO1FBRlEsWUFBTyxHQUF1QyxFQUFFLENBQUM7SUFFaEMsQ0FBQztJQUUxQjs7Ozs7T0FLRztJQUNILEVBQUUsQ0FBQyxLQUFhLEVBQUUsT0FBdUQ7UUFDeEUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDekI7UUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMvQixNQUFNLElBQUksU0FBUyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7U0FDL0Q7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVsQyxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEdBQUcsQ0FBQyxLQUFhLEVBQUUsT0FBaUI7UUFDbkMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMzQixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzQjtpQkFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLEtBQUssSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDNUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDaEMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDeEIsT0FBTyxDQUFDLEVBQUUsRUFBRTt3QkFDWCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7NEJBQzVCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3lCQUN0QjtxQkFDRDtpQkFDRDthQUNEO1NBQ0Q7YUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM5RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ3hCLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFO29CQUM1QixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDdEI7YUFDRDtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNPLE9BQU8sQ0FDaEIsS0FBYSxFQUNiLE9BQW1CLEVBQUUsRUFDckIsYUFBc0IsS0FBSyxFQUMzQixVQUFlLElBQUk7UUFFbkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQ3ZDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDTixRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWxCLE9BQU8sRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUM3QixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxVQUFVLEVBQUU7Z0JBQzdELFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLE1BQU07YUFDTjtTQUNEO1FBRUQsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUNsQixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscy9VdGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJFdmVudCB7XG5cdHByaXZhdGUgX2V2ZW50czogeyBba2V5OiBzdHJpbmddOiBBcnJheTxGdW5jdGlvbj4gfSA9IHt9O1xuXG5cdHByb3RlY3RlZCBjb25zdHJ1Y3RvcigpIHt9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGV2ZW50IGhhbmRsZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgbmFtZS5cblx0ICogQHBhcmFtIGhhbmRsZXIgVGhlIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24uXG5cdCAqL1xuXHRvbihldmVudDogc3RyaW5nLCBoYW5kbGVyOiAodGhpczogdGhpcywgLi4uYXJnczogYW55W10pID0+IHZvaWQgfCBib29sZWFuKSB7XG5cdFx0aWYgKCF0aGlzLl9ldmVudHNbZXZlbnRdKSB7XG5cdFx0XHR0aGlzLl9ldmVudHNbZXZlbnRdID0gW107XG5cdFx0fVxuXG5cdFx0aWYgKCFVdGlscy5pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdbT1dlYkV2ZW50XSBoYW5kbGVyIHNob3VsZCBiZSBmdW5jdGlvbi4nKTtcblx0XHR9XG5cblx0XHR0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2goaGFuZGxlcik7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgbmFtZS5cblx0ICogQHBhcmFtIGhhbmRsZXIgVGhlIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24uXG5cdCAqL1xuXHRvZmYoZXZlbnQ6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0aWYgKFV0aWxzLmlzU3RyaW5nKGV2ZW50KSkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5fZXZlbnRzW2V2ZW50XTtcblx0XHRcdH0gZWxzZSBpZiAoVXRpbHMuaXNGdW5jdGlvbihldmVudCkpIHtcblx0XHRcdFx0aGFuZGxlciA9IGV2ZW50O1xuXHRcdFx0XHRmb3IgKGxldCBldiBpbiB0aGlzLl9ldmVudHMpIHtcblx0XHRcdFx0XHRsZXQgaGFuZGxlcnMgPSB0aGlzLl9ldmVudHNbZXZdO1xuXHRcdFx0XHRcdGxldCBpID0gaGFuZGxlcnMubGVuZ3RoO1xuXHRcdFx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0XHRcdGlmIChoYW5kbGVyc1tpXSA9PT0gaGFuZGxlcikge1xuXHRcdFx0XHRcdFx0XHRoYW5kbGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChVdGlscy5pc1N0cmluZyhldmVudCkgJiYgVXRpbHMuaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuXHRcdFx0bGV0IGhhbmRsZXJzID0gdGhpcy5fZXZlbnRzW2V2ZW50XSB8fCBbXTtcblx0XHRcdGxldCBpID0gaGFuZGxlcnMubGVuZ3RoO1xuXHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHRpZiAoaGFuZGxlcnNbaV0gPT09IGhhbmRsZXIpIHtcblx0XHRcdFx0XHRoYW5kbGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VyIGFuIGV2ZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG5cdCAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGV2ZW50IGhhbmRsZXJzLlxuXHQgKiBAcGFyYW0gY2FuY2VsYWJsZSBXaGVuIHRydWUgdGhlIGV2ZW50IHdpbGwgc3RvcCB3aGVuIGEgaGFuZGxlciByZXR1cm5zIGZhbHNlLlxuXHQgKiBAcGFyYW0gY29udGV4dCBUaGUgY29udGV4dCBpbiB3aGljaCBlYWNoIGhhbmRsZXIgd2lsbCBiZSBjYWxsZWQuIERlZmF1bHQ6IHRoaXMuXG5cdCAqL1xuXHRwcm90ZWN0ZWQgdHJpZ2dlcihcblx0XHRldmVudDogc3RyaW5nLFxuXHRcdGRhdGE6IEFycmF5PGFueT4gPSBbXSxcblx0XHRjYW5jZWxhYmxlOiBib29sZWFuID0gZmFsc2UsXG5cdFx0Y29udGV4dDogYW55ID0gdGhpc1xuXHQpOiBib29sZWFuIHtcblx0XHRsZXQgaGFuZGxlcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdIHx8IFtdLFxuXHRcdFx0aSA9IC0xLFxuXHRcdFx0Y2FuY2VsZWQgPSBmYWxzZTtcblxuXHRcdHdoaWxlICgrK2kgPCBoYW5kbGVycy5sZW5ndGgpIHtcblx0XHRcdGlmIChoYW5kbGVyc1tpXS5hcHBseShjb250ZXh0LCBkYXRhKSA9PT0gZmFsc2UgJiYgY2FuY2VsYWJsZSkge1xuXHRcdFx0XHRjYW5jZWxlZCA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAhY2FuY2VsZWQ7XG5cdH1cbn1cbiJdfQ==