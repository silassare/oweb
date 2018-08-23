import { OWebApp, OWebEvent } from "./oweb";
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
    loadConfigs(configs: tConfigList): this;
    resetToDefault(config: string): this;
    resetAllToDefault(): void;
    get(config: string): any;
    set(config: string, value: any): this;
    private _loadSavedConfigs;
    private _set;
    private _realConfigName;
    private _isPublic;
    private _warnUndefined;
}
