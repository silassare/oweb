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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFFYixPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFFbEMsTUFBTSxDQUFDLE9BQU87SUFHYjtRQUZRLGdCQUFXLEdBQXVDLEVBQUUsQ0FBQztJQUVwQyxDQUFDO0lBRTFCLEVBQUUsQ0FBQyxLQUFhLEVBQUUsT0FBaUI7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDN0I7UUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMvQixNQUFNLElBQUksU0FBUyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7U0FDL0Q7UUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0QyxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxHQUFHLENBQUMsS0FBYSxFQUFFLE9BQWlCO1FBRW5DLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMxQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDL0I7aUJBQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNuQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNoQixLQUFLLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2hDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxHQUFVLFFBQVEsQ0FBQyxNQUFNLENBQUM7b0JBQy9CLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ1gsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFOzRCQUM1QixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDdEIsTUFBTTt5QkFDTjtxQkFDRDtpQkFDRDthQUNEO1NBQ0Q7YUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM5RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsR0FBVSxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQy9CLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFO29CQUM1QixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdEIsTUFBTTtpQkFDTjthQUNEO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFUyxPQUFPLENBQUMsS0FBYSxFQUFFLE9BQW1CLEVBQUUsRUFBRSxhQUFzQixLQUFLLEVBQUUsUUFBbUI7UUFDdkcsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQzNDLENBQUMsR0FBVSxDQUFDLENBQUMsRUFDYixRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWxCLE9BQU8sRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUM3QixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUs7Z0JBQzFDLFVBQVUsRUFBRTtnQkFDWixRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNoQixNQUFNO2FBQ047U0FDRDtRQUVELFFBQVEsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFakQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0NBQ0QifQ==