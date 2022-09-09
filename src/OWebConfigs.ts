import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import { clone, forEach, id, logger } from './utils';
import { OJSONValue } from './OWebDataStore';

export default class OWebConfigs<
	P extends {
		[key: string]: OJSONValue;
	},
	U extends {
		[key: string]: OJSONValue;
	},
	B = U & P
> extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_CONFIG_CHANGE = id();

	private readonly _tagName: string = 'user_configs';
	private readonly _defaultUserConfigs: U = {} as any;
	private readonly _appConfigs: P = {} as any;
	private _usersConfigs: U = {} as any;

	constructor(
		private readonly _appContext: OWebApp,
		appConfigs: P,
		userConfigs: U
	) {
		super();

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
	resetToDefault<T extends keyof U>(config: T): this {
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
	resetAllToDefault(confirmFirst = true): this {
		if (
			!confirmFirst ||
			confirm(this._appContext.i18n.toHuman('OZ_CONFIRM_RESET_USER_CONFIGS'))
		) {
			this._usersConfigs = {} as any;

			this._appContext.ls.set(this._tagName, this._usersConfigs);
		}

		return this;
	}

	/**
	 * Gets a config value.
	 *
	 * @param config
	 */
	get<T extends keyof B>(config: T): B[T] {
		this._assertDefined(config);

		let val;

		if (config in this._usersConfigs) {
			val = (this._usersConfigs as any)[config];
		} else if (config in this._defaultUserConfigs) {
			val = (this._defaultUserConfigs as any)[config];
		} else if (config in this._appConfigs) {
			val = (this._appConfigs as any)[config];
		}

		return clone(val);
	}

	/**
	 * Updates a given config with the given value.
	 *
	 * @param config The config name.
	 * @param value The new value.
	 */
	set<T extends keyof U>(config: T, value: U[T]): this {
		this._assertDefined(config);

		if (this._isAppConfig(config as string)) {
			throw new Error(
				`[OWebConfigs] can't overwrite app config "${String(config)}".`
			);
		}

		if (value === undefined) {
			delete this._usersConfigs[config];
		} else {
			this._usersConfigs[config] = clone(value);
		}

		this._appContext.ls.set(this._tagName, this._usersConfigs);

		this.trigger(OWebConfigs.EVT_CONFIG_CHANGE, [
			config,
			this.get(config as any),
			this,
		]);

		return this;
	}

	/**
	 * Load all saved configs.
	 *
	 * @private
	 */
	private _loadSavedConfigs() {
		const m = this,
			savedConfig = this._appContext.ls.get(this._tagName) || {};

		forEach(m._defaultUserConfigs as any, (_val, key) => {
			if (savedConfig[key] !== undefined) {
				(m._usersConfigs as any)[key] = savedConfig[key];
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
	private _isAppConfig(config: string): boolean {
		return config in this._appConfigs;
	}

	/**
	 * Checks if the config exists.
	 *
	 * @param config
	 * @private
	 */
	private _assertDefined(config: any) {
		if (!(config in this._defaultUserConfigs || config in this._appConfigs)) {
			throw new Error(`[OWebConfigs] config "${config}" is not defined.`);
		}
	}
}
