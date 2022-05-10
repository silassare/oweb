import OWebEvent from './OWebEvent';
import { OApiResponse } from './ozone';
import { ONetError } from './OWebNet';
export declare type OViewDialog = {
    type: 'info' | 'error' | 'done';
    text: string;
    data?: Record<string, unknown>;
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
    dialog(dialog: OViewDialog | OApiResponse<any> | ONetError, canUseAlert?: boolean): void;
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
    onDialog(handler: (this: this, dialog: OViewDialog, canUseAlert: boolean) => void): this;
}
//# sourceMappingURL=OWebView.d.ts.map