import Utils from "./utils/Utils";
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
            throw new TypeError("[OWebEvent] handler should be function.");
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
                            break;
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
        let handlers = this._events[event] || [], i = -1, canceled = false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFFbEMsTUFBTSxDQUFDLE9BQU87SUFHYjtRQUZRLFlBQU8sR0FBeUMsRUFBRSxDQUFDO0lBRzNELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEVBQUUsQ0FBQyxLQUFhLEVBQUUsT0FBdUQ7UUFDeEUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBRSxLQUFLLENBQUUsR0FBRyxFQUFFLENBQUM7U0FDM0I7UUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMvQixNQUFNLElBQUksU0FBUyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7U0FDL0Q7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFFLEtBQUssQ0FBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVwQyxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEdBQUcsQ0FBQyxLQUFhLEVBQUUsT0FBaUI7UUFFbkMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMzQixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBRSxLQUFLLENBQUUsQ0FBQzthQUM3QjtpQkFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLEtBQUssSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDNUIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBRSxFQUFFLENBQUUsQ0FBQztvQkFDbEMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDeEIsT0FBTyxDQUFDLEVBQUUsRUFBRTt3QkFDWCxJQUFJLFFBQVEsQ0FBRSxDQUFDLENBQUUsS0FBSyxPQUFPLEVBQUU7NEJBQzlCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUN0QixNQUFNO3lCQUNOO3FCQUNEO2lCQUNEO2FBQ0Q7U0FDRDthQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzlELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFFLElBQUksRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDeEIsT0FBTyxDQUFDLEVBQUUsRUFBRTtnQkFDWCxJQUFJLFFBQVEsQ0FBRSxDQUFDLENBQUUsS0FBSyxPQUFPLEVBQUU7b0JBQzlCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN0QixNQUFNO2lCQUNOO2FBQ0Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDTyxPQUFPLENBQUMsS0FBYSxFQUFFLE9BQW1CLEVBQUUsRUFBRSxhQUFzQixLQUFLLEVBQUUsUUFBK0I7UUFDbkgsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBRSxLQUFLLENBQUUsSUFBSSxFQUFFLEVBQ3pDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDTixRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWxCLE9BQU8sRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUM3QixJQUFJLFFBQVEsQ0FBRSxDQUFDLENBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUs7Z0JBQzVDLFVBQVUsRUFBRTtnQkFDWixRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNoQixNQUFNO2FBQ047U0FDRDtRQUVELFFBQVEsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFFLFFBQVEsQ0FBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFV0aWxzIGZyb20gXCIuL3V0aWxzL1V0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJFdmVudCB7XG5cdHByaXZhdGUgX2V2ZW50czogeyBbIGtleTogc3RyaW5nIF06IEFycmF5PEZ1bmN0aW9uPiB9ID0ge307XG5cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKCkge1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGV2ZW50IGhhbmRsZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgbmFtZS5cblx0ICogQHBhcmFtIGhhbmRsZXIgVGhlIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24uXG5cdCAqL1xuXHRvbihldmVudDogc3RyaW5nLCBoYW5kbGVyOiAodGhpczogdGhpcywgLi4uYXJnczogYW55W10pID0+IHZvaWQgfCBib29sZWFuKSB7XG5cdFx0aWYgKCF0aGlzLl9ldmVudHNbIGV2ZW50IF0pIHtcblx0XHRcdHRoaXMuX2V2ZW50c1sgZXZlbnQgXSA9IFtdO1xuXHRcdH1cblxuXHRcdGlmICghVXRpbHMuaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcIltPV2ViRXZlbnRdIGhhbmRsZXIgc2hvdWxkIGJlIGZ1bmN0aW9uLlwiKTtcblx0XHR9XG5cblx0XHR0aGlzLl9ldmVudHNbIGV2ZW50IF0ucHVzaChoYW5kbGVyKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlci5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBuYW1lLlxuXHQgKiBAcGFyYW0gaGFuZGxlciBUaGUgZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cblx0ICovXG5cdG9mZihldmVudDogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbikge1xuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGlmIChVdGlscy5pc1N0cmluZyhldmVudCkpIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuX2V2ZW50c1sgZXZlbnQgXTtcblx0XHRcdH0gZWxzZSBpZiAoVXRpbHMuaXNGdW5jdGlvbihldmVudCkpIHtcblx0XHRcdFx0aGFuZGxlciA9IGV2ZW50O1xuXHRcdFx0XHRmb3IgKGxldCBldiBpbiB0aGlzLl9ldmVudHMpIHtcblx0XHRcdFx0XHRsZXQgaGFuZGxlcnMgPSB0aGlzLl9ldmVudHNbIGV2IF07XG5cdFx0XHRcdFx0bGV0IGkgPSBoYW5kbGVycy5sZW5ndGg7XG5cdFx0XHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHRcdFx0aWYgKGhhbmRsZXJzWyBpIF0gPT09IGhhbmRsZXIpIHtcblx0XHRcdFx0XHRcdFx0aGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKFV0aWxzLmlzU3RyaW5nKGV2ZW50KSAmJiBVdGlscy5pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG5cdFx0XHRsZXQgaGFuZGxlcnMgPSB0aGlzLl9ldmVudHNbIGV2ZW50IF0gfHwgW107XG5cdFx0XHRsZXQgaSA9IGhhbmRsZXJzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzWyBpIF0gPT09IGhhbmRsZXIpIHtcblx0XHRcdFx0XHRoYW5kbGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VyIGFuIGV2ZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG5cdCAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGV2ZW50IGhhbmRsZXJzLlxuXHQgKiBAcGFyYW0gY2FuY2VsYWJsZSBXaGVuIHRydWUgdGhlIGV2ZW50IHdpbGwgc3RvcCB3aGVuIGEgaGFuZGxlciByZXR1cm5zIGZhbHNlLlxuXHQgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrXG5cdCAqL1xuXHRwcm90ZWN0ZWQgdHJpZ2dlcihldmVudDogc3RyaW5nLCBkYXRhOiBBcnJheTxhbnk+ID0gW10sIGNhbmNlbGFibGU6IGJvb2xlYW4gPSBmYWxzZSwgY2FsbGJhY2s/OiAodGhpczogdGhpcykgPT4gdm9pZCkge1xuXHRcdGxldCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1sgZXZlbnQgXSB8fCBbXSxcblx0XHRcdGkgPSAtMSxcblx0XHRcdGNhbmNlbGVkID0gZmFsc2U7XG5cblx0XHR3aGlsZSAoKytpIDwgaGFuZGxlcnMubGVuZ3RoKSB7XG5cdFx0XHRpZiAoaGFuZGxlcnNbIGkgXS5hcHBseSh0aGlzLCBkYXRhKSA9PT0gZmFsc2UgJiZcblx0XHRcdFx0Y2FuY2VsYWJsZSkge1xuXHRcdFx0XHRjYW5jZWxlZCA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNhbGxiYWNrICYmIFV0aWxzLmNhbGxiYWNrKGNhbGxiYWNrLCBbIGNhbmNlbGVkIF0sIHRoaXMpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cbiJdfQ==