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
     * Removes event handler.
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
        callback && Utils.callback(callback, [canceled], this);
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFFbEMsTUFBTSxDQUFDLE9BQU87SUFHYjtRQUZRLGdCQUFXLEdBQXVDLEVBQUUsQ0FBQztJQUc3RCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxFQUFFLENBQUMsS0FBYSxFQUFFLE9BQXVEO1FBQ3hFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzdCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQzdCO1FBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDL0IsTUFBTSxJQUFJLFNBQVMsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1NBQy9EO1FBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdEMsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxHQUFHLENBQUMsS0FBYSxFQUFFLE9BQWlCO1FBRW5DLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMxQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDL0I7aUJBQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNuQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNoQixLQUFLLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2hDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxHQUFVLFFBQVEsQ0FBQyxNQUFNLENBQUM7b0JBQy9CLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ1gsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFOzRCQUM1QixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDdEIsTUFBTTt5QkFDTjtxQkFDRDtpQkFDRDthQUNEO1NBQ0Q7YUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM5RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsR0FBVSxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFO29CQUM1QixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdEIsTUFBTTtpQkFDTjthQUNEO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ08sT0FBTyxDQUFDLEtBQWEsRUFBRSxPQUFtQixFQUFFLEVBQUUsYUFBc0IsS0FBSyxFQUFFLFFBQStCO1FBQ25ILElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxFQUMzQyxDQUFDLEdBQVUsQ0FBQyxDQUFDLEVBQ2IsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUVsQixPQUFPLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDN0IsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxLQUFLO2dCQUMxQyxVQUFVLEVBQUU7Z0JBQ1osUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDaEIsTUFBTTthQUNOO1NBQ0Q7UUFFRCxRQUFRLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV2RCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBVdGlscyBmcm9tIFwiLi91dGlscy9VdGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRXZlbnQge1xuXHRwcml2YXRlIF9hcHBfZXZlbnRzOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PEZ1bmN0aW9uPiB9ID0ge307XG5cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKCkge1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGV2ZW50IGhhbmRsZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgbmFtZS5cblx0ICogQHBhcmFtIGhhbmRsZXIgVGhlIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24uXG5cdCAqL1xuXHRvbihldmVudDogc3RyaW5nLCBoYW5kbGVyOiAodGhpczogdGhpcywgLi4uYXJnczogYW55W10pID0+IHZvaWQgfCBib29sZWFuKSB7XG5cdFx0aWYgKCF0aGlzLl9hcHBfZXZlbnRzW2V2ZW50XSkge1xuXHRcdFx0dGhpcy5fYXBwX2V2ZW50c1tldmVudF0gPSBbXTtcblx0XHR9XG5cblx0XHRpZiAoIVV0aWxzLmlzRnVuY3Rpb24oaGFuZGxlcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJbT1dlYkV2ZW50XSBoYW5kbGVyIHNob3VsZCBiZSBmdW5jdGlvbi5cIik7XG5cdFx0fVxuXG5cdFx0dGhpcy5fYXBwX2V2ZW50c1tldmVudF0ucHVzaChoYW5kbGVyKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlci5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gaGFuZGxlciBUaGUgZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cblx0ICovXG5cdG9mZihldmVudDogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbikge1xuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGlmIChVdGlscy5pc1N0cmluZyhldmVudCkpIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuX2FwcF9ldmVudHNbZXZlbnRdO1xuXHRcdFx0fSBlbHNlIGlmIChVdGlscy5pc0Z1bmN0aW9uKGV2ZW50KSkge1xuXHRcdFx0XHRoYW5kbGVyID0gZXZlbnQ7XG5cdFx0XHRcdGZvciAobGV0IGV2IGluIHRoaXMuX2FwcF9ldmVudHMpIHtcblx0XHRcdFx0XHRsZXQgaGFuZGxlcnMgPSB0aGlzLl9hcHBfZXZlbnRzW2V2XTtcblx0XHRcdFx0XHRsZXQgaSAgICAgICAgPSBoYW5kbGVycy5sZW5ndGg7XG5cdFx0XHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHRcdFx0aWYgKGhhbmRsZXJzW2ldID09PSBoYW5kbGVyKSB7XG5cdFx0XHRcdFx0XHRcdGhhbmRsZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChVdGlscy5pc1N0cmluZyhldmVudCkgJiYgVXRpbHMuaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuXHRcdFx0bGV0IGhhbmRsZXJzID0gdGhpcy5fYXBwX2V2ZW50c1tldmVudF0gfHwgW107XG5cdFx0XHRsZXQgaSAgICAgICAgPSBoYW5kbGVycy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdGlmIChoYW5kbGVyc1tpXSA9PT0gaGFuZGxlcikge1xuXHRcdFx0XHRcdGhhbmRsZXJzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXIgYW4gZXZlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgbmFtZS5cblx0ICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZXZlbnQgaGFuZGxlcnMuXG5cdCAqIEBwYXJhbSBjYW5jZWxhYmxlIFdoZW4gdHJ1ZSB0aGUgZXZlbnQgd2lsbCBzdG9wIHdoZW4gYSBoYW5kbGVyIHJldHVybnMgZmFsc2UuXG5cdCAqIEBwYXJhbSBjYWxsYmFjayBUaGUgY2FsbGJhY2tcblx0ICovXG5cdHByb3RlY3RlZCB0cmlnZ2VyKGV2ZW50OiBzdHJpbmcsIGRhdGE6IEFycmF5PGFueT4gPSBbXSwgY2FuY2VsYWJsZTogYm9vbGVhbiA9IGZhbHNlLCBjYWxsYmFjaz86ICh0aGlzOiB0aGlzKSA9PiB2b2lkKSB7XG5cdFx0bGV0IGhhbmRsZXJzID0gdGhpcy5fYXBwX2V2ZW50c1tldmVudF0gfHwgW10sXG5cdFx0XHRpICAgICAgICA9IC0xLFxuXHRcdFx0Y2FuY2VsZWQgPSBmYWxzZTtcblxuXHRcdHdoaWxlICgrK2kgPCBoYW5kbGVycy5sZW5ndGgpIHtcblx0XHRcdGlmIChoYW5kbGVyc1tpXS5hcHBseSh0aGlzLCBkYXRhKSA9PT0gZmFsc2UgJiZcblx0XHRcdFx0Y2FuY2VsYWJsZSkge1xuXHRcdFx0XHRjYW5jZWxlZCA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNhbGxiYWNrICYmIFV0aWxzLmNhbGxiYWNrKGNhbGxiYWNrLCBbY2FuY2VsZWRdLCB0aGlzKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59Il19