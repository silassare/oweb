import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";
export default class OWebConfigs extends OWebEvent {
    constructor(app_context, configs) {
        super();
        this.app_context = app_context;
        this._default_configs = {};
        this._user_configs = {};
        this._private_configs_map = {};
        this._tag_name = "user_configs";
        this.loadConfigs(configs);
        this._loadSavedConfigs();
        console.log("[OWebConfigs] ready!");
    }
    /**
     * Loads config list.
     *
     * @param configs
     */
    loadConfigs(configs) {
        let s = this;
        Utils.forEach(configs, (value, cfg) => {
            cfg = s._realConfigName(cfg);
            s._user_configs[cfg] = s._default_configs[cfg] = value;
        });
        return s;
    }
    /**
     * Reset a given config to its default value.
     *
     * @param config
     */
    resetToDefault(config) {
        if (config in this._default_configs) {
            this.set(config, this._default_configs[config]);
        }
        return this;
    }
    /**
     * Reset all configs to their default values.
     *
     * @param confirm_first When true a confirm will request will be sent to the user.
     */
    resetAllToDefault(confirm_first = true) {
        if (confirm_first && !confirm(this.app_context.i18n.toHuman("OZ_CONFIRM_RESET_CONFIGS"))) {
            return;
        }
        this.app_context.ls.save(this._tag_name, this._default_configs);
        this.app_context.reloadApp();
    }
    /**
     * Gets a config value.
     *
     * @param config
     */
    get(config) {
        this._warnUndefined(config);
        return this._user_configs[config];
    }
    /**
     * Update a given config with the given value.
     *
     * @param config The config name.
     * @param value The new value.
     */
    set(config, value) {
        let m = this;
        if (Utils.isPlainObject(config)) {
            Utils.forEach(config, (value, key) => {
                m._set(key, value);
            });
        }
        else {
            m._set(config, value);
        }
        this.app_context.ls.save(this._tag_name, this._user_configs);
        return this;
    }
    /**
     * Loads all saved configs.
     *
     * @private
     */
    _loadSavedConfigs() {
        let m = this, saved_cfg = this.app_context.ls.load(this._tag_name) || {};
        Utils.forEach(m._default_configs, (value, key) => {
            if (this._isPublic(key) && saved_cfg[key] !== undefined) {
                m._user_configs[key] = saved_cfg[key];
            }
        });
        this.app_context.ls.save(this._tag_name, m._user_configs);
    }
    /**
     * Helper used to set config value.
     *
     * @param config
     * @param value
     * @private
     */
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
    /**
     * Remove prefix and returns real config name.
     *
     * @param config
     * @private
     */
    _realConfigName(config) {
        if (config[0] === "!") {
            config = config.substr(1);
            this._private_configs_map[config] = 1;
        }
        return config;
    }
    /**
     * Check if the config is a public config name.
     *
     * @param config
     * @private
     */
    _isPublic(config) {
        return undefined === this._private_configs_map[config];
    }
    /**
     * Check if the config exists.
     *
     * @param config
     * @private
     */
    _warnUndefined(config) {
        if (!(config in this._user_configs)) {
            console.warn(`[OWebConfigs] config "${config}" is not defined.`);
        }
    }
}
OWebConfigs.SELF = Utils.id();
OWebConfigs.EVT_CONFIG_CHANGE = Utils.id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbmZpZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkNvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQUlsQyxNQUFNLENBQUMsT0FBTyxrQkFBbUIsU0FBUSxTQUFTO0lBU2pELFlBQTZCLFdBQW9CLEVBQUUsT0FBb0I7UUFDdEUsS0FBSyxFQUFFLENBQUM7UUFEb0IsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFMaEMscUJBQWdCLEdBQW9CLEVBQUUsQ0FBQztRQUN2QyxrQkFBYSxHQUF1QixFQUFFLENBQUM7UUFDdkMseUJBQW9CLEdBQWdCLEVBQUUsQ0FBQztRQUN2QyxjQUFTLEdBQTJCLGNBQWMsQ0FBQztRQUtuRSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxPQUFvQjtRQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFYixLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQVUsRUFBRSxHQUFXLEVBQUUsRUFBRTtZQUNsRCxHQUFHLEdBQW9CLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGNBQWMsQ0FBQyxNQUFjO1FBQzVCLElBQUksTUFBTSxJ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O1lBRW5DLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ25FO0lBQ0YsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssZUFBZSxDQUFDLE1BQWM7UUFDckMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ3RCLE1BQU0sR0FBOEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxTQUFTLENBQUMsTUFBYztRQUMvQixPQUFPLFNBQVMsS0FBSyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssY0FBYyxDQUFDLE1BQWM7UUFDcEMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLHlCQUF5QixNQUFNLG1CQUFtQixDQUFDLENBQUM7U0FDakU7SUFDRixDQUFDOztBQXRLZSxnQkFBSSxHQUFnQixLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDL0IsNkJBQWlCLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSBcIi4vT1dlYkFwcFwiO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gXCIuL09XZWJFdmVudFwiO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSBcIi4vdXRpbHMvVXRpbHNcIjtcclxuXHJcbmV4cG9ydCB0eXBlIHRDb25maWdMaXN0ID0geyBba2V5OiBzdHJpbmddOiBhbnkgfTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJDb25maWdzIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiAgICAgICAgICAgICAgPSBVdGlscy5pZCgpO1xyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfQ09ORklHX0NIQU5HRSA9IFV0aWxzLmlkKCk7XHJcblxyXG5cdHByaXZhdGUgcmVhZG9ubHkgX2RlZmF1bHRfY29uZmlnczogdENvbmZpZ0xpc3QgICAgID0ge307XHJcblx0cHJpdmF0ZSByZWFkb25seSBfdXNlcl9jb25maWdzOiB0Q29uZmlnTGlzdCAgICAgICAgPSB7fTtcclxuXHRwcml2YXRlIHJlYWRvbmx5IF9wcml2YXRlX2NvbmZpZ3NfbWFwOiB0Q29uZmlnTGlzdCA9IHt9O1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3RhZ19uYW1lOiBzdHJpbmcgICAgICAgICAgICAgICAgID0gXCJ1c2VyX2NvbmZpZ3NcIjtcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCwgY29uZmlnczogdENvbmZpZ0xpc3QpIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5sb2FkQ29uZmlncyhjb25maWdzKTtcclxuXHRcdHRoaXMuX2xvYWRTYXZlZENvbmZpZ3MoKTtcclxuXHJcblx0XHRjb25zb2xlLmxvZyhcIltPV2ViQ29uZmlnc10gcmVhZHkhXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTG9hZHMgY29uZmlnIGxpc3QuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnc1xyXG5cdCAqL1xyXG5cdGxvYWRDb25maWdzKGNvbmZpZ3M6IHRDb25maWdMaXN0KTogdGhpcyB7XHJcblx0XHRsZXQgcyA9IHRoaXM7XHJcblxyXG5cdFx0VXRpbHMuZm9yRWFjaChjb25maWdzLCAodmFsdWU6IGFueSwgY2ZnOiBzdHJpbmcpID0+IHtcclxuXHRcdFx0Y2ZnICAgICAgICAgICAgICAgICAgPSBzLl9yZWFsQ29uZmlnTmFtZShjZmcpO1xyXG5cdFx0XHRzLl91c2VyX2NvbmZpZ3NbY2ZnXSA9IHMuX2RlZmF1bHRfY29uZmlnc1tjZmddID0gdmFsdWU7XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc2V0IGEgZ2l2ZW4gY29uZmlnIHRvIGl0cyBkZWZhdWx0IHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZ1xyXG5cdCAqL1xyXG5cdHJlc2V0VG9EZWZhdWx0KGNvbmZpZzogc3RyaW5nKTogdGhpcyB7XHJcblx0XHRpZiAoY29uZmlnIGluIHRoaXMuX2RlZmF1bHRfY29uZmlncykge1xyXG5cdFx0XHR0aGlzLnNldChjb25maWcsIHRoaXMuX2RlZmF1bHRfY29uZmlnc1tjb25maWddKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc2V0IGFsbCBjb25maWdzIHRvIHRoZWlyIGRlZmF1bHQgdmFsdWVzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpcm1fZmlyc3QgV2hlbiB0cnVlIGEgY29uZmlybSB3aWxsIHJlcXVlc3Qgd2lsbCBiZSBzZW50IHRvIHRoZSB1c2VyLlxyXG5cdCAqL1xyXG5cdHJlc2V0QWxsVG9EZWZhdWx0KGNvbmZpcm1fZmlyc3Q6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XHJcblx0XHRpZiAoY29uZmlybV9maXJzdCAmJiAhY29uZmlybSh0aGlzLmFwcF9jb250ZXh0LmkxOG4udG9IdW1hbihcIk9aX0NPTkZJUk1fUkVTRVRfQ09ORklHU1wiKSkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuYXBwX2NvbnRleHQubHMuc2F2ZSh0aGlzLl90YWdfbmFtZSwgdGhpcy5fZGVmYXVsdF9jb25maWdzKTtcclxuXHJcblx0XHR0aGlzLmFwcF9jb250ZXh0LnJlbG9hZEFwcCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0cyBhIGNvbmZpZyB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKi9cclxuXHRnZXQoY29uZmlnOiBzdHJpbmcpOiBhbnkge1xyXG5cdFx0dGhpcy5fd2FyblVuZGVmaW5lZChjb25maWcpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX3VzZXJfY29uZmlnc1tjb25maWddO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlIGEgZ2l2ZW4gY29uZmlnIHdpdGggdGhlIGdpdmVuIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZyBUaGUgY29uZmlnIG5hbWUuXHJcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUuXHJcblx0ICovXHJcblx0c2V0KGNvbmZpZzogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XHJcblx0XHRsZXQgbSA9IHRoaXM7XHJcblx0XHRpZiAoVXRpbHMuaXNQbGFpbk9iamVjdChjb25maWcpKSB7XHJcblx0XHRcdFV0aWxzLmZvckVhY2goY29uZmlnIGFzIHt9LCAodmFsdWUsIGtleSkgPT4ge1xyXG5cdFx0XHRcdG0uX3NldChrZXksIHZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRtLl9zZXQoY29uZmlnLCB2YWx1ZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5hcHBfY29udGV4dC5scy5zYXZlKHRoaXMuX3RhZ19uYW1lLCB0aGlzLl91c2VyX2NvbmZpZ3MpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBMb2FkcyBhbGwgc2F2ZWQgY29uZmlncy5cclxuXHQgKlxyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfbG9hZFNhdmVkQ29uZmlncygpIHtcclxuXHRcdGxldCBtICAgICAgICAgPSB0aGlzLFxyXG5cdFx0XHRzYXZlZF9jZmcgPSB0aGlzLmFwcF9jb250ZXh0LmxzLmxvYWQodGhpcy5fdGFnX25hbWUpIHx8IHt9O1xyXG5cclxuXHRcdFV0aWxzLmZvckVhY2gobS5fZGVmYXVsdF9jb25maWdzLCAodmFsdWUsIGtleSkgPT4ge1xyXG5cdFx0XHRpZiAodGhpcy5faXNQdWJsaWMoa2V5KSAmJiBzYXZlZF9jZmdba2V5XSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0bS5fdXNlcl9jb25maWdzW2tleV0gPSBzYXZlZF9jZmdba2V5XTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hcHBfY29udGV4dC5scy5zYXZlKHRoaXMuX3RhZ19uYW1lLCBtLl91c2VyX2NvbmZpZ3MpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGVscGVyIHVzZWQgdG8gc2V0IGNvbmZpZyB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKiBAcGFyYW0gdmFsdWVcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3NldChjb25maWc6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xyXG5cclxuXHRcdHRoaXMuX3dhcm5VbmRlZmluZWQoY29uZmlnKTtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2lzUHVibGljKGNvbmZpZykpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBbT1dlYkNvbmZpZ3NdIGNhbid0IG92ZXJ3cml0ZSBjb25maWcgXCIke2NvbmZpZ31cIiBwZXJtaXNzaW9uIGRlbmllZC5gKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY29uZmlnIGluIHRoaXMuX3VzZXJfY29uZmlncykge1xyXG5cdFx0XHR0aGlzLl91c2VyX2NvbmZpZ3NbY29uZmlnXSA9IHZhbHVlO1xyXG5cclxuXHRcdFx0dGhpcy50cmlnZ2VyKE9XZWJDb25maWdzLkVWVF9DT05GSUdfQ0hBTkdFLCBbY29uZmlnLCB2YWx1ZSwgdGhpc10pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlIHByZWZpeCBhbmQgcmV0dXJucyByZWFsIGNvbmZpZyBuYW1lLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZ1xyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfcmVhbENvbmZpZ05hbWUoY29uZmlnOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0aWYgKGNvbmZpZ1swXSA9PT0gXCIhXCIpIHtcclxuXHRcdFx0Y29uZmlnICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gY29uZmlnLnN1YnN0cigxKTtcclxuXHRcdFx0dGhpcy5fcHJpdmF0ZV9jb25maWdzX21hcFtjb25maWddID0gMTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gY29uZmlnO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgaWYgdGhlIGNvbmZpZyBpcyBhIHB1YmxpYyBjb25maWcgbmFtZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2lzUHVibGljKGNvbmZpZzogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdW5kZWZpbmVkID09PSB0aGlzLl9wcml2YXRlX2NvbmZpZ3NfbWFwW2NvbmZpZ107XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBpZiB0aGUgY29uZmlnIGV4aXN0cy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3dhcm5VbmRlZmluZWQoY29uZmlnOiBzdHJpbmcpIHtcclxuXHRcdGlmICghKGNvbmZpZyBpbiB0aGlzLl91c2VyX2NvbmZpZ3MpKSB7XHJcblx0XHRcdGNvbnNvbGUud2FybihgW09XZWJDb25maWdzXSBjb25maWcgXCIke2NvbmZpZ31cIiBpcyBub3QgZGVmaW5lZC5gKTtcclxuXHRcdH1cclxuXHR9XHJcbn0iXX0=