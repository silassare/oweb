import OWebEvent from './OWebEvent';
import { forEach, id, isPlainObject, logger } from './utils';
let OWebConfigs = /** @class */ (() => {
    class OWebConfigs extends OWebEvent {
        constructor(appContext, configs) {
            super();
            this.appContext = appContext;
            this._defaultConfigs = {};
            this._userConfigs = {};
            this._privateConfigsMap = {};
            this._tagName = 'user_configs';
            this.loadConfigs(configs);
            this._loadSavedConfigs();
            logger.info('[OWebConfigs] ready!');
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
                logger.warn(`[OWebConfigs] config "${config}" is not defined.`);
            }
        }
    }
    OWebConfigs.SELF = id();
    OWebConfigs.EVT_CONFIG_CHANGE = id();
    return OWebConfigs;
})();
export default OWebConfigs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbmZpZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkNvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFJN0Q7SUFBQSxNQUFxQixXQUFZLFNBQVEsU0FBUztRQVNqRCxZQUE2QixVQUFtQixFQUFFLE9BQW9CO1lBQ3JFLEtBQUssRUFBRSxDQUFDO1lBRG9CLGVBQVUsR0FBVixVQUFVLENBQVM7WUFML0Isb0JBQWUsR0FBZ0IsRUFBRSxDQUFDO1lBQ2xDLGlCQUFZLEdBQWdCLEVBQUUsQ0FBQztZQUMvQix1QkFBa0IsR0FBZ0IsRUFBRSxDQUFDO1lBQ3JDLGFBQVEsR0FBVyxjQUFjLENBQUM7WUFLbEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUV6QixNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxXQUFXLENBQUMsT0FBb0I7WUFDL0IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBRWYsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQVUsRUFBRSxHQUFXLEVBQUUsRUFBRTtnQkFDNUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzdCLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDdEQsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsY0FBYyxDQUFDLE1B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QUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNuRTtRQUNGLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNLLGVBQWUsQ0FBQyxNQUFjO1lBQ3JDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtnQkFDdEIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDcEM7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNLLFNBQVMsQ0FBQyxNQUFjO1lBQy9CLE9BQU8sU0FBUyxLQUFLLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSyxjQUFjLENBQUMsTUFBYztZQUNwQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUF5QixNQUFNLG1CQUFtQixDQUFDLENBQUM7YUFDaEU7UUFDRixDQUFDOztJQTFLZSxnQkFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ1osNkJBQWlCLEdBQUcsRUFBRSxFQUFFLENBQUM7SUEwSzFDLGtCQUFDO0tBQUE7ZUE1S29CLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xyXG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcclxuaW1wb3J0IHsgZm9yRWFjaCwgaWQsIGlzUGxhaW5PYmplY3QsIGxvZ2dlciB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuZXhwb3J0IHR5cGUgdENvbmZpZ0xpc3QgPSB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkNvbmZpZ3MgZXh0ZW5kcyBPV2ViRXZlbnQge1xyXG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcclxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0NPTkZJR19DSEFOR0UgPSBpZCgpO1xyXG5cclxuXHRwcml2YXRlIHJlYWRvbmx5IF9kZWZhdWx0Q29uZmlnczogdENvbmZpZ0xpc3QgPSB7fTtcclxuXHRwcml2YXRlIHJlYWRvbmx5IF91c2VyQ29uZmlnczogdENvbmZpZ0xpc3QgPSB7fTtcclxuXHRwcml2YXRlIHJlYWRvbmx5IF9wcml2YXRlQ29uZmlnc01hcDogdENvbmZpZ0xpc3QgPSB7fTtcclxuXHRwcml2YXRlIHJlYWRvbmx5IF90YWdOYW1lOiBzdHJpbmcgPSAndXNlcl9jb25maWdzJztcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBDb250ZXh0OiBPV2ViQXBwLCBjb25maWdzOiB0Q29uZmlnTGlzdCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHJcblx0XHR0aGlzLmxvYWRDb25maWdzKGNvbmZpZ3MpO1xyXG5cdFx0dGhpcy5fbG9hZFNhdmVkQ29uZmlncygpO1xyXG5cclxuXHRcdGxvZ2dlci5pbmZvKCdbT1dlYkNvbmZpZ3NdIHJlYWR5IScpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTG9hZCBjb25maWcgbGlzdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdzXHJcblx0ICovXHJcblx0bG9hZENvbmZpZ3MoY29uZmlnczogdENvbmZpZ0xpc3QpOiB0aGlzIHtcclxuXHRcdGNvbnN0IHMgPSB0aGlzO1xyXG5cclxuXHRcdGZvckVhY2goY29uZmlncywgKHZhbHVlOiBhbnksIGNmZzogc3RyaW5nKSA9PiB7XHJcblx0XHRcdGNmZyA9IHMuX3JlYWxDb25maWdOYW1lKGNmZyk7XHJcblx0XHRcdHMuX3VzZXJDb25maWdzW2NmZ10gPSBzLl9kZWZhdWx0Q29uZmlnc1tjZmddID0gdmFsdWU7XHJcblx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc2V0cyBhIGdpdmVuIGNvbmZpZyB0byBpdHMgZGVmYXVsdCB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKi9cclxuXHRyZXNldFRvRGVmYXVsdChjb25maWc6IHN0cmluZyk6IHRoaXMge1xyXG5cdFx0aWYgKGNvbmZpZyBpbiB0aGlzLl9kZWZhdWx0Q29uZmlncykge1xyXG5cdFx0XHR0aGlzLnNldChjb25maWcsIHRoaXMuX2RlZmF1bHRDb25maWdzW2NvbmZpZ10pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzZXRzIGFsbCBjb25maWdzIHRvIHRoZWlyIGRlZmF1bHQgdmFsdWVzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpcm1GaXJzdCBXaGVuIHRydWUgYSBjb25maXJtIHdpbGwgcmVxdWVzdCB3aWxsIGJlIHNlbnQgdG8gdGhlIHVzZXIuXHJcblx0ICovXHJcblx0cmVzZXRBbGxUb0RlZmF1bHQoY29uZmlybUZpcnN0OiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xyXG5cdFx0aWYgKFxyXG5cdFx0XHRjb25maXJtRmlyc3QgJiZcclxuXHRcdFx0IWNvbmZpcm0odGhpcy5hcHBDb250ZXh0LmkxOG4udG9IdW1hbignT1pfQ09ORklSTV9SRVNFVF9DT05GSUdTJykpXHJcblx0XHQpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuYXBwQ29udGV4dC5scy5zYXZlKHRoaXMuX3RhZ05hbWUsIHRoaXMuX2RlZmF1bHRDb25maWdzKTtcclxuXHJcblx0XHR0aGlzLmFwcENvbnRleHQucmVsb2FkQXBwKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXRzIGEgY29uZmlnIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZ1xyXG5cdCAqL1xyXG5cdGdldChjb25maWc6IHN0cmluZyk6IGFueSB7XHJcblx0XHR0aGlzLl93YXJuVW5kZWZpbmVkKGNvbmZpZyk7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXNlckNvbmZpZ3NbY29uZmlnXTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZXMgYSBnaXZlbiBjb25maWcgd2l0aCB0aGUgZ2l2ZW4gdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnIFRoZSBjb25maWcgbmFtZS5cclxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZS5cclxuXHQgKi9cclxuXHRzZXQoY29uZmlnOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB0aGlzIHtcclxuXHRcdGNvbnN0IG0gPSB0aGlzO1xyXG5cdFx0aWYgKGlzUGxhaW5PYmplY3QoY29uZmlnKSkge1xyXG5cdFx0XHRmb3JFYWNoKGNvbmZpZyBhcyB7fSwgKHZhbCwga2V5KSA9PiB7XHJcblx0XHRcdFx0bS5fc2V0KGtleSwgdmFsKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRtLl9zZXQoY29uZmlnLCB2YWx1ZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5hcHBDb250ZXh0LmxzLnNhdmUodGhpcy5fdGFnTmFtZSwgdGhpcy5fdXNlckNvbmZpZ3MpO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBMb2FkIGFsbCBzYXZlZCBjb25maWdzLlxyXG5cdCAqXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9sb2FkU2F2ZWRDb25maWdzKCkge1xyXG5cdFx0Y29uc3QgbSA9IHRoaXMsXHJcblx0XHRcdHNhdmVkQ29uZmlnID0gdGhpcy5hcHBDb250ZXh0LmxzLmxvYWQodGhpcy5fdGFnTmFtZSkgfHwge307XHJcblxyXG5cdFx0Zm9yRWFjaChtLl9kZWZhdWx0Q29uZmlncywgKHZhbCwga2V5KSA9PiB7XHJcblx0XHRcdGlmICh0aGlzLl9pc1B1YmxpYyhrZXkpICYmIHNhdmVkQ29uZmlnW2tleV0gIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdG0uX3VzZXJDb25maWdzW2tleV0gPSBzYXZlZENvbmZpZ1trZXldO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFwcENvbnRleHQubHMuc2F2ZSh0aGlzLl90YWdOYW1lLCBtLl91c2VyQ29uZmlncyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIZWxwZXIgdXNlZCB0byBzZXQgY29uZmlnIHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZ1xyXG5cdCAqIEBwYXJhbSB2YWx1ZVxyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfc2V0KGNvbmZpZzogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XHJcblx0XHR0aGlzLl93YXJuVW5kZWZpbmVkKGNvbmZpZyk7XHJcblxyXG5cdFx0aWYgKCF0aGlzLl9pc1B1YmxpYyhjb25maWcpKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcclxuXHRcdFx0XHRgW09XZWJDb25maWdzXSBjYW4ndCBvdmVyd3JpdGUgY29uZmlnIFwiJHtjb25maWd9XCIgcGVybWlzc2lvbiBkZW5pZWQuYCxcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY29uZmlnIGluIHRoaXMuX3VzZXJDb25maWdzKSB7XHJcblx0XHRcdHRoaXMuX3VzZXJDb25maWdzW2NvbmZpZ10gPSB2YWx1ZTtcclxuXHJcblx0XHRcdHRoaXMudHJpZ2dlcihPV2ViQ29uZmlncy5FVlRfQ09ORklHX0NIQU5HRSwgW2NvbmZpZywgdmFsdWUsIHRoaXNdKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgcHJlZml4IGFuZCByZXR1cm5zIHJlYWwgY29uZmlnIG5hbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9yZWFsQ29uZmlnTmFtZShjb25maWc6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRpZiAoY29uZmlnWzBdID09PSAnIScpIHtcclxuXHRcdFx0Y29uZmlnID0gY29uZmlnLnN1YnN0cigxKTtcclxuXHRcdFx0dGhpcy5fcHJpdmF0ZUNvbmZpZ3NNYXBbY29uZmlnXSA9IDE7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGNvbmZpZztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrcyBpZiB0aGUgY29uZmlnIGlzIGEgcHVibGljIGNvbmZpZyBuYW1lLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZ1xyXG5cdCAqIEBwcml2YXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfaXNQdWJsaWMoY29uZmlnOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB1bmRlZmluZWQgPT09IHRoaXMuX3ByaXZhdGVDb25maWdzTWFwW2NvbmZpZ107XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3MgaWYgdGhlIGNvbmZpZyBleGlzdHMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF93YXJuVW5kZWZpbmVkKGNvbmZpZzogc3RyaW5nKSB7XHJcblx0XHRpZiAoIShjb25maWcgaW4gdGhpcy5fdXNlckNvbmZpZ3MpKSB7XHJcblx0XHRcdGxvZ2dlci53YXJuKGBbT1dlYkNvbmZpZ3NdIGNvbmZpZyBcIiR7Y29uZmlnfVwiIGlzIG5vdCBkZWZpbmVkLmApO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iXX0=