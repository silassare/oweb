import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import { OJSONValue } from './OWebDataStore';
export default class OWebKeyStorage extends OWebEvent {
    private readonly _appContext;
    private readonly tagName;
    private persistent;
    private readonly _maxLifeTime;
    private _store;
    constructor(_appContext: OWebApp, tagName: string, persistent?: boolean, maxLifeTime?: number);
    getStoreData(): Record<string, OJSONValue>;
    getItem(key: string): OJSONValue | null;
    setItem(key: string, value: OJSONValue): this;
    removeItem(key: string): this;
    private _save;
    clear(): this;
    private _clearExpired;
}
