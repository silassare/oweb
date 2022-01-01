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
    isFrozen(): boolean;
    freeze(): this;
    unfreeze(): this;
    dialog(dialog: OViewDialog | OApiResponse<any> | ONetError, canUseAlert?: boolean): void;
    onFreeze(handler: (this: this) => void): this;
    onUnFreeze(handler: (this: this) => void): this;
    onDialog(handler: (this: this, dialog: OViewDialog, canUseAlert: boolean) => void): this;
}
