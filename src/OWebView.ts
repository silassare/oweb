import OWebEvent from './OWebEvent';
import { id, logger } from './utils';
import { OApiResponse } from './ozone';
import { ONetError } from './OWebNet';

export type OViewDialog = {
	type: 'info' | 'error' | 'done';
	text: string;
	data?: Record<string, unknown>;
};

export default class OWebView extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_VIEW_FREEZE = id();
	static readonly EVT_VIEW_UNFREEZE = id();
	static readonly EVT_VIEW_DIALOG = id();

	private _freezeCounter = 0;

	constructor() {
		super();
		logger.info('[OWebView] ready!');
	}

	/**
	 * Checks if the view is frozen.
	 */
	isFrozen(): boolean {
		return Boolean(this._freezeCounter);
	}

	/**
	 * To freeze the view.
	 */
	freeze(): this {
		++this._freezeCounter;

		if (this._freezeCounter === 1) {
			this.trigger(OWebView.EVT_VIEW_FREEZE);
		}

		return this;
	}

	/**
	 * Unfreeze the view.
	 */
	unfreeze(): this {
		if (this.isFrozen()) {
			--this._freezeCounter;

			if (!this.isFrozen()) {
				this.trigger(OWebView.EVT_VIEW_UNFREEZE);
			}
		}

		return this;
	}

	/**
	 * Trigger dialog event to the view.
	 * @param dialog
	 * @param canUseAlert
	 */
	dialog(
		dialog: OViewDialog | OApiResponse<any> | ONetError,
		canUseAlert = false
	): void {
		let d = dialog;

		if ((d as OApiResponse<any>).error) {
			d = {
				type: (d as OApiResponse<any>).error ? 'error' : 'done',
				text: (d as OApiResponse<any>).msg,
				data: d.data || {},
			};
		}

		this.trigger(OWebView.EVT_VIEW_DIALOG, [d, canUseAlert]);
	}

	/**
	 * Register freeze event handler.
	 *
	 * @param handler
	 */
	onFreeze(handler: (this: this) => void): this {
		return this.on(OWebView.EVT_VIEW_FREEZE, handler);
	}

	/**
	 * Register unfreeze event handler.
	 *
	 * @param handler
	 */
	onUnFreeze(handler: (this: this) => void): this {
		return this.on(OWebView.EVT_VIEW_UNFREEZE, handler);
	}

	/**
	 * Register dialog event handler.
	 *
	 * @param handler
	 */
	onDialog(
		handler: (this: this, dialog: OViewDialog, canUseAlert: boolean) => void
	): this {
		return this.on(OWebView.EVT_VIEW_DIALOG, handler);
	}
}
