import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import { OJSONValue } from './OWebDataStore';
export default class OWebConfigs<P extends {
    [key: string]: OJSONValue;
}, U extends {
    [key: string]: OJSONValue;
}, B = U & P> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_CONFIG_CHANGE: string;
    private readonly _tagName;
    private readonly _defaultUserConfigs;
    private readonly _appConfigs;
    private _usersConfigs;
    constructor(_appContext: OWebApp, appConfigs: P, userConfigs: U);
    /**
     * Resets a given config to its default value.
     *
     * @param config
     */
    resetToDefault<T extends keyof U>(config: T): this;
    /**
     * Resets all configs to their default values.
     *
     * @param confirmFirst When true a confirm will request will be sent to the user.
     */
    resetAllToDefault(confirmFirst?: boolean): this;
    /**
     * Gets a config value.
     *
     * @param config
     */
    get<T extends keyof B>(config: T): B[T];
    /**
     * Updates a given config with the given value.
     *
     * @param config The config name.
     * @param value The new value.
     */
    set<T extends keyof U>(config: T, value: U[T]): this;
    /**
     * Load all saved configs.
     *
     * @private
     */
    private _loadSavedConfigs;
    /**
     * Checks if the config is an app config name.
     *
     * @param config
     * @private
     */
    private _isAppConfig;
    /**
     * Checks if the config exists.
     *
     * @param config
     * @private
     */
    private _assertDefined;
}
