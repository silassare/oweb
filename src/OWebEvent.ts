import { isFunction, isString } from './utils';

export type OEventHandler = (...args: any[]) => void | boolean;

export default class OWebEvent {
	private _events: { [key: string]: OEventHandler[] } = {};

	/**
	 * Register event handler.
	 *
	 * @param event The event name.
	 * @param handler The event handler function.
	 */
	on(
		event: string,
		handler: (this: this, ...args: any[]) => ReturnType<OEventHandler>
	): this {
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
	off(event: string, handler: () => void): this {
		if (arguments.length === 1) {
			if (isString(event)) {
				delete this._events[event];
			} else if (isFunction(event)) {
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
		} else if (isString(event) && isFunction(handler)) {
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
	protected trigger(
		event: string,
		data: any[] = [],
		cancelable = false,
		context: any = this
	): boolean {
		const handlers = this._events[event] || [];
		let i = -1,
			canceled = false;

		while (++i < handlers.length) {
			if (handlers[i].apply(context, data) === false && cancelable) {
				canceled = true;
				break;
			}
		}

		return !canceled;
	}
}
