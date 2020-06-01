import OWebEvent from './OWebEvent';
import { forEach, id, isPlainObject, _warn, _info } from './utils/Utils';
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
            _info('[OWebConfigs] ready!');
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
                _warn(`[OWebConfigs] config "${config}" is not defined.`);
            }
        }
    }
    OWebConfigs.SELF = id();
    OWebConfigs.EVT_CONFIG_CHANGE = id();
    return OWebConfigs;
})();
export default OWebConfigs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbmZpZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkNvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBSXpFO0lBQUEsTUFBcUIsV0FBWSxTQUFRLFNBQVM7UUFTakQsWUFBNkIsVUFBbUIsRUFBRSxPQUFvQjtZQUNyRSxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFTO1lBTC9CLG9CQUFlLEdBQWdCLEVBQUUsQ0FBQztZQUNsQyxpQkFBWSxHQUFnQixFQUFFLENBQUM7WUFDL0IsdUJBQWtCLEdBQWdCLEVBQUUsQ0FBQztZQUNyQyxhQUFRLEdBQVcsY0FBYyxDQUFDO1lBS2xELElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFekIsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxXQUFXLENBQUMsT0FBb0I7WUFDL0IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBRWYsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQVUsRUFBRSxHQUFXLEVBQUUsRUFBRTtnQkFDNUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzdCLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDdEQsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsY0FBYyxDQUFDLE1B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QUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNuRTtRQUNGLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNLLGVBQWUsQ0FBQyxNQUFjO1lBQ3JDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtnQkFDdEIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDcEM7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNLLFNBQVMsQ0FBQyxNQUFjO1lBQy9CLE9BQU8sU0FBUyxLQUFLLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSyxjQUFjLENBQUMsTUFBYztZQUNwQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNuQyxLQUFLLENBQUMseUJBQXlCLE1BQU0sbUJBQW1CLENBQUMsQ0FBQzthQUMxRDtRQUNGLENBQUM7O0lBMUtlLGdCQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDWiw2QkFBaUIsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQTBLMUMsa0JBQUM7S0FBQTtlQTVLb0IsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XHJcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xyXG5pbXBvcnQgeyBmb3JFYWNoLCBpZCwgaXNQbGFpbk9iamVjdCwgX3dhcm4sIF9pbmZvIH0gZnJvbSAnLi91dGlscy9VdGlscyc7XHJcblxyXG5leHBvcnQgdHlwZSB0Q29uZmlnTGlzdCA9IHsgW2tleTogc3RyaW5nXTogYW55IH07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViQ29uZmlncyBleHRlbmRzIE9XZWJFdmVudCB7XHJcblx0c3RhdGljIHJlYWRvbmx5IFNFTEYgPSBpZCgpO1xyXG5cdHN0YXRpYyByZWFkb25seSBFVlRfQ09ORklHX0NIQU5HRSA9IGlkKCk7XHJcblxyXG5cdHByaXZhdGUgcmVhZG9ubHkgX2RlZmF1bHRDb25maWdzOiB0Q29uZmlnTGlzdCA9IHt9O1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3VzZXJDb25maWdzOiB0Q29uZmlnTGlzdCA9IHt9O1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3ByaXZhdGVDb25maWdzTWFwOiB0Q29uZmlnTGlzdCA9IHt9O1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3RhZ05hbWU6IHN0cmluZyA9ICd1c2VyX2NvbmZpZ3MnO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGFwcENvbnRleHQ6IE9XZWJBcHAsIGNvbmZpZ3M6IHRDb25maWdMaXN0KSB7XHJcblx0XHRzdXBlcigpO1xyXG5cclxuXHRcdHRoaXMubG9hZENvbmZpZ3MoY29uZmlncyk7XHJcblx0XHR0aGlzLl9sb2FkU2F2ZWRDb25maWdzKCk7XHJcblxyXG5cdFx0X2luZm8oJ1tPV2ViQ29uZmlnc10gcmVhZHkhJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBMb2FkIGNvbmZpZyBsaXN0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZ3NcclxuXHQgKi9cclxuXHRsb2FkQ29uZmlncyhjb25maWdzOiB0Q29uZmlnTGlzdCk6IHRoaXMge1xyXG5cdFx0Y29uc3QgcyA9IHRoaXM7XHJcblxyXG5cdFx0Zm9yRWFjaChjb25maWdzLCAodmFsdWU6IGFueSwgY2ZnOiBzdHJpbmcpID0+IHtcclxuXHRcdFx0Y2ZnID0gcy5fcmVhbENvbmZpZ05hbWUoY2ZnKTtcclxuXHRcdFx0cy5fdXNlckNvbmZpZ3NbY2ZnXSA9IHMuX2RlZmF1bHRDb25maWdzW2NmZ10gPSB2YWx1ZTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiBzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzZXRzIGEgZ2l2ZW4gY29uZmlnIHRvIGl0cyBkZWZhdWx0IHZhbHVlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGNvbmZpZ1xyXG5cdCAqL1xyXG5cdHJlc2V0VG9EZWZhdWx0KGNvbmZpZzogc3RyaW5nKTogdGhpcyB7XHJcblx0XHRpZiAoY29uZmlnIGluIHRoaXMuX2RlZmF1bHRDb25maWdzKSB7XHJcblx0XHRcdHRoaXMuc2V0KGNvbmZpZywgdGhpcy5fZGVmYXVsdENvbmZpZ3NbY29uZmlnXSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNldHMgYWxsIGNvbmZpZ3MgdG8gdGhlaXIgZGVmYXVsdCB2YWx1ZXMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlybUZpcnN0IFdoZW4gdHJ1ZSBhIGNvbmZpcm0gd2lsbCByZXF1ZXN0IHdpbGwgYmUgc2VudCB0byB0aGUgdXNlci5cclxuXHQgKi9cclxuXHRyZXNldEFsbFRvRGVmYXVsdChjb25maXJtRmlyc3Q6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XHJcblx0XHRpZiAoXHJcblx0XHRcdGNvbmZpcm1GaXJzdCAmJlxyXG5cdFx0XHQhY29uZmlybSh0aGlzLmFwcENvbnRleHQuaTE4bi50b0h1bWFuKCdPWl9DT05GSVJNX1JFU0VUX0NPTkZJR1MnKSlcclxuXHRcdCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5hcHBDb250ZXh0LmxzLnNhdmUodGhpcy5fdGFnTmFtZSwgdGhpcy5fZGVmYXVsdENvbmZpZ3MpO1xyXG5cclxuXHRcdHRoaXMuYXBwQ29udGV4dC5yZWxvYWRBcHAoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldHMgYSBjb25maWcgdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnXHJcblx0ICovXHJcblx0Z2V0KGNvbmZpZzogc3RyaW5nKTogYW55IHtcclxuXHRcdHRoaXMuX3dhcm5VbmRlZmluZWQoY29uZmlnKTtcclxuXHRcdHJldHVybiB0aGlzLl91c2VyQ29uZmlnc1tjb25maWddO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlcyBhIGdpdmVuIGNvbmZpZyB3aXRoIHRoZSBnaXZlbiB2YWx1ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWcgVGhlIGNvbmZpZyBuYW1lLlxyXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgbmV3IHZhbHVlLlxyXG5cdCAqL1xyXG5cdHNldChjb25maWc6IHN0cmluZywgdmFsdWU6IGFueSk6IHRoaXMge1xyXG5cdFx0Y29uc3QgbSA9IHRoaXM7XHJcblx0XHRpZiAoaXNQbGFpbk9iamVjdChjb25maWcpKSB7XHJcblx0XHRcdGZvckVhY2goY29uZmlnIGFzIHt9LCAodmFsLCBrZXkpID0+IHtcclxuXHRcdFx0XHRtLl9zZXQoa2V5LCB2YWwpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdG0uX3NldChjb25maWcsIHZhbHVlKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmFwcENvbnRleHQubHMuc2F2ZSh0aGlzLl90YWdOYW1lLCB0aGlzLl91c2VyQ29uZmlncyk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWQgYWxsIHNhdmVkIGNvbmZpZ3MuXHJcblx0ICpcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2xvYWRTYXZlZENvbmZpZ3MoKSB7XHJcblx0XHRjb25zdCBtID0gdGhpcyxcclxuXHRcdFx0c2F2ZWRDb25maWcgPSB0aGlzLmFwcENvbnRleHQubHMubG9hZCh0aGlzLl90YWdOYW1lKSB8fCB7fTtcclxuXHJcblx0XHRmb3JFYWNoKG0uX2RlZmF1bHRDb25maWdzLCAodmFsLCBrZXkpID0+IHtcclxuXHRcdFx0aWYgKHRoaXMuX2lzUHVibGljKGtleSkgJiYgc2F2ZWRDb25maWdba2V5XSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0bS5fdXNlckNvbmZpZ3Nba2V5XSA9IHNhdmVkQ29uZmlnW2tleV07XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYXBwQ29udGV4dC5scy5zYXZlKHRoaXMuX3RhZ05hbWUsIG0uX3VzZXJDb25maWdzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhlbHBlciB1c2VkIHRvIHNldCBjb25maWcgdmFsdWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnXHJcblx0ICogQHBhcmFtIHZhbHVlXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9zZXQoY29uZmlnOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcclxuXHRcdHRoaXMuX3dhcm5VbmRlZmluZWQoY29uZmlnKTtcclxuXHJcblx0XHRpZiAoIXRoaXMuX2lzUHVibGljKGNvbmZpZykpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxyXG5cdFx0XHRcdGBbT1dlYkNvbmZpZ3NdIGNhbid0IG92ZXJ3cml0ZSBjb25maWcgXCIke2NvbmZpZ31cIiBwZXJtaXNzaW9uIGRlbmllZC5gLFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChjb25maWcgaW4gdGhpcy5fdXNlckNvbmZpZ3MpIHtcclxuXHRcdFx0dGhpcy5fdXNlckNvbmZpZ3NbY29uZmlnXSA9IHZhbHVlO1xyXG5cclxuXHRcdFx0dGhpcy50cmlnZ2VyKE9XZWJDb25maWdzLkVWVF9DT05GSUdfQ0hBTkdFLCBbY29uZmlnLCB2YWx1ZSwgdGhpc10pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBwcmVmaXggYW5kIHJldHVybnMgcmVhbCBjb25maWcgbmFtZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3JlYWxDb25maWdOYW1lKGNvbmZpZzogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGlmIChjb25maWdbMF0gPT09ICchJykge1xyXG5cdFx0XHRjb25maWcgPSBjb25maWcuc3Vic3RyKDEpO1xyXG5cdFx0XHR0aGlzLl9wcml2YXRlQ29uZmlnc01hcFtjb25maWddID0gMTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gY29uZmlnO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGlmIHRoZSBjb25maWcgaXMgYSBwdWJsaWMgY29uZmlnIG5hbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gY29uZmlnXHJcblx0ICogQHByaXZhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9pc1B1YmxpYyhjb25maWc6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHVuZGVmaW5lZCA9PT0gdGhpcy5fcHJpdmF0ZUNvbmZpZ3NNYXBbY29uZmlnXTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrcyBpZiB0aGUgY29uZmlnIGV4aXN0cy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb25maWdcclxuXHQgKiBAcHJpdmF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3dhcm5VbmRlZmluZWQoY29uZmlnOiBzdHJpbmcpIHtcclxuXHRcdGlmICghKGNvbmZpZyBpbiB0aGlzLl91c2VyQ29uZmlncykpIHtcclxuXHRcdFx0X3dhcm4oYFtPV2ViQ29uZmlnc10gY29uZmlnIFwiJHtjb25maWd9XCIgaXMgbm90IGRlZmluZWQuYCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiJdfQ==