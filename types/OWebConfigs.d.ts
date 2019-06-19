import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
export declare type tConfigList = {
    [key: string]: any;
};
export default class OWebConfigs extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_CONFIG_CHANGE: string;
    private readonly _default_configs;
    private readonly _user_configs;
    private readonly _private_configs_map;
    private readonly _tag_name;
    constructor(app_context: OWebApp, configs: tConfigList);
    /**
     * Load config list.
     *
     * @param configs
     */
    loadConfigs(configs: tConfigList): this;
    /**
     * Resets a given config to its default value.
     *
     * @param config
     */
    resetToDefault(config: string): this;
    /**
     * Resets all configs to their default values.
     *
     * @param confirm_first When true a confirm will request will be sent to the user.
     */
    resetAllToDefault(confirm_first?: boolean): void;
    /**
     * Gets a config value.
     *
     * @param config
     */
    get(config: string): any;
    /**
     * Updates a given config with the given value.
     *
     * @param config The config name.
     * @param value The new value.
     */
    set(config: string, value: any): this;
    /**
     * Load all saved configs.
     *
     * @private
     */
    private _loadSavedConfigs;
    /**
     * Helper used to set config value.
     *
     * @param config
     * @param value
     * @private
     */
    private _set;
    /**
     * Removes prefix and returns real config name.
     *
     * @param config
     * @private
     */
    private _realConfigName;
    /**
     * Checks if the config is a public config name.
     *
     * @param config
     * @private
     */
    private _isPublic;
    /**
     * Checks if the config exists.
     *
     * @param config
     * @private
     */
    private _warnUndefined;
}
