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
     * Load config list.
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
     * Resets a given config to its default value.
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
     * Resets all configs to their default values.
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
     * Updates a given config with the given value.
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
     * Load all saved configs.
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
     * Removes prefix and returns real config name.
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
     * Checks if the config is a public config name.
     *
     * @param config
     * @private
     */
    _isPublic(config) {
        return undefined === this._private_configs_map[config];
    }
    /**
     * Checks if the config exists.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbmZpZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkNvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQUlsQyxNQUFNLENBQUMsT0FBTyxPQUFPLFdBQVksU0FBUSxTQUFTO0lBU2pELFlBQTZCLFdBQW9CLEVBQUUsT0FBb0I7UUFDdEUsS0FBSyxFQUFFLENBQUM7UUFEb0IsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFMaEMscUJBQWdCLEdBQW9CLEVBQUUsQ0FBQztRQUN2QyxrQkFBYSxHQUF1QixFQUFFLENBQUM7UUFDdkMseUJBQW9CLEdBQWdCLEVBQUUsQ0FBQztRQUN2QyxjQUFTLEdBQTJCLGNBQWMsQ0FBQztRQUtuRSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxPQUFvQjtRQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFYixLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQVUsRUFBRSxHQUFXLEVBQUUsRUFBRTtZQUNsRCxHQUFHLEdBQW9CLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGNBQWMsQ0FBQyxNQUFjO1FBQzVCLElBQUksTUFB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QUFDO1lBRW5DLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ25FO0lBQ0YsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssZUFBZSxDQUFDLE1BQWM7UUFDckMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ3RCLE1BQU0sR0FBOEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxTQUFTLENBQUMsTUFBYztRQUMvQixPQUFPLFNBQVMsS0FBSyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssY0FBYyxDQUFDLE1BQWM7UUFDcEMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLHlCQUF5QixNQUFNLG1CQUFtQixDQUFDLENBQUM7U0FDakU7SUFDRixDQUFDOztBQXRLZSxnQkFBSSxHQUFnQixLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDL0IsNkJBQWlCLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSBcIi4vT1dlYkFwcFwiO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gXCIuL09XZWJFdmVudFwiO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSBcIi4vdXRpbHMvVXRpbHNcIjtcclxuXHJcbmV4cG9ydCB0eXBlIHRDb25maWdMaXN0ID0geyBba2V5OiBzdHJpbmddOiBhbnkgfTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJDb25maWdzIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiAgICAgICAgICAgICAgPSBVdGlscy5pZCgpO1xyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfQ09ORklHX0NIQU5HRSA9IFV0aWxzLmlkKCk7XHJcblxyXG5cdHByaXZhdGUgcmVhZG9ubHkgX2RlZmF1bHRfY29uZmlnczogdENvbmZpZ0xpc3QgICAgID0ge307XHJcblx0cHJpdmF0ZSByZWFkb25seSBfdXNlcl9jb25maWdzOiB0Q29uZmlnTGlzdCAgICAgICAgPSB7fTtcclxuXHRwcml2YXRlIHJlYWRvbmx5IF9wcml2YXRlX2NvbmZpZ3NfbWFwOiB0Q29uZmlnTGlzdCA9IHt9O1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3RhZ19uYW1lOiBzdHJpbmcgICAgICAgICAgICAgICAgID0gXCJ1c2VyX2NvbmZpZ3NcIjtcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCwgY29uZmlnczogdENvbmZpZ0xpc3QpIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5sb2FkQ29uZmlncyhjb25maWdzKTtcclxuXHRcdHRoaXMuX2xvYWRTYXZlZENvbmZpZ3MoKTtcclxuXHJcblx0XHRjb25zb2xlLmxvZyhcIltPV2ViQ29uZmlnc10gcmVhZHkhXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTG9hZCBjb25maWcgbGlzdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdzXHJcblx0ICovXHJcblx0bG9hZENvbmZpZ3MoY29uZmlnczogdENvbmZpZ0xpc3QpOiB0aGlzIHtcclxuXHRcdGxldCBzID0gdGhpcztcclxuXHJcblx0XHRVdGlscy5mb3JFYWNoKGNvbmZpZ3MsICh2YWx1ZTogYW55LCBjZmc6IHN0cmluZykgPT4ge1xyXG5cdFx0XHRjZmcgICAgICAgICAgICAgICAgICA9IHMuX3JlYWxDb25maWdOYW1lKGNmZyk7XHJcblx0XHRcdHMuX3VzZXJfY29uZmlnc1tjZmddID0gcy5fZGVmYXVsdF9jb25maWdzW2NmZ10gPSB2YWx1ZTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzZXRzIGEgZ2l2ZW4gY29uZmlnIHRvIGl0cyBkZWZhdWx0IHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZ1xyXG5cdCAqL1xyXG5cdHJlc2V0VG9EZWZhdWx0KGNvbmZpZzogc3RyaW5nKTogdGhpcyB7XHJcblx0XHRpZiAoY29uZmlnIGluIHRoaXMuX2RlZmF1bHRfY29uZmlncykge1xyXG5cdFx0XHR0aGlzLnNldChjb25maWcsIHRoaXMuX2RlZmF1bHRfY29uZmlnc1tjb25maWddKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc2V0cyBhbGwgY29uZmlncyB0byB0aGVpciBkZWZhdWx0IHZhbHVlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maXJtX2ZpcnN0IFdoZW4gdHJ1ZSBhIGNvbmZpcm0gd2lsbCByZXF1ZXN0IHdpbGwgYmUgc2VudCB0byB0aGUgdXNlci5cclxuXHQgKi9cclxuXHRyZXNldEFsbFRvRGVmYXVsdChjb25maXJtX2ZpcnN0OiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xyXG5cdFx0aWYgKGNvbmZpcm1fZmlyc3QgJiYgIWNvbmZpcm0odGhpcy5hcHBfY29udGV4dC5pMThuLnRvSHVtYW4oXCJPWl9DT05GSVJNX1JFU0VUX0NPTkZJR1NcIikpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmFwcF9jb250ZXh0LmxzLnNhdmUodGhpcy5fdGFnX25hbWUsIHRoaXMuX2RlZmF1bHRfY29uZmlncyk7XHJcblxyXG5cdFx0dGhpcy5hcHBfY29udGV4dC5yZWxvYWRBcHAoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldHMgYSBjb25maWcgdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnXHJcblx0ICovXHJcblx0Z2V0KGNvbmZpZzogc3RyaW5nKTogYW55IHtcclxuXHRcdHRoaXMuX3dhcm5VbmRlZmluZWQoY29uZmlnKTtcclxuXHRcdHJldHVybiB0aGlzLl91c2VyX2NvbmZpZ3NbY29uZmlnXTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZXMgYSBnaXZlbiBjb25maWcgd2l0aCB0aGUgZ2l2ZW4gdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnIFRoZSBjb25maWcgbmFtZS5cclxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZS5cclxuXHQgKi9cclxuXHRzZXQoY29uZmlnOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB0aGlzIHtcclxuXHRcdGxldCBtID0gdGhpcztcclxuXHRcdGlmIChVdGlscy5pc1BsYWluT2JqZWN0KGNvbmZpZykpIHtcclxuXHRcdFx0VXRpbHMuZm9yRWFjaChjb25maWcgYXMge30sICh2YWx1ZSwga2V5KSA9PiB7XHJcblx0XHRcdFx0bS5fc2V0KGtleSwgdmFsdWUpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG0uX3NldChjb25maWcsIHZhbHVlKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmFwcF9jb250ZXh0LmxzLnNhdmUodGhpcy5fdGFnX25hbWUsIHRoaXMuX3VzZXJfY29uZmlncyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWQgYWxsIHNhdmVkIGNvbmZpZ3MuXHJcblx0ICpcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2xvYWRTYXZlZENvbmZpZ3MoKSB7XHJcblx0XHRsZXQgbSAgICAgICAgID0gdGhpcyxcclxuXHRcdFx0c2F2ZWRfY2ZnID0gdGhpcy5hcHBfY29udGV4dC5scy5sb2FkKHRoaXMuX3RhZ19uYW1lKSB8fCB7fTtcclxuXHJcblx0XHRVdGlscy5mb3JFYWNoKG0uX2RlZmF1bHRfY29uZmlncywgKHZhbHVlLCBrZXkpID0+IHtcclxuXHRcdFx0aWYgKHRoaXMuX2lzUHVibGljKGtleSkgJiYgc2F2ZWRfY2ZnW2tleV0gIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdG0uX3VzZXJfY29uZmlnc1trZXldID0gc2F2ZWRfY2ZnW2tleV07XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYXBwX2NvbnRleHQubHMuc2F2ZSh0aGlzLl90YWdfbmFtZSwgbS5fdXNlcl9jb25maWdzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhlbHBlciB1c2VkIHRvIHNldCBjb25maWcgdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnXHJcblx0ICogQHBhcmFtIHZhbHVlXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9zZXQoY29uZmlnOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcclxuXHJcblx0XHR0aGlzLl93YXJuVW5kZWZpbmVkKGNvbmZpZyk7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9pc1B1YmxpYyhjb25maWcpKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihgW09XZWJDb25maWdzXSBjYW4ndCBvdmVyd3JpdGUgY29uZmlnIFwiJHtjb25maWd9XCIgcGVybWlzc2lvbiBkZW5pZWQuYCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGNvbmZpZyBpbiB0aGlzLl91c2VyX2NvbmZpZ3MpIHtcclxuXHRcdFx0dGhpcy5fdXNlcl9jb25maWdzW2NvbmZpZ10gPSB2YWx1ZTtcclxuXHJcblx0XHRcdHRoaXMudHJpZ2dlcihPV2ViQ29uZmlncy5FVlRfQ09ORklHX0NIQU5HRSwgW2NvbmZpZywgdmFsdWUsIHRoaXNdKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgcHJlZml4IGFuZCByZXR1cm5zIHJlYWwgY29uZmlnIG5hbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9yZWFsQ29uZmlnTmFtZShjb25maWc6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRpZiAoY29uZmlnWzBdID09PSBcIiFcIikge1xyXG5cdFx0XHRjb25maWcgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBjb25maWcuc3Vic3RyKDEpO1xyXG5cdFx0XHR0aGlzLl9wcml2YXRlX2NvbmZpZ3NfbWFwW2NvbmZpZ10gPSAxO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBjb25maWc7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3MgaWYgdGhlIGNvbmZpZyBpcyBhIHB1YmxpYyBjb25maWcgbmFtZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2lzUHVibGljKGNvbmZpZzogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdW5kZWZpbmVkID09PSB0aGlzLl9wcml2YXRlX2NvbmZpZ3NfbWFwW2NvbmZpZ107XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3MgaWYgdGhlIGNvbmZpZyBleGlzdHMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF93YXJuVW5kZWZpbmVkKGNvbmZpZzogc3RyaW5nKSB7XHJcblx0XHRpZiAoIShjb25maWcgaW4gdGhpcy5fdXNlcl9jb25maWdzKSkge1xyXG5cdFx0XHRjb25zb2xlLndhcm4oYFtPV2ViQ29uZmlnc10gY29uZmlnIFwiJHtjb25maWd9XCIgaXMgbm90IGRlZmluZWQuYCk7XHJcblx0XHR9XHJcblx0fVxyXG59Il19