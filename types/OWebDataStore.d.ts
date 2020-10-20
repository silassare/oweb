import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
export declare type OJSONSerializable = string | number | boolean | Date | {
    [key: string]: OJSONSerializable;
} | OJSONSerializable[];
export default class OWebDataStore extends OWebEvent {
    private readonly _appContext;
    static readonly EVT_DATA_STORE_CLEARED: string;
    private readonly _key;
    private _data;
    constructor(_appContext: OWebApp);
    /**
     * Sets key/value pair in the store.
     *
     * @param key The data key name.
     * @param value The data value.
     */
    set(key: string, value: OJSONSerializable): boolean;
    /**
     * Gets data with the given key.
     *
     * When the key is a regexp all data with a key name that match the given
     * regexp will be returned in an object.
     *
     * @param key The data key name.
     */
    get(key: string | RegExp): any;
    /**
     * Removes data with the given key.
     *
     * When the key is a regexp all data with a key name that match the given
     * regexp will be removed.
     *
     * @param key
     */
    remove(key: string | RegExp): boolean;
    /**
     * Clear the data store.
     */
    clear(): boolean;
    /**
     * Register data store clear event handler.
     *
     * @param cb
     */
    onClear(cb: (this: this) => void): this;
    /**
     * Helper to make data store persistent.
     *
     * @private
     */
    private _persist;
}
