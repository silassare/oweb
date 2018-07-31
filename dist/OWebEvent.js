"use strict";
import Utils from "./utils/Utils";
export default class OWebEvent {
    constructor() {
        this._app_events = {};
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFFYixPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFFbEMsTUFBTSxDQUFDLE9BQU87SUFHYjtRQUZRLGdCQUFXLEdBQXVDLEVBQUUsQ0FBQztJQUc3RCxDQUFDO0lBRUQsRUFBRSxDQUFDLEtBQWEsRUFBRSxPQUFpQjtRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM3QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUM3QjtRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxTQUFTLENBQUMseUNBQXlDLENBQUMsQ0FBQztTQUMvRDtRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFhLEVBQUUsT0FBaUI7UUFFbkMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMzQixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMvQjtpQkFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLEtBQUssSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDaEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLEdBQVUsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDL0IsT0FBTyxDQUFDLEVBQUUsRUFBRTt3QkFDWCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7NEJBQzVCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUN0QixNQUFNO3lCQUNOO3FCQUNEO2lCQUNEO2FBQ0Q7U0FDRDthQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzlELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxHQUFVLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDL0IsT0FBTyxDQUFDLEVBQUUsRUFBRTtnQkFDWCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7b0JBQzVCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN0QixNQUFNO2lCQUNOO2FBQ0Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVTLE9BQU8sQ0FBQyxLQUFhLEVBQUUsT0FBbUIsRUFBRSxFQUFFLGFBQXNCLEtBQUssRUFBRSxRQUFtQjtRQUN2RyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFDM0MsQ0FBQyxHQUFVLENBQUMsQ0FBQyxFQUNiLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFFbEIsT0FBTyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQzdCLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssS0FBSztnQkFDMUMsVUFBVSxFQUFFO2dCQUNaLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLE1BQU07YUFDTjtTQUNEO1FBRUQsUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVqRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgVXRpbHMgZnJvbSBcIi4vdXRpbHMvVXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkV2ZW50IHtcblx0cHJpdmF0ZSBfYXBwX2V2ZW50czogeyBba2V5OiBzdHJpbmddOiBBcnJheTxGdW5jdGlvbj4gfSA9IHt9O1xuXG5cdHByb3RlY3RlZCBjb25zdHJ1Y3RvcigpIHtcblx0fVxuXG5cdG9uKGV2ZW50OiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKSB7XG5cdFx0aWYgKCF0aGlzLl9hcHBfZXZlbnRzW2V2ZW50XSkge1xuXHRcdFx0dGhpcy5fYXBwX2V2ZW50c1tldmVudF0gPSBbXTtcblx0XHR9XG5cblx0XHRpZiAoIVV0aWxzLmlzRnVuY3Rpb24oaGFuZGxlcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJbT1dlYkV2ZW50XSBoYW5kbGVyIHNob3VsZCBiZSBmdW5jdGlvbi5cIik7XG5cdFx0fVxuXG5cdFx0dGhpcy5fYXBwX2V2ZW50c1tldmVudF0ucHVzaChoYW5kbGVyKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0b2ZmKGV2ZW50OiBzdHJpbmcsIGhhbmRsZXI6IEZ1bmN0aW9uKSB7XG5cblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0aWYgKFV0aWxzLmlzU3RyaW5nKGV2ZW50KSkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5fYXBwX2V2ZW50c1tldmVudF07XG5cdFx0XHR9IGVsc2UgaWYgKFV0aWxzLmlzRnVuY3Rpb24oZXZlbnQpKSB7XG5cdFx0XHRcdGhhbmRsZXIgPSBldmVudDtcblx0XHRcdFx0Zm9yIChsZXQgZXYgaW4gdGhpcy5fYXBwX2V2ZW50cykge1xuXHRcdFx0XHRcdGxldCBoYW5kbGVycyA9IHRoaXMuX2FwcF9ldmVudHNbZXZdO1xuXHRcdFx0XHRcdGxldCBpICAgICAgICA9IGhhbmRsZXJzLmxlbmd0aDtcblx0XHRcdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdFx0XHRpZiAoaGFuZGxlcnNbaV0gPT09IGhhbmRsZXIpIHtcblx0XHRcdFx0XHRcdFx0aGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKFV0aWxzLmlzU3RyaW5nKGV2ZW50KSAmJiBVdGlscy5pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG5cdFx0XHRsZXQgaGFuZGxlcnMgPSB0aGlzLl9hcHBfZXZlbnRzW2V2ZW50XSB8fCBbXTtcblx0XHRcdGxldCBpICAgICAgICA9IGhhbmRsZXJzLmxlbmd0aDtcblx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0aWYgKGhhbmRsZXJzW2ldID09PSBoYW5kbGVyKSB7XG5cdFx0XHRcdFx0aGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRwcm90ZWN0ZWQgdHJpZ2dlcihldmVudDogc3RyaW5nLCBkYXRhOiBBcnJheTxhbnk+ID0gW10sIGNhbmNlbGFibGU6IGJvb2xlYW4gPSBmYWxzZSwgY2FsbGJhY2s/OiBGdW5jdGlvbikge1xuXHRcdGxldCBoYW5kbGVycyA9IHRoaXMuX2FwcF9ldmVudHNbZXZlbnRdIHx8IFtdLFxuXHRcdFx0aSAgICAgICAgPSAtMSxcblx0XHRcdGNhbmNlbGVkID0gZmFsc2U7XG5cblx0XHR3aGlsZSAoKytpIDwgaGFuZGxlcnMubGVuZ3RoKSB7XG5cdFx0XHRpZiAoaGFuZGxlcnNbaV0uYXBwbHkodGhpcywgZGF0YSkgPT09IGZhbHNlICYmXG5cdFx0XHRcdGNhbmNlbGFibGUpIHtcblx0XHRcdFx0Y2FuY2VsZWQgPSB0cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjYWxsYmFjayAmJiBVdGlscy5jYWxsYmFjayhjYWxsYmFjaywgW2NhbmNlbGVkXSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSJdfQ==