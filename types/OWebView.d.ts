import { tComResponse } from "./OWebCom";
import OWebEvent from "./OWebEvent";
export declare type tViewDialog = {
    type: "info" | "error" | "done";
    text: string;
    data?: {};
};
export default class OWebView extends OWebEvent {
    static readonly EVT_VIEW_FREEZE: string;
    static readonly EVT_VIEW_UNFREEZE: string;
    static readonly EVT_VIEW_DIALOG: string;
    static readonly SELF: string;
    private _freeze_counter;
    constructor();
    isFrozen(): boolean;
    freeze(): this;
    unfreeze(): this;
    dialog(dialog: tViewDialog | tComResponse): void;
}
