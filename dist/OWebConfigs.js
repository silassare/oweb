import OWebEvent from './OWebEvent';
import { forEach, id, isPlainObject } from './utils/Utils';
export default class OWebConfigs extends OWebEvent {
    constructor(appContext, configs) {
        super();
        this.appContext = appContext;
        this._defaultConfigs = {};
        this._userConfigs = {};
        this._privateConfigsMap = {};
        this._tagName = 'user_configs';
        this.loadConfigs(configs);
        this._loadSavedConfigs();
        console.log('[OWebConfigs] ready!');
    }
    /**
     * Load config list.
     *
     * @param configs
     */
    loadConfigs(configs) {
        const s = this;
        forEach(configs, (value, cfg) => {
            cfg = s._realConfigName(cfg);
            s._userConfigs[cfg] = s._defaultConfigs[cfg] = value;
        });
        return s;
    }
    /**
     * Resets a given config to its default value.
     *
     * @param config
     */
    resetToDefault(config) {
        if (config in this._defaultConfigs) {
            this.set(config, this._defaultConfigs[config]);
        }
        return this;
    }
    /**
     * Resets all configs to their default values.
     *
     * @param confirmFirst When true a confirm will request will be sent to the user.
     */
    resetAllToDefault(confirmFirst = true) {
        if (confirmFirst &&
            !confirm(this.appContext.i18n.toHuman('OZ_CONFIRM_RESET_CONFIGS'))) {
            return;
        }
        this.appContext.ls.save(this._tagName, this._defaultConfigs);
        this.appContext.reloadApp();
    }
    /**
     * Gets a config value.
     *
     * @param config
     */
    get(config) {
        this._warnUndefined(config);
        return this._userConfigs[config];
    }
    /**
     * Updates a given config with the given value.
     *
     * @param config The config name.
     * @param value The new value.
     */
    set(config, value) {
        const m = this;
        if (isPlainObject(config)) {
            forEach(config, (val, key) => {
                m._set(key, val);
            });
        }
        else {
            m._set(config, value);
        }
        this.appContext.ls.save(this._tagName, this._userConfigs);
        return this;
    }
    /**
     * Load all saved configs.
     *
     * @private
     */
    _loadSavedConfigs() {
        const m = this, savedConfig = this.appContext.ls.load(this._tagName) || {};
        forEach(m._defaultConfigs, (val, key) => {
            if (this._isPublic(key) && savedConfig[key] !== undefined) {
                m._userConfigs[key] = savedConfig[key];
            }
        });
        this.appContext.ls.save(this._tagName, m._userConfigs);
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
        if (config in this._userConfigs) {
            this._userConfigs[config] = value;
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
        if (config[0] === '!') {
            config = config.substr(1);
            this._privateConfigsMap[config] = 1;
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
        return undefined === this._privateConfigsMap[config];
    }
    /**
     * Checks if the config exists.
     *
     * @param config
     * @private
     */
    _warnUndefined(config) {
        if (!(config in this._userConfigs)) {
            console.warn(`[OWebConfigs] config "${config}" is not defined.`);
        }
    }
}
OWebConfigs.SELF = id();
OWebConfigs.EVT_CONFIG_CHANGE = id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbmZpZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkNvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUkzRCxNQUFNLENBQUMsT0FBTyxPQUFPLFdBQVksU0FBUSxTQUFTO0lBU2pELFlBQTZCLFVBQW1CLEVBQUUsT0FBb0I7UUFDckUsS0FBSyxFQUFFLENBQUM7UUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBUztRQUwvQixvQkFBZSxHQUFnQixFQUFFLENBQUM7UUFDbEMsaUJBQVksR0FBZ0IsRUFBRSxDQUFDO1FBQy9CLHVCQUFrQixHQUFnQixFQUFFLENBQUM7UUFDckMsYUFBUSxHQUFXLGNBQWMsQ0FBQztRQUtsRCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxPQUFvQjtRQUMvQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFZixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBVSxFQUFFLEdBQVcsRUFBRSxFQUFFO1lBQzVDLEdBQUcsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFDLE1BQWM7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QUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNuRTtJQUNGLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLGVBQWUsQ0FBQyxNQUFjO1FBQ3JDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUN0QixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxTQUFTLENBQUMsTUFBYztRQUMvQixPQUFPLFNBQVMsS0FBSyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssY0FBYyxDQUFDLE1BQWM7UUFDcEMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLHlCQUF5QixNQUFNLG1CQUFtQixDQUFDLENBQUM7U0FDakU7SUFDRixDQUFDOztBQTFLZSxnQkFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQ1osNkJBQWlCLEdBQUcsRUFBRSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcclxuaW1wb3J0IHsgZm9yRWFjaCwgaWQsIGlzUGxhaW5PYmplY3QgfSBmcm9tICcuL3V0aWxzL1V0aWxzJztcclxuXHJcbmV4cG9ydCB0eXBlIHRDb25maWdMaXN0ID0geyBba2V5OiBzdHJpbmddOiBhbnkgfTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJDb25maWdzIGV4dGVuZHMgT1dlYkV2ZW50IHtcclxuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiA9IGlkKCk7XHJcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9DT05GSUdfQ0hBTkdFID0gaWQoKTtcclxuXHJcblx0cHJpdmF0ZSByZWFkb25seSBfZGVmYXVsdENvbmZpZ3M6IHRDb25maWdMaXN0ID0ge307XHJcblx0cHJpdmF0ZSByZWFkb25seSBfdXNlckNvbmZpZ3M6IHRDb25maWdMaXN0ID0ge307XHJcblx0cHJpdmF0ZSByZWFkb25seSBfcHJpdmF0ZUNvbmZpZ3NNYXA6IHRDb25maWdMaXN0ID0ge307XHJcblx0cHJpdmF0ZSByZWFkb25seSBfdGFnTmFtZTogc3RyaW5nID0gJ3VzZXJfY29uZmlncyc7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYXBwQ29udGV4dDogT1dlYkFwcCwgY29uZmlnczogdENvbmZpZ0xpc3QpIHtcclxuXHRcdHN1cGVyKCk7XHJcblxyXG5cdFx0dGhpcy5sb2FkQ29uZmlncyhjb25maWdzKTtcclxuXHRcdHRoaXMuX2xvYWRTYXZlZENvbmZpZ3MoKTtcclxuXHJcblx0XHRjb25zb2xlLmxvZygnW09XZWJDb25maWdzXSByZWFkeSEnKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWQgY29uZmlnIGxpc3QuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnc1xyXG5cdCAqL1xyXG5cdGxvYWRDb25maWdzKGNvbmZpZ3M6IHRDb25maWdMaXN0KTogdGhpcyB7XHJcblx0XHRjb25zdCBzID0gdGhpcztcclxuXHJcblx0XHRmb3JFYWNoKGNvbmZpZ3MsICh2YWx1ZTogYW55LCBjZmc6IHN0cmluZykgPT4ge1xyXG5cdFx0XHRjZmcgPSBzLl9yZWFsQ29uZmlnTmFtZShjZmcpO1xyXG5cdFx0XHRzLl91c2VyQ29uZmlnc1tjZmddID0gcy5fZGVmYXVsdENvbmZpZ3NbY2ZnXSA9IHZhbHVlO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIHM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNldHMgYSBnaXZlbiBjb25maWcgdG8gaXRzIGRlZmF1bHQgdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnXHJcblx0ICovXHJcblx0cmVzZXRUb0RlZmF1bHQoY29uZmlnOiBzdHJpbmcpOiB0aGlzIHtcclxuXHRcdGlmIChjb25maWcgaW4gdGhpcy5fZGVmYXVsdENvbmZpZ3MpIHtcclxuXHRcdFx0dGhpcy5zZXQoY29uZmlnLCB0aGlzLl9kZWZhdWx0Q29uZmlnc1tjb25maWddKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc2V0cyBhbGwgY29uZmlncyB0byB0aGVpciBkZWZhdWx0IHZhbHVlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maXJtRmlyc3QgV2hlbiB0cnVlIGEgY29uZmlybSB3aWxsIHJlcXVlc3Qgd2lsbCBiZSBzZW50IHRvIHRoZSB1c2VyLlxyXG5cdCAqL1xyXG5cdHJlc2V0QWxsVG9EZWZhdWx0KGNvbmZpcm1GaXJzdDogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcclxuXHRcdGlmIChcclxuXHRcdFx0Y29uZmlybUZpcnN0ICYmXHJcblx0XHRcdCFjb25maXJtKHRoaXMuYXBwQ29udGV4dC5pMThuLnRvSHVtYW4oJ09aX0NPTkZJUk1fUkVTRVRfQ09ORklHUycpKVxyXG5cdFx0KSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmFwcENvbnRleHQubHMuc2F2ZSh0aGlzLl90YWdOYW1lLCB0aGlzLl9kZWZhdWx0Q29uZmlncyk7XHJcblxyXG5cdFx0dGhpcy5hcHBDb250ZXh0LnJlbG9hZEFwcCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0cyBhIGNvbmZpZyB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKi9cclxuXHRnZXQoY29uZmlnOiBzdHJpbmcpOiBhbnkge1xyXG5cdFx0dGhpcy5fd2FyblVuZGVmaW5lZChjb25maWcpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX3VzZXJDb25maWdzW2NvbmZpZ107XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVcGRhdGVzIGEgZ2l2ZW4gY29uZmlnIHdpdGggdGhlIGdpdmVuIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZyBUaGUgY29uZmlnIG5hbWUuXHJcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUuXHJcblx0ICovXHJcblx0c2V0KGNvbmZpZzogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XHJcblx0XHRjb25zdCBtID0gdGhpcztcclxuXHRcdGlmIChpc1BsYWluT2JqZWN0KGNvbmZpZykpIHtcclxuXHRcdFx0Zm9yRWFjaChjb25maWcgYXMge30sICh2YWwsIGtleSkgPT4ge1xyXG5cdFx0XHRcdG0uX3NldChrZXksIHZhbCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0bS5fc2V0KGNvbmZpZywgdmFsdWUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuYXBwQ29udGV4dC5scy5zYXZlKHRoaXMuX3RhZ05hbWUsIHRoaXMuX3VzZXJDb25maWdzKTtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTG9hZCBhbGwgc2F2ZWQgY29uZmlncy5cclxuXHQgKlxyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfbG9hZFNhdmVkQ29uZmlncygpIHtcclxuXHRcdGNvbnN0IG0gPSB0aGlzLFxyXG5cdFx0XHRzYXZlZENvbmZpZyA9IHRoaXMuYXBwQ29udGV4dC5scy5sb2FkKHRoaXMuX3RhZ05hbWUpIHx8IHt9O1xyXG5cclxuXHRcdGZvckVhY2gobS5fZGVmYXVsdENvbmZpZ3MsICh2YWwsIGtleSkgPT4ge1xyXG5cdFx0XHRpZiAodGhpcy5faXNQdWJsaWMoa2V5KSAmJiBzYXZlZENvbmZpZ1trZXldICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRtLl91c2VyQ29uZmlnc1trZXldID0gc2F2ZWRDb25maWdba2V5XTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hcHBDb250ZXh0LmxzLnNhdmUodGhpcy5fdGFnTmFtZSwgbS5fdXNlckNvbmZpZ3MpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGVscGVyIHVzZWQgdG8gc2V0IGNvbmZpZyB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKiBAcGFyYW0gdmFsdWVcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3NldChjb25maWc6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xyXG5cdFx0dGhpcy5fd2FyblVuZGVmaW5lZChjb25maWcpO1xyXG5cclxuXHRcdGlmICghdGhpcy5faXNQdWJsaWMoY29uZmlnKSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXHJcblx0XHRcdFx0YFtPV2ViQ29uZmlnc10gY2FuJ3Qgb3ZlcndyaXRlIGNvbmZpZyBcIiR7Y29uZmlnfVwiIHBlcm1pc3Npb24gZGVuaWVkLmAsXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGNvbmZpZyBpbiB0aGlzLl91c2VyQ29uZmlncykge1xyXG5cdFx0XHR0aGlzLl91c2VyQ29uZmlnc1tjb25maWddID0gdmFsdWU7XHJcblxyXG5cdFx0XHR0aGlzLnRyaWdnZXIoT1dlYkNvbmZpZ3MuRVZUX0NPTkZJR19DSEFOR0UsIFtjb25maWcsIHZhbHVlLCB0aGlzXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZW1vdmVzIHByZWZpeCBhbmQgcmV0dXJucyByZWFsIGNvbmZpZyBuYW1lLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZ1xyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfcmVhbENvbmZpZ05hbWUoY29uZmlnOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0aWYgKGNvbmZpZ1swXSA9PT0gJyEnKSB7XHJcblx0XHRcdGNvbmZpZyA9IGNvbmZpZy5zdWJzdHIoMSk7XHJcblx0XHRcdHRoaXMuX3ByaXZhdGVDb25maWdzTWFwW2NvbmZpZ10gPSAxO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBjb25maWc7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3MgaWYgdGhlIGNvbmZpZyBpcyBhIHB1YmxpYyBjb25maWcgbmFtZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2lzUHVibGljKGNvbmZpZzogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdW5kZWZpbmVkID09PSB0aGlzLl9wcml2YXRlQ29uZmlnc01hcFtjb25maWddO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGlmIHRoZSBjb25maWcgZXhpc3RzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZ1xyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfd2FyblVuZGVmaW5lZChjb25maWc6IHN0cmluZykge1xyXG5cdFx0aWYgKCEoY29uZmlnIGluIHRoaXMuX3VzZXJDb25maWdzKSkge1xyXG5cdFx0XHRjb25zb2xlLndhcm4oYFtPV2ViQ29uZmlnc10gY29uZmlnIFwiJHtjb25maWd9XCIgaXMgbm90IGRlZmluZWQuYCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiJdfQ==