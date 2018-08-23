import {iComResponse, OWebEvent} from "./oweb";

export type tViewDialog = {
	type: "info" | "error" | "done",
	text: string,
	data?: {}
};

export default class OWebView extends OWebEvent {

	static readonly EVT_VIEW_FREEZE   = "OWebView:freeze";
	static readonly EVT_VIEW_UNFREEZE = "OWebView:unfreeze";
	static readonly EVT_VIEW_DIALOG   = "OWebView:dialog";
	static readonly SELF              = "OWebView";

	private _freeze_counter: number = 0;

	constructor() {
		super();
		console.log("[OWebView] ready!");
	}

	isFrozen(): boolean {
		return Boolean(this._freeze_counter);
	}

	freeze() {
		++this._freeze_counter;

		if (this._freeze_counter === 1) {
			this.trigger(OWebView.EVT_VIEW_FREEZE);
		}

		return this;
	}

	unfreeze() {
		if (this.isFrozen()) {
			--this._freeze_counter;

			if (!this.isFrozen()) {
				this.trigger(OWebView.EVT_VIEW_UNFREEZE);
			}
		}

		return this;
	}

	dialog(dialog: tViewDialog | iComResponse) {
		let d = dialog;

		if ((d as iComResponse).error) {
			d = {
				"type": (d as iComResponse).error ? "error" : "done",
				"text": (d as iComResponse).msg,
				"data": d.data || {}
			};

			// console.error("[OWebView] please use new dialog mode -> ", d, "instead of ->", dialog);
		}

		this.trigger(OWebView.EVT_VIEW_DIALOG, [d]);
	}
}