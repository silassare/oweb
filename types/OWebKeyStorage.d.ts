import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
export default class OWebKeyStorage extends OWebEvent {
    private readonly _appContext;
    private readonly tagName;
    private persistent;
    private readonly _maxLifeTime;
    private _store;
    /**
     * @param _appContext The app context.
     * @param tagName The key storage name.
     * @param persistent True to persists the key storage data.
     * @param maxLifeTime The duration in seconds until key data deletion.
     */
    constructor(_appContext: OWebApp, tagName: string, persistent?: boolean, maxLifeTime?: number);
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
