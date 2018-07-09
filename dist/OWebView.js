"use strict";
import OWebEvent from "./OWebEvent";
export default class OWebView extends OWebEvent {
    constructor() {
        super();
        this._freeze_counter = 0;
    }
    isFrozen() {
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
    dialog(dialog) {
        let d = dialog;
        if (dialog.error) {
            d = {
                "type": dialog.error ? "error" : "done",
                "text": dialog.msg,
                "data": dialog.data || {}
            };
            console.error("Please use new dialog mode -> ", d, "instead of ->", dialog);
        }
        this.trigger(OWebView.EVT_VIEW_DIALOG, [d]);
    }
}
OWebView.EVT_VIEW_FREEZE = "OWebView:freeze";
OWebView.EVT_VIEW_UNFREEZE = "OWebView:unfreeze";
OWebView.EVT_VIEW_DIALOG = "OWebView:dialog";
OWebView.SELF = "OWebView";
//# sourceMappingURL=OWebView.js.map