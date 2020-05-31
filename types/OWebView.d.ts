import { IComResponse } from './OWebCom';
import OWebEvent from './OWebEvent';
export declare type tViewDialog = {
    type: 'info' | 'error' | 'done';
    text: string;
    data?: {};
};
export default class OWebView extends OWebEvent {
    static readonly SELF: string;
    static readonly EVT_VIEW_FREEZE: string;
    static readonly EVT_VIEW_UNFREEZE: string;
    static readonly EVT_VIEW_DIALOG: string;
    private _freezeCounter;
    constructor();
    /**
     * Checks if the view is frozen.
     */
    isFrozen(): boolean;
    /**
     * To freeze the view.
     */
    freeze(): this;
    /**
     * Unfreeze the view.
     */
    unfreeze(): this;
    /**
     * Trigger dialog event to the view.
     * @param dialog
     * @param canUseAlert
     */
    dialog(dialog: tViewDialog | IComResponse, canUseAlert?: boolean): void;
    /**
     * Register freeze event handler.
     *
     * @param handler
     */
    onFreeze(handler: (this: this) => void): this;
    /**
     * Register unfreeze event handler.
     *
     * @param handler
     */
    onUnFreeze(handler: (this: this) => void): this;
    /**
     * Register dialog event handler.
     *
     * @param handler
     */
    onDialog(handler: (this: this, dialog: tViewDialog, canUseAlert: boolean) => void): this;
}
