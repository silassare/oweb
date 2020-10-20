export default class OWebError extends Error {
	readonly data: any;

	/**
	 * OWebError constructor.
	 *
	 * @param message
	 * @param data
	 */
	constructor(message: any, data: any = {}) {
		super(message);
		this.data = data;

		if (message instanceof Error) {
			const e = message;
			this.message = e.message;
			this.stack = e.stack;
		} else {
			this.message = message || '[OWebCustomError] something went wrong.';
			this.stack = new Error().stack;
		}
	}
}
