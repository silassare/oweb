export default class OWebError extends Error {
	readonly data: any;

	/**
	 * OWebError constructor.
	 *
	 * @param message
	 * @param data
	 */
	constructor(message?: Error | string, data: any = {}) {
		if (message instanceof Error) {
			const e = message;

			super(e.message);
			this.message = e.message;
			this.stack = e.stack;
		} else {
			super(message);

			this.message = message || '[OWebError] something went wrong.';
			this.stack = new Error().stack;
		}
		this.data = data;
	}
}
