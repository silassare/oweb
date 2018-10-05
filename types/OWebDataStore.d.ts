import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
export default class OWebDataStore extends OWebEvent {
    private readonly _app_context;
    static readonly EVT_DATA_STORE_CLEAR: string;
    private readonly key;
    private data;
    constructor(_app_context: OWebApp);
    save(keyName: string, data: any): boolean;
    _persist(): boolean;
    load(keyName: string): any;
    remove(keyName: string): boolean;
    clear(): boolean;
    onClear(cb: () => void): this;
}
