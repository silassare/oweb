import OWebEvent from "./OWebEvent";
import OWebApp from "./OWebApp";
export default class OWebKeyStorage extends OWebEvent {
    private readonly app_context;
    private persistent;
    private readonly _tag_name;
    private readonly _max_life_time;
    private _store;
    constructor(app_context: OWebApp, tag: string, persistent?: boolean, max_life_time?: number);
    getStoreData(): {};
    getItem(key: string): any;
    setItem(key: string, value: any): this;
    removeItem(key: string): this;
    private save;
    clear(): this;
    private _clearExpired;
}
