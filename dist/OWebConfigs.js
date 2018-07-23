"use strict";
import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";
import OWebDataStore from "./OWebDataStore";
import OWebLang from "./OWebLang";
export default class OWebConfigs extends OWebEvent {
    constructor(app_context, configs) {
        super();
        this.app_context = app_context;
        this._default_configs = {};
        this._user_configs = {};
        this._private_configs_map = {};
        this._tag_name = app_context.getAppName() + ":user_configs";
        this.loadConfigs(configs);
        this._loadSavedConfigs();
        console.log("[OWebConfigs] ready!");
    }
    loadConfigs(configs) {
        let s = this;
        Utils.forEach(configs, (cfg, value) => {
            cfg = s._realConfigName(cfg);
            s._user_configs[cfg] = s._default_configs[cfg] = value;
        });
        return s;
    }
    resetToDefault(config) {
        if (config in this._default_configs) {
            this.set(config, this._default_configs[config]);
        }
        return this;
    }
    resetAllToDefault() {
        if (confirm(OWebLang.toHuman("OZ_CONFIRM_RESET_CONFIGS"))) {
            OWebDataStore.save(this._tag_name, this._default_configs);
            this.app_context.reloadApp();
        }
    }
    get(config) {
        this._warnUndefined(config);
        return this._user_configs[config];
    }
    set(config, value) {
        let m = this;
        if (Utils.isPlainObject(config)) {
            Utils.forEach(config, (key, value) => {
                m._set(key, value);
            });
        }
        else {
            m._set(config, value);
        }
        OWebDataStore.save(this._tag_name, this._user_configs);
        return this;
    }
    _loadSavedConfigs() {
        let m = this, saved_cfg = OWebDataStore.load(this._tag_name) || {};
        Utils.forEach(m._default_configs, (key) => {
            if (this._isPublic(key) && saved_cfg[key] !== undefined) {
                m._user_configs[key] = saved_cfg[key];
            }
        });
        OWebDataStore.save(this._tag_name, m._user_configs);
    }
    _set(config, value) {
        this._warnUndefined(config);
        if (!this._isPublic(config)) {
            throw new Error(`[OWebConfigs] can't overwrite config "${config}" permission denied.`);
        }
        if (config in this._user_configs) {
            this._user_configs[config] = value;
            this.trigger(OWebConfigs.EVT_CONFIG_CHANGE, [config, value, this]);
        }
    }
    _realConfigName(config) {
        if (config[0] === "!") {
            config = config.substr(1);
            this._private_configs_map[config] = 1;
        }
        return config;
    }
    _isPublic(config) {
        return undefined === this._private_configs_map[config];
    }
    _warnUndefined(config) {
        if (!(config in this._user_configs)) {
            console.warn(`[OWebConfigs] config "${config}" is not defined.`);
        }
    }
}
OWebConfigs.SELF = "OWebConfigs";
OWebConfigs.EVT_CONFIG_CHANGE = "OWebConfigs:change";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbmZpZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkNvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDO0FBRWIsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQUVsQyxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUM7QUFJbEMsTUFBTSxDQUFDLE9BQU8sa0JBQW1CLFNBQVEsU0FBUztJQVNqRCxZQUE2QixXQUFvQixFQUFFLE9BQW9CO1FBQ3RFLEtBQUssRUFBRSxDQUFDO1FBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBTGhDLHFCQUFnQixHQUFvQixFQUFFLENBQUM7UUFDdkMsa0JBQWEsR0FBdUIsRUFBRSxDQUFDO1FBQ3ZDLHlCQUFvQixHQUFnQixFQUFFLENBQUM7UUFLdkQsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsVUFBVSxFQUFFLEdBQUcsZUFBZSxDQUFDO1FBRTVELElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBb0I7UUFDL0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRWIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFXLEVBQUUsS0FBVSxFQUFFLEVBQUU7WUFDbEQsR0FBRyxHQUFvQixDQUFDLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztR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