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
            throw new TypeError("OWebEvent: handler should be function.");
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
//# sourceMappingURL=OWebEvent.js.map