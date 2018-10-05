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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFFbEMsTUFBTSxDQUFDLE9BQU87SUFHYjtRQUZRLGdCQUFXLEdBQXVDLEVBQUUsQ0FBQztJQUc3RCxDQUFDO0lBRUQsRUFBRSxDQUFDLEtBQWEsRUFBRSxPQUFpQjtRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM3QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUM3QjtRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxTQUFTLENBQUMseUNBQXlDLENBQUMsQ0FBQztTQUMvRDtRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXRDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFhLEVBQUUsT0FBaUI7UUFFbkMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMzQixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMvQjtpQkFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ2hCLEtBQUssSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDaEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLEdBQVUsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDL0IsT0FBTyxDQUFDLEVBQUUsRUFBRTt3QkFDWCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7NEJBQzVCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUN0QixNQUFNO3lCQUNOO3FCQUNEO2lCQUNEO2FBQ0Q7U0FDRDthQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzlELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdDLElBQUksQ0FBQyxHQUFVLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDL0IsT0FBTyxDQUFDLEVBQUUsRUFBRTtnQkFDWCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7b0JBQzVCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN0QixNQUFNO2lCQUNOO2FBQ0Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVTLE9BQU8sQ0FBQyxLQUFhLEVBQUUsT0FBbUIsRUFBRSxFQUFFLGFBQXNCLEtBQUssRUFBRSxRQUFtQjtRQUN2RyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFDM0MsQ0FBQyxHQUFVLENBQUMsQ0FBQyxFQUNiLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFFbEIsT0FBTyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQzdCLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssS0FBSztnQkFDMUMsVUFBVSxFQUFFO2dCQUNaLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLE1BQU07YUFDTjtTQUNEO1FBRUQsUUFBUSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVqRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBVdGlscyBmcm9tIFwiLi91dGlscy9VdGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRXZlbnQge1xuXHRwcml2YXRlIF9hcHBfZXZlbnRzOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PEZ1bmN0aW9uPiB9ID0ge307XG5cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKCkge1xuXHR9XG5cblx0b24oZXZlbnQ6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcblx0XHRpZiAoIXRoaXMuX2FwcF9ldmVudHNbZXZlbnRdKSB7XG5cdFx0XHR0aGlzLl9hcHBfZXZlbnRzW2V2ZW50XSA9IFtdO1xuXHRcdH1cblxuXHRcdGlmICghVXRpbHMuaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcIltPV2ViRXZlbnRdIGhhbmRsZXIgc2hvdWxkIGJlIGZ1bmN0aW9uLlwiKTtcblx0XHR9XG5cblx0XHR0aGlzLl9hcHBfZXZlbnRzW2V2ZW50XS5wdXNoKGhhbmRsZXIpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRvZmYoZXZlbnQ6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcblxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRpZiAoVXRpbHMuaXNTdHJpbmcoZXZlbnQpKSB7XG5cdFx0XHRcdGRlbGV0ZSB0aGlzLl9hcHBfZXZlbnRzW2V2ZW50XTtcblx0XHRcdH0gZWxzZSBpZiAoVXRpbHMuaXNGdW5jdGlvbihldmVudCkpIHtcblx0XHRcdFx0aGFuZGxlciA9IGV2ZW50O1xuXHRcdFx0XHRmb3IgKGxldCBldiBpbiB0aGlzLl9hcHBfZXZlbnRzKSB7XG5cdFx0XHRcdFx0bGV0IGhhbmRsZXJzID0gdGhpcy5fYXBwX2V2ZW50c1tldl07XG5cdFx0XHRcdFx0bGV0IGkgICAgICAgID0gaGFuZGxlcnMubGVuZ3RoO1xuXHRcdFx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0XHRcdGlmIChoYW5kbGVyc1tpXSA9PT0gaGFuZGxlcikge1xuXHRcdFx0XHRcdFx0XHRoYW5kbGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoVXRpbHMuaXNTdHJpbmcoZXZlbnQpICYmIFV0aWxzLmlzRnVuY3Rpb24oaGFuZGxlcikpIHtcblx0XHRcdGxldCBoYW5kbGVycyA9IHRoaXMuX2FwcF9ldmVudHNbZXZlbnRdIHx8IFtdO1xuXHRcdFx0bGV0IGkgICAgICAgID0gaGFuZGxlcnMubGVuZ3RoO1xuXHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHRpZiAoaGFuZGxlcnNbaV0gPT09IGhhbmRsZXIpIHtcblx0XHRcdFx0XHRoYW5kbGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHByb3RlY3RlZCB0cmlnZ2VyKGV2ZW50OiBzdHJpbmcsIGRhdGE6IEFycmF5PGFueT4gPSBbXSwgY2FuY2VsYWJsZTogYm9vbGVhbiA9IGZhbHNlLCBjYWxsYmFjaz86IEZ1bmN0aW9uKSB7XG5cdFx0bGV0IGhhbmRsZXJzID0gdGhpcy5fYXBwX2V2ZW50c1tldmVudF0gfHwgW10sXG5cdFx0XHRpICAgICAgICA9IC0xLFxuXHRcdFx0Y2FuY2VsZWQgPSBmYWxzZTtcblxuXHRcdHdoaWxlICgrK2kgPCBoYW5kbGVycy5sZW5ndGgpIHtcblx0XHRcdGlmIChoYW5kbGVyc1tpXS5hcHBseSh0aGlzLCBkYXRhKSA9PT0gZmFsc2UgJiZcblx0XHRcdFx0Y2FuY2VsYWJsZSkge1xuXHRcdFx0XHRjYW5jZWxlZCA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNhbGxiYWNrICYmIFV0aWxzLmNhbGxiYWNrKGNhbGxiYWNrLCBbY2FuY2VsZWRdKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59Il19