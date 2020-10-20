import OWebEvent from './OWebEvent';
import { clone, forEach, id, logger } from './utils';
export default class OWebConfigs extends OWebEvent {
    constructor(_appContext, appConfigs, userConfigs) {
        super();
        this._appContext = _appContext;
        this._tagName = 'user_configs';
        this._defaultUserConfigs = {};
        this._appConfigs = {};
        this._usersConfigs = {};
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
        this.trigger(OWebConfigs.EVT_CONFIG_CHANGE, [config, this.get(config), this]);
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
OWebConfigs.SELF = id();
OWebConfigs.EVT_CONFIG_CHANGE = id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbmZpZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkNvbmZpZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHbkQsTUFBTSxDQUFDLE9BQU8sT0FBTyxXQUlQLFNBQVEsU0FBUztJQVM5QixZQUE2QixXQUFvQixFQUFFLFVBQWEsRUFBRSxXQUFjO1FBQy9FLEtBQUssRUFBRSxDQUFDO1FBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBTGhDLGFBQVEsR0FBaUIsY0FBYyxDQUFDO1FBQ3hDLHdCQUFtQixHQUFNLEVBQVMsQ0FBQztRQUNuQyxnQkFBVyxHQUFpQixFQUFTLENBQUM7UUFDL0Msa0JBQWEsR0FBcUIsRUFBUyxDQUFDO1FBS25ELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFdBQVcsR0FBYyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFaEQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFekIsTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFvQixNQUFTO1FBQzFDLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUV2QyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7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LENBQUMsTUFBYztRQUNsQyxPQUFPLE1BQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ25DLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLGNBQWMsQ0FBQyxNQUFXO1FBQ2pDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsbUJBQW1CLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN4RSxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixNQUFNLG1CQUFtQixDQUFDLENBQUM7U0FDcEU7SUFDRixDQUFDOztBQTVJZSxnQkFBSSxHQUFnQixFQUFFLEVBQUUsQ0FBQztBQUN6Qiw2QkFBaUIsR0FBRyxFQUFFLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcbmltcG9ydCB7Y2xvbmUsIGZvckVhY2gsIGlkLCBsb2dnZXJ9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtPSlNPTlNlcmlhbGl6YWJsZX0gZnJvbSAnLi9PV2ViRGF0YVN0b3JlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkNvbmZpZ3M8UCBleHRlbmRzIHtcblx0W2tleTogc3RyaW5nXTogT0pTT05TZXJpYWxpemFibGU7XG59LCBVIGV4dGVuZHMge1xuXHRba2V5OiBzdHJpbmddOiBPSlNPTlNlcmlhbGl6YWJsZTtcbn0sIEIgPSBVICYgUD4gZXh0ZW5kcyBPV2ViRXZlbnQge1xuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiAgICAgICAgICAgICAgPSBpZCgpO1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0NPTkZJR19DSEFOR0UgPSBpZCgpO1xuXG5cdHByaXZhdGUgcmVhZG9ubHkgX3RhZ05hbWU6IHN0cmluZyAgICAgICA9ICd1c2VyX2NvbmZpZ3MnO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9kZWZhdWx0VXNlckNvbmZpZ3M6IFUgPSB7fSBhcyBhbnk7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2FwcENvbmZpZ3M6IFAgICAgICAgICAgICA9IHt9IGFzIGFueTtcblx0cHJpdmF0ZSBfdXNlcnNDb25maWdzOiBVICAgICAgICAgICAgICAgID0ge30gYXMgYW55O1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX2FwcENvbnRleHQ6IE9XZWJBcHAsIGFwcENvbmZpZ3M6IFAsIHVzZXJDb25maWdzOiBVKSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuX2RlZmF1bHRVc2VyQ29uZmlncyA9IGNsb25lKHVzZXJDb25maWdzKTtcblx0XHR0aGlzLl9hcHBDb25maWdzICAgICAgICAgICAgPSBjbG9uZShhcHBDb25maWdzKTtcblxuXHRcdHRoaXMuX2xvYWRTYXZlZENvbmZpZ3MoKTtcblxuXHRcdGxvZ2dlci5pbmZvKCdbT1dlYkNvbmZpZ3NdIHJlYWR5IScpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc2V0cyBhIGdpdmVuIGNvbmZpZyB0byBpdHMgZGVmYXVsdCB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIGNvbmZpZ1xuXHQgKi9cblx0cmVzZXRUb0RlZmF1bHQ8VCBleHRlbmRzIGtleW9mIFU+KGNvbmZpZzogVCk6IHRoaXMge1xuXHRcdGlmIChjb25maWcgaW4gdGhpcy5fZGVmYXVsdFVzZXJDb25maWdzKSB7XG5cblx0XHRcdGRlbGV0ZSB0aGlzLl91c2Vyc0NvbmZpZ3NbY29uZmlnXTtcblx0XHRcdHRoaXMuX2FwcENvbnRleHQubHMuc2V0KHRoaXMuX3RhZ05hbWUsIHRoaXMuX3VzZXJzQ29uZmlncyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVzZXRzIGFsbCBjb25maWdzIHRvIHRoZWlyIGRlZmF1bHQgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29uZmlybUZpcnN0IFdoZW4gdHJ1ZSBhIGNvbmZpcm0gd2lsbCByZXF1ZXN0IHdpbGwgYmUgc2VudCB0byB0aGUgdXNlci5cblx0ICovXG5cdHJlc2V0QWxsVG9EZWZhdWx0KGNvbmZpcm1GaXJzdCA9IHRydWUpOiB0aGlzIHtcblx0XHRpZiAoXG5cdFx0XHQhY29uZmlybUZpcnN0IHx8XG5cdFx0XHRjb25maXJtKHRoaXMuX2FwcENvbnRleHQuaTE4bi50b0h1bWFuKCdPWl9DT05GSVJNX1JFU0VUX1VTRVJfQ09ORklHUycpKVxuXHRcdCkge1xuXHRcdFx0dGhpcy5fdXNlcnNDb25maWdzID0ge30gYXMgYW55O1xuXG5cdFx0XHR0aGlzLl9hcHBDb250ZXh0LmxzLnNldCh0aGlzLl90YWdOYW1lLCB0aGlzLl91c2Vyc0NvbmZpZ3MpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBjb25maWcgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb25maWdcblx0ICovXG5cdGdldDxUIGV4dGVuZHMga2V5b2YgQj4oY29uZmlnOiBUKTogQltUXSB7XG5cblx0XHR0aGlzLl9hc3NlcnREZWZpbmVkKGNvbmZpZyk7XG5cblx0XHRsZXQgdmFsO1xuXG5cdFx0aWYgKGNvbmZpZyBpbiB0aGlzLl91c2Vyc0NvbmZpZ3MpIHtcblx0XHRcdHZhbCA9ICh0aGlzLl91c2Vyc0NvbmZpZ3MgYXMgYW55KVtjb25maWddO1xuXHRcdH0gZWxzZSBpZiAoY29uZmlnIGluIHRoaXMuX2RlZmF1bHRVc2VyQ29uZmlncykge1xuXHRcdFx0dmFsID0gKHRoaXMuX2RlZmF1bHRVc2VyQ29uZmlncyBhcyBhbnkpW2NvbmZpZ107XG5cdFx0fSBlbHNlIGlmIChjb25maWcgaW4gdGhpcy5fYXBwQ29uZmlncykge1xuXHRcdFx0dmFsID0gKHRoaXMuX2FwcENvbmZpZ3MgYXMgYW55KVtjb25maWddO1xuXHRcdH1cblxuXHRcdHJldHVybiBjbG9uZSh2YWwpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgYSBnaXZlbiBjb25maWcgd2l0aCB0aGUgZ2l2ZW4gdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb25maWcgVGhlIGNvbmZpZyBuYW1lLlxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZS5cblx0ICovXG5cdHNldDxUIGV4dGVuZHMga2V5b2YgVT4oY29uZmlnOiBULCB2YWx1ZTogVVtUXSk6IHRoaXMge1xuXHRcdHRoaXMuX2Fzc2VydERlZmluZWQoY29uZmlnKTtcblxuXHRcdGlmICh0aGlzLl9pc0FwcENvbmZpZyhjb25maWcgYXMgc3RyaW5nKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRgW09XZWJDb25maWdzXSBjYW4ndCBvdmVyd3JpdGUgYXBwIGNvbmZpZyBcIiR7Y29uZmlnfVwiLmAsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRkZWxldGUgdGhpcy5fdXNlcnNDb25maWdzW2NvbmZpZ107XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX3VzZXJzQ29uZmlnc1tjb25maWddID0gY2xvbmUodmFsdWUpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2FwcENvbnRleHQubHMuc2V0KHRoaXMuX3RhZ05hbWUsIHRoaXMuX3VzZXJzQ29uZmlncyk7XG5cblx0XHR0aGlzLnRyaWdnZXIoT1dlYkNvbmZpZ3MuRVZUX0NPTkZJR19DSEFOR0UsIFtjb25maWcsIHRoaXMuZ2V0KGNvbmZpZyBhcyBhbnkpLCB0aGlzXSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkIGFsbCBzYXZlZCBjb25maWdzLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfbG9hZFNhdmVkQ29uZmlncygpIHtcblx0XHRjb25zdCBtICAgICAgICAgICA9IHRoaXMsXG5cdFx0XHQgIHNhdmVkQ29uZmlnID0gdGhpcy5fYXBwQ29udGV4dC5scy5nZXQodGhpcy5fdGFnTmFtZSkgfHwge307XG5cblx0XHRmb3JFYWNoKG0uX2RlZmF1bHRVc2VyQ29uZmlncyBhcyBhbnksICh2YWwsIGtleSkgPT4ge1xuXHRcdFx0aWYgKHNhdmVkQ29uZmlnW2tleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHQobS5fdXNlcnNDb25maWdzIGFzIGFueSlba2V5XSA9IHNhdmVkQ29uZmlnW2tleV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLl9hcHBDb250ZXh0LmxzLnNldCh0aGlzLl90YWdOYW1lLCBtLl91c2Vyc0NvbmZpZ3MpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgY29uZmlnIGlzIGFuIGFwcCBjb25maWcgbmFtZS5cblx0ICpcblx0ICogQHBhcmFtIGNvbmZpZ1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfaXNBcHBDb25maWcoY29uZmlnOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gY29uZmlnIGluIHRoaXMuX2FwcENvbmZpZ3M7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBjb25maWcgZXhpc3RzLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29uZmlnXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9hc3NlcnREZWZpbmVkKGNvbmZpZzogYW55KSB7XG5cdFx0aWYgKCEoY29uZmlnIGluIHRoaXMuX2RlZmF1bHRVc2VyQ29uZmlncyB8fCBjb25maWcgaW4gdGhpcy5fYXBwQ29uZmlncykpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgW09XZWJDb25maWdzXSBjb25maWcgXCIke2NvbmZpZ31cIiBpcyBub3QgZGVmaW5lZC5gKTtcblx0XHR9XG5cdH1cbn1cbiJdfQ==