"use strict";

import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";
import OWebApp from "./OWebApp";
import OWebDataStore from "./OWebDataStore";
import OWebLang from "./OWebLang";

export type tConfigList = { [key: string]: any };

export default class OWebConfigs extends OWebEvent {
	static readonly SELF              = "OWebConfigs";
	static readonly EVT_CONFIG_CHANGE = "OWebConfigs:change";

	private readonly _default_configs: tConfigList = {};
	private readonly _user_configs: tConfigList    = {};

	private readonly _tag_name: string;

	constructor(private readonly app_context: OWebApp, configs: tConfigList) {
		super();
		this._tag_name = app_context.getAppName() + ":user_configs";

		this.addDefaultConfig(configs);
		this._loadSaved();
	}

	addDefaultConfig(configs: tConfigList): this {
		let s = this;

		Utils.iterate(configs, (cfg: any, value: any) => {
			s._user_configs[cfg] = s._default_configs[cfg] = value;
		});
		return this;
	}

	resetToDefault(config: string): this {
		if (config in this._default_configs) {
			this.set(config, this._default_configs[config]);
		}

		return this;
	}

	resetAllToDefault(): void {
		if (confirm(OWebLang.toHuman("OZ_CONFIRM_RESET_CONFIGS"))) {
			OWebDataStore.save(this._tag_name, this._default_configs);

			this.app_context.reloadApp();
		}
	}

	get(config: string): any {
		return this._user_configs[config];
	}

	set(config: string, value: any): this {
		let m = this;
		if (Utils.isPlainObject(config)) {
			Utils.iterate(config, (key, value) => {
				m._set(key, value);
			});
		} else {
			this._set(config, value);
		}

		OWebDataStore.save(this._tag_name, this._user_configs);
		return this;
	}

	_loadSaved() {
		let m         = this,
			saved_cfg = OWebDataStore.load(this._tag_name) || {};

		Utils.iterate(m._default_configs, (key) => {

			if (OWebConfigs._isPublic(key) && saved_cfg[key] !== undefined) {
				m._user_configs[key] = saved_cfg[key];
			}

		});

		OWebDataStore.save(this._tag_name, m._user_configs);
	}

	_set(config: string, value: any): void {

		if (!OWebConfigs._isPublic(config)) {
			throw new Error(`can't overwrite config "${config}" permission denied.`);
		}

		if (config in this._user_configs) {
			this._user_configs[config] = value;

			this.trigger(OWebConfigs.EVT_CONFIG_CHANGE, [config, value, this]);
		}
	}

	static _isPublic(config: string) {
		return config.substr(0, 2) === "P_";
	}
}