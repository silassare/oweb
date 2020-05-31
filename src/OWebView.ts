import { IComResponse } from './OWebCom';
import OWebEvent from './OWebEvent';
import { id } from './utils/Utils';

export type tViewDialog = {
	type: 'info' | 'error' | 'done';
	text: string;
	data?: {};
};

export default class OWebView extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_VIEW_FREEZE = id();
	static readonly EVT_VIEW_UNFREEZE = id();
	static readonly EVT_VIEW_DIALOG = id();

	private _freezeCounter: number = 0;

	constructor() {
		super();
		console.log('[OWebView] ready!');
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
	freeze() {
		++this._freezeCounter;

		if (this._freezeCounter === 1) {
			this.trigger(OWebView.EVT_VIEW_FREEZE);
		}

		return this;
	}

	/**
	 * Unfreeze the view.
	 */
	unfreeze() {
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
	dialog(dialog: tViewDialog | IComResponse, canUseAlert: boolean = false) {
		let d = dialog;

		if ((d as IComResponse).error) {
			d = {
				type: (d as IComResponse).error ? 'error' : 'done',
				text: (d as IComResponse).msg,
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
	onFreeze(handler: (this: this) => void) {
		return this.on(OWebView.EVT_VIEW_FREEZE, handler);
	}

	/**
	 * Register unfreeze event handler.
	 *
	 * @param handler
	 */
	onUnFreeze(handler: (this: this) => void) {
		return this.on(OWebView.EVT_VIEW_UNFREEZE, handler);
	}

	/**
	 * Register dialog event handler.
	 *
	 * @param handler
	 */
	onDialog(
		handler: (
			this: this,
			dialog: tViewDialog,
			canUseAlert: boolean,
		) => void,
	) {
		return this.on(OWebView.EVT_VIEW_DIALOG, handler);
	}
}
