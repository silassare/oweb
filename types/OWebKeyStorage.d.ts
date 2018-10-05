import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
export default class OWebKeyStorage extends OWebEvent {
    private readonly app_context;
    private readonly tag_name;
    private persistent;
    private readonly _max_life_time;
    private _store;
    constructor(app_context: OWebApp, tag_name: string, persistent?: boolean, max_life_time?: number);
    getStoreData(): {};
    getItem(key: string): any;
    setItem(key: string, value: any): this;
    removeItem(key: string): this;
    private save;
    clear(): this;
    private _clearExpired;
}
