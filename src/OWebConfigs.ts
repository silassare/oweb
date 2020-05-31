import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import { forEach, id, isPlainObject } from './utils/Utils';

export type tConfigList = { [key: string]: any };

export default class OWebConfigs extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_CONFIG_CHANGE = id();

	private readonly _defaultConfigs: tConfigList = {};
	private readonly _userConfigs: tConfigList = {};
	private readonly _privateConfigsMap: tConfigList = {};
	private readonly _tagName: string = 'user_configs';

	constructor(private readonly appContext: OWebApp, configs: tConfigList) {
		super();

		this.loadConfigs(configs);
		this._loadSavedConfigs();

		console.log('[OWebConfigs] ready!');
	}

	/**
	 * Load config list.
	 *
	 * @param configs
	 */
	loadConfigs(configs: tConfigList): this {
		const s = this;

		forEach(configs, (value: any, cfg: string) => {
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
	resetToDefault(config: string): this {
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
	resetAllToDefault(confirmFirst: boolean = true): void {
		if (
			confirmFirst &&
			!confirm(this.appContext.i18n.toHuman('OZ_CONFIRM_RESET_CONFIGS'))
		) {
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
	get(config: string): any {
		this._warnUndefined(config);
		return this._userConfigs[config];
	}

	/**
	 * Updates a given config with the given value.
	 *
	 * @param config The config name.
	 * @param value The new value.
	 */
	set(config: string, value: any): this {
		const m = this;
		if (isPlainObject(config)) {
			forEach(config as {}, (val, key) => {
				m._set(key, val);
			});
		} else {
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
	private _loadSavedConfigs() {
		const m = this,
			savedConfig = this.appContext.ls.load(this._tagName) || {};

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
	private _set(config: string, value: any): void {
		this._warnUndefined(config);

		if (!this._isPublic(config)) {
			throw new Error(
				`[OWebConfigs] can't overwrite config "${config}" permission denied.`,
			);
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
	private _realConfigName(config: string): string {
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
	private _isPublic(config: string): boolean {
		return undefined === this._privateConfigsMap[config];
	}

	/**
	 * Checks if the config exists.
	 *
	 * @param config
	 * @private
	 */
	private _warnUndefined(config: string) {
		if (!(config in this._userConfigs)) {
			console.warn(`[OWebConfigs] config "${config}" is not defined.`);
		}
	}
}
