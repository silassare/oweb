import Utils from "./utils/Utils";

export default class OWebEvent {
	private _app_events: { [key: string]: Array<Function> } = {};

	protected constructor() {
	}

	/**
	 * Register event handler.
	 *
	 * @param event The event name.
	 * @param handler The event handler function.
	 */
	on(event: string, handler: (this: this, ...args: any[]) => void | boolean) {
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
	off(event: string, handler: Function) {

		if (arguments.length === 1) {
			if (Utils.isString(event)) {
				delete this._app_events[event];
			} else if (Utils.isFunction(event)) {
				handler = event;
				for (let ev in this._app_events) {
					let handlers = this._app_events[ev];
					let i        = handlers.length;
					while (i--) {
						if (handlers[i] === handler) {
							handlers.splice(i, 1);
							break;
						}
					}
				}
			}
		} else if (Utils.isString(event) && Utils.isFunction(handler)) {
			let handlers = this._app_events[event] || [];
			let i        = handlers.length;
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
	protected trigger(event: string, data: Array<any> = [], cancelable: boolean = false, callback?: (this: this) => void) {
		let handlers = this._app_events[event] || [],
			i        = -1,
			canceled = false;

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