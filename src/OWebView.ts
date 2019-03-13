import {iComResponse} from "./OWebCom";
import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";

export type tViewDialog = {
	type: "info" | "error" | "done",
	text: string,
	data?: {}
};

export default class OWebView extends OWebEvent {

	static readonly SELF              = Utils.id();
	static readonly EVT_VIEW_FREEZE   = Utils.id();
	static readonly EVT_VIEW_UNFREEZE = Utils.id();
	static readonly EVT_VIEW_DIALOG   = Utils.id();

	private _freeze_counter: number = 0;

	constructor() {
		super();
		console.log("[OWebView] ready!");
	}

	/**
	 * Check if the view is frozen.
	 */
	isFrozen(): boolean {
		return Boolean(this._freeze_counter);
	}

	/**
	 * To freeze the view.
	 */
	freeze() {
		++this._freeze_counter;

		if (this._freeze_counter === 1) {
			this.trigger(OWebView.EVT_VIEW_FREEZE);
		}

		return this;
	}

	/**
	 * Unfreeze the view.
	 */
	unfreeze() {
		if (this.isFrozen()) {
			--this._freeze_counter;

			if (!this.isFrozen()) {
				this.trigger(OWebView.EVT_VIEW_UNFREEZE);
			}
		}

		return this;
	}

	/**
	 * Trigger dialog event to the view.
	 * @param dialog
	 * @param can_use_alert
	 */
	dialog(dialog: tViewDialog | iComResponse, can_use_alert: boolean = false) {
		let d = dialog;

		if ((d as iComResponse).error) {
			d = {
				"type": (d as iComResponse).error ? "error" : "done",
				"text": (d as iComResponse).msg,
				"data": d.data || {}
			};
		}

		this.trigger(OWebView.EVT_VIEW_DIALOG, [d, can_use_alert]);
	}

	/**
	 * Register freeze event handler.
	 *
	 * @param handler
	 */
	onFreeze(handler: () => void) {
		return this.on(OWebView.EVT_VIEW_FREEZE, handler);
	}

	/**
	 * Register unfreeze event handler.
	 *
	 * @param handler
	 */
	onUnFreeze(handler: () => void) {
		return this.on(OWebView.EVT_VIEW_UNFREEZE, handler);
	}

	/**
	 * Register dialog event handler.
	 *
	 * @param handler
	 */
	onDialog(handler: (dialog: tViewDialog, can_use_alert: boolean) => void) {
		return this.on(OWebView.EVT_VIEW_DIALOG, handler);
	}
}