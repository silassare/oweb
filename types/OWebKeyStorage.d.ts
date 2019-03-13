import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
export default class OWebKeyStorage extends OWebEvent {
    private readonly app_context;
    private readonly tag_name;
    private persistent;
    private readonly _max_life_time;
    private _store;
    /**
     * @param app_context The app context.
     * @param tag_name The key storage name.
     * @param persistent True to persists the key storage data.
     * @param max_life_time The duration in seconds until key data deletion.
     */
    constructor(app_context: OWebApp, tag_name: string, persistent?: boolean, max_life_time?: number);
    /**
     * Returns the key storage data.
     */
    getStoreData(): {};
    /**
     * Returns a given key value.
     *
     * @param key The key name.
     */
    getItem(key: string): any;
    /**
     * Sets an item to the key storage.
     *
     * @param key The key name.
     * @param value The key value.
     */
    setItem(key: string, value: any): this;
    /**
     * Removes item from the key storage.
     *
     * @param key The item key name.
     */
    removeItem(key: string): this;
    /**
     * Save the key storage.
     */
    private _save;
    /**
     * Clear the key storage.
     */
    clear(): this;
    /**
     * Helper to clear all expired value from the key storage.
     *
     * @private
     */
    private _clearExpired;
}
