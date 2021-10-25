import OWebEvent from './OWebEvent';
import { clone, forEach, id, logger } from './utils';
export default class OWebConfigs extends OWebEvent {
    _appContext;
    static SELF = id();
    static EVT_CONFIG_CHANGE = id();
    _tagName = 'user_configs';
    _defaultUserConfigs = {};
    _appConfigs = {};
    _usersConfigs = {};
    constructor(_appContext, appConfigs, userConfigs) {
        super();
        this._appContext = _appContext;
        this._defaultUserConfigs = clone(userConfigs);
        this._appConfigs = clone(appConfigs);
        this._loadSavedConfigs();
        logger.info('[OWebConfigs] ready!');
    }
    /**
     * Resets a given config to its default value.
     *
     * @param config
     */
    resetToDefault(config) {
        if (config in this._defaultUserConfigs) {
            delete this._usersConfigs[config];
            this._appContext.ls.set(this._tagName, this._usersConfigs);
        }
        return this;
    }
    /**
     * Resets all configs to their default values.
     *
     * @param confirmFirst When true a confirm will request will be sent to the user.
     */
    resetAllToDefault(confirmFirst = true) {
        if (!confirmFirst ||
            confirm(this._appContext.i18n.toHuman('OZ_CONFIRM_RESET_USER_CONFIGS'))) {
            this._usersConfigs = {};
            this._appContext.ls.set(this._tagName, this._usersConfigs);
        }
        return this;
    }
    /**
     * Gets a config value.
     *
     * @param config
     */
    get(config) {
        this._assertDefined(config);
        let val;
        if (config in this._usersConfigs) {
            val = this._usersConfigs[config];
        }
        else if (config in this._defaultUserConfigs) {
            val = this._defaultUserConfigs[config];
        }
        else if (config in this._appConfigs) {
            val = this._appConfigs[config];
        }
        return clone(val);
    }
    /**
     * Updates a given config with the given value.
     *
     * @param config The config name.
     * @param value The new value.
     */
    set(config, value) {
        this._assertDefined(config);
        if (this._isAppConfig(config)) {
            throw new Error(`[OWebConfigs] can't overwrite app config "${config}".`);
        }
        if (value === undefined) {
            delete this._usersConfigs[config];
        }
        else {
            this._usersConfigs[config] = clone(value);
        }
        this._appContext.ls.set(this._tagName, this._usersConfigs);
        this.trigger(OWebConfigs.EVT_CONFIG_CHANGE, [
            config,
            this.get(config),
            this,
        ]);
        return this;
    }
    /**
     * Load all saved configs.
     *
     * @private
     */
    _loadSavedConfigs() {
        const m = this, savedConfig = this._appContext.ls.get(this._tagName) || {};
        forEach(m._defaultUserConfigs, (val, key) => {
            if (savedConfig[key] !== undefined) {
                m._usersConfigs[key] = savedConfig[key];
            }
        });
        this._appContext.ls.set(this._tagName, m._usersConfigs);
    }
    /**
     * Checks if the config is an app config name.
     *
     * @param config
     * @private
     */
    _isAppConfig(config) {
        return config in this._appConfigs;
    }
    /**
     * Checks if the config exists.
     *
     * @param config
     * @private
     */
    _assertDefined(config) {
        if (!(config in this._defaultUserConfigs || config in this._appConfigs)) {
            throw new Error(`[OWebConfigs] config "${config}" is not defined.`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbmZpZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkNvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFHckQsTUFBTSxDQUFDLE9BQU8sT0FBTyxXQVFuQixTQUFRLFNBQVM7SUFVQTtJQVRsQixNQUFNLENBQVUsSUFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQzVCLE1BQU0sQ0FBVSxpQkFBaUIsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUV4QixRQUFRLEdBQVcsY0FBYyxDQUFDO0lBQ2xDLG1CQUFtQixHQUFNLEVBQVMsQ0FBQztJQUNuQyxXQUFXLEdBQU0sRUFBUyxDQUFDO0lBQ3BDLGFBQWEsR0FBTSxFQUFTLENBQUM7SUFFckMsWUFDa0IsV0FBb0IsRUFDckMsVUFBYSxFQUNiLFdBQWM7UUFFZCxLQUFLLEVBQUUsQ0FBQztRQUpTLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBTXJDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFekIsTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFvQixNQUFTO1FBQzFDLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUN2QyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUks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Q0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxZQUFZLENBQUMsTUFBYztRQUNsQyxPQUFPLE1BQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ25DLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLGNBQWMsQ0FBQyxNQUFXO1FBQ2pDLElBQ0MsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsbUJBQW1CLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsRUFDbEU7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixNQUFNLG1CQUFtQixDQUFDLENBQUM7U0FDcEU7SUFDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xuaW1wb3J0IHsgY2xvbmUsIGZvckVhY2gsIGlkLCBsb2dnZXIgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IE9KU09OVmFsdWUgfSBmcm9tICcuL09XZWJEYXRhU3RvcmUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViQ29uZmlnczxcblx0UCBleHRlbmRzIHtcblx0XHRba2V5OiBzdHJpbmddOiBPSlNPTlZhbHVlO1xuXHR9LFxuXHRVIGV4dGVuZHMge1xuXHRcdFtrZXk6IHN0cmluZ106IE9KU09OVmFsdWU7XG5cdH0sXG5cdEIgPSBVICYgUFxuPiBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9DT05GSUdfQ0hBTkdFID0gaWQoKTtcblxuXHRwcml2YXRlIHJlYWRvbmx5IF90YWdOYW1lOiBzdHJpbmcgPSAndXNlcl9jb25maWdzJztcblx0cHJpdmF0ZSByZWFkb25seSBfZGVmYXVsdFVzZXJDb25maWdzOiBVID0ge30gYXMgYW55O1xuXHRwcml2YXRlIHJlYWRvbmx5IF9hcHBDb25maWdzOiBQID0ge30gYXMgYW55O1xuXHRwcml2YXRlIF91c2Vyc0NvbmZpZ3M6IFUgPSB7fSBhcyBhbnk7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBfYXBwQ29udGV4dDogT1dlYkFwcCxcblx0XHRhcHBDb25maWdzOiBQLFxuXHRcdHVzZXJDb25maWdzOiBVXG5cdCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLl9kZWZhdWx0VXNlckNvbmZpZ3MgPSBjbG9uZSh1c2VyQ29uZmlncyk7XG5cdFx0dGhpcy5fYXBwQ29uZmlncyA9IGNsb25lKGFwcENvbmZpZ3MpO1xuXG5cdFx0dGhpcy5fbG9hZFNhdmVkQ29uZmlncygpO1xuXG5cdFx0bG9nZ2VyLmluZm8oJ1tPV2ViQ29uZmlnc10gcmVhZHkhJyk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzZXRzIGEgZ2l2ZW4gY29uZmlnIHRvIGl0cyBkZWZhdWx0IHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29uZmlnXG5cdCAqL1xuXHRyZXNldFRvRGVmYXVsdDxUIGV4dGVuZHMga2V5b2YgVT4oY29uZmlnOiBUKTogdGhpcyB7XG5cdFx0aWYgKGNvbmZpZyBpbiB0aGlzLl9kZWZhdWx0VXNlckNvbmZpZ3MpIHtcblx0XHRcdGRlbGV0ZSB0aGlzLl91c2Vyc0NvbmZpZ3NbY29uZmlnXTtcblx0XHRcdHRoaXMuX2FwcENvbnRleHQubHMuc2V0KHRoaXMuX3RhZ05hbWUsIHRoaXMuX3VzZXJzQ29uZmlncyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVzZXRzIGFsbCBjb25maWdzIHRvIHRoZWlyIGRlZmF1bHQgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29uZmlybUZpcnN0IFdoZW4gdHJ1ZSBhIGNvbmZpcm0gd2lsbCByZXF1ZXN0IHdpbGwgYmUgc2VudCB0byB0aGUgdXNlci5cblx0ICovXG5cdHJlc2V0QWxsVG9EZWZhdWx0KGNvbmZpcm1GaXJzdCA9IHRydWUpOiB0aGlzIHtcblx0XHRpZiAoXG5cdFx0XHQhY29uZmlybUZpcnN0IHx8XG5cdFx0XHRjb25maXJtKFxuXHRcdFx0XHR0aGlzLl9hcHBDb250ZXh0LmkxOG4udG9IdW1hbignT1pfQ09ORklSTV9SRVNFVF9VU0VSX0NPTkZJR1MnKVxuXHRcdFx0KVxuXHRcdCkge1xuXHRcdFx0dGhpcy5fdXNlcnNDb25maWdzID0ge30gYXMgYW55O1xuXG5cdFx0XHR0aGlzLl9hcHBDb250ZXh0LmxzLnNldCh0aGlzLl90YWdOYW1lLCB0aGlzLl91c2Vyc0NvbmZpZ3MpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBjb25maWcgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb25maWdcblx0ICovXG5cdGdldDxUIGV4dGVuZHMga2V5b2YgQj4oY29uZmlnOiBUKTogQltUXSB7XG5cdFx0dGhpcy5fYXNzZXJ0RGVmaW5lZChjb25maWcpO1xuXG5cdFx0bGV0IHZhbDtcblxuXHRcdGlmIChjb25maWcgaW4gdGhpcy5fdXNlcnNDb25maWdzKSB7XG5cdFx0XHR2YWwgPSAodGhpcy5fdXNlcnNDb25maWdzIGFzIGFueSlbY29uZmlnXTtcblx0XHR9IGVsc2UgaWYgKGNvbmZpZyBpbiB0aGlzLl9kZWZhdWx0VXNlckNvbmZpZ3MpIHtcblx0XHRcdHZhbCA9ICh0aGlzLl9kZWZhdWx0VXNlckNvbmZpZ3MgYXMgYW55KVtjb25maWddO1xuXHRcdH0gZWxzZSBpZiAoY29uZmlnIGluIHRoaXMuX2FwcENvbmZpZ3MpIHtcblx0XHRcdHZhbCA9ICh0aGlzLl9hcHBDb25maWdzIGFzIGFueSlbY29uZmlnXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2xvbmUodmFsKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIGEgZ2l2ZW4gY29uZmlnIHdpdGggdGhlIGdpdmVuIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29uZmlnIFRoZSBjb25maWcgbmFtZS5cblx0ICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUuXG5cdCAqL1xuXHRzZXQ8VCBleHRlbmRzIGtleW9mIFU+KGNvbmZpZzogVCwgdmFsdWU6IFVbVF0pOiB0aGlzIHtcblx0XHR0aGlzLl9hc3NlcnREZWZpbmVkKGNvbmZpZyk7XG5cblx0XHRpZiAodGhpcy5faXNBcHBDb25maWcoY29uZmlnIGFzIHN0cmluZykpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0YFtPV2ViQ29uZmlnc10gY2FuJ3Qgb3ZlcndyaXRlIGFwcCBjb25maWcgXCIke2NvbmZpZ31cIi5gXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRkZWxldGUgdGhpcy5fdXNlcnNDb25maWdzW2NvbmZpZ107XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX3VzZXJzQ29uZmlnc1tjb25maWddID0gY2xvbmUodmFsdWUpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2FwcENvbnRleHQubHMuc2V0KHRoaXMuX3RhZ05hbWUsIHRoaXMuX3VzZXJzQ29uZmlncyk7XG5cblx0XHR0aGlzLnRyaWdnZXIoT1dlYkNvbmZpZ3MuRVZUX0NPTkZJR19DSEFOR0UsIFtcblx0XHRcdGNvbmZpZyxcblx0XHRcdHRoaXMuZ2V0KGNvbmZpZyBhcyBhbnkpLFxuXHRcdFx0dGhpcyxcblx0XHRdKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWQgYWxsIHNhdmVkIGNvbmZpZ3MuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9sb2FkU2F2ZWRDb25maWdzKCkge1xuXHRcdGNvbnN0IG0gPSB0aGlzLFxuXHRcdFx0c2F2ZWRDb25maWcgPSB0aGlzLl9hcHBDb250ZXh0LmxzLmdldCh0aGlzLl90YWdOYW1lKSB8fCB7fTtcblxuXHRcdGZvckVhY2gobS5fZGVmYXVsdFVzZXJDb25maWdzIGFzIGFueSwgKHZhbCwga2V5KSA9PiB7XG5cdFx0XHRpZiAoc2F2ZWRDb25maWdba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdChtLl91c2Vyc0NvbmZpZ3MgYXMgYW55KVtrZXldID0gc2F2ZWRDb25maWdba2V5XTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuX2FwcENvbnRleHQubHMuc2V0KHRoaXMuX3RhZ05hbWUsIG0uX3VzZXJzQ29uZmlncyk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBjb25maWcgaXMgYW4gYXBwIGNvbmZpZyBuYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29uZmlnXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9pc0FwcENvbmZpZyhjb25maWc6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBjb25maWcgaW4gdGhpcy5fYXBwQ29uZmlncztcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIGNvbmZpZyBleGlzdHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb25maWdcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX2Fzc2VydERlZmluZWQoY29uZmlnOiBhbnkpIHtcblx0XHRpZiAoXG5cdFx0XHQhKGNvbmZpZyBpbiB0aGlzLl9kZWZhdWx0VXNlckNvbmZpZ3MgfHwgY29uZmlnIGluIHRoaXMuX2FwcENvbmZpZ3MpXG5cdFx0KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFtPV2ViQ29uZmlnc10gY29uZmlnIFwiJHtjb25maWd9XCIgaXMgbm90IGRlZmluZWQuYCk7XG5cdFx0fVxuXHR9XG59XG4iXX0=