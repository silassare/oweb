import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
import OWebLang from "./OWebLang";
import Utils from "./utils/Utils";

export type tConfigList = { [key: string]: any };

export default class OWebConfigs extends OWebEvent {
	static readonly SELF              = "OWebConfigs";
	static readonly EVT_CONFIG_CHANGE = "OWebConfigs:change";

	private readonly _default_configs: tConfigList     = {};
	private readonly _user_configs: tConfigList        = {};
	private readonly _private_configs_map: tConfigList = {};
	private readonly _tag_name: string                 = "user_configs";

	constructor(private readonly app_context: OWebApp, configs: tConfigList) {
		super();

		this.loadConfigs(configs);
		this._loadSavedConfigs();

		console.log("[OWebConfigs] ready!");
	}

	loadConfigs(configs: tConfigList): this {
		let s = this;

		Utils.forEach(configs, (value: any, cfg: string) => {
			cfg                  = s._realConfigName(cfg);
			s._user_configs[cfg] = s._default_configs[cfg] = value;
		});

		return s;
	}

	resetToDefault(config: string): this {
		if (config in this._default_configs) {
			this.set(config, this._default_configs[config]);
		}

		return this;
	}

	resetAllToDefault(): void {
		if (confirm(OWebLang.toHuman("OZ_CONFIRM_RESET_CONFIGS"))) {
			this.app_context.ls.save(this._tag_name, this._default_configs);

			this.app_context.reloadApp();
		}
	}

	get(config: string): any {
		this._warnUndefined(config);
		return this._user_configs[config];
	}

	set(config: string, value: any): this {
		let m = this;
		if (Utils.isPlainObject(config)) {
			Utils.forEach(config as {}, (value, key) => {
				m._set(key, value);
			});
		} else {
			m._set(config, value);
		}

		this.app_context.ls.save(this._tag_name, this._user_configs);
		return this;
	}

	private _loadSavedConfigs() {
		let m         = this,
			saved_cfg = this.app_context.ls.load(this._tag_name) || {};

		Utils.forEach(m._default_configs, (value, key) => {
			if (this._isPublic(key) && saved_cfg[key] !== undefined) {
				m._user_configs[key] = saved_cfg[key];
			}
		});

		this.app_context.ls.save(this._tag_name, m._user_configs);
	}

	private _set(config: string, value: any): void {

		this._warnUndefined(config);

		if (!this._isPublic(config)) {
			throw new Error(`[OWebConfigs] can't overwrite config "${config}" permission denied.`);
		}

		if (config in this._user_configs) {
			this._user_configs[config] = value;

			this.trigger(OWebConfigs.EVT_CONFIG_CHANGE, [config, value, this]);
		}
	}

	private _realConfigName(config: string): string {
		if (config[0] === "!") {
			config                            = config.substr(1);
			this._private_configs_map[config] = 1;
		}

		return config;
	}

	private _isPublic(config: string): boolean {
		return undefined === this._private_configs_map[config];
	}

	private _warnUndefined(config: string) {
		if (!(config in this._user_configs)) {
			console.warn(`[OWebConfigs] config "${config}" is not defined.`);
		}
	}
}