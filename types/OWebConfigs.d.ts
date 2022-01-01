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
    resetToDefault<T extends keyof U>(config: T): this;
    resetAllToDefault(confirmFirst?: boolean): this;
    get<T extends keyof B>(config: T): B[T];
    set<T extends keyof U>(config: T, value: U[T]): this;
    private _loadSavedConfigs;
    private _isAppConfig;
    private _assertDefined;
}
