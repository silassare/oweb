import Utils from "./utils/Utils";
import OWebEvent from "./OWebEvent";
import OWebApp from "./OWebApp";

export type tLangInjectData = { [key: string]: any };
export type tLangDefinition = { [key: string]: any };
export type tLangPluginArgs = { context: OWebApp, data: tLangInjectData, langCode: string };
export type tLangPluginFn = (o: tLangPluginArgs) => tLangInjectData;
export type tLangFormatterArgs = { context: OWebApp, args: string[], langCode: string };
export type tLangFormatterFn = (o: tLangFormatterArgs) => string;

const
	LANG_PORTION_COPY_REG = /{{\s*([A-Z][A-Z0-9_]+)\s*}}/g, // for {{LANG_KEY}}
	LANG_REPLACE_REG      = /{\s*(?:([a-zA-Z_]+):)?([a-zA-Z0-9_]+)\s*}/g,// for {variable} and {fn:variable}
	LANG_VALUE_TAG_REG    = /(INPUT|TEXTAREA)/i;

let LANG_OBJECT: { [key: string]: tLangDefinition }           = {},
	LANG_PLUGINS: { [key: string]: tLangPluginFn }            = {},
	LANG_FORMATS_FN_LIST: { [key: string]: tLangFormatterFn } = {
		"file_size": function (o) {
			return Utils.fileSizeFormat(Number(o.args[0]));
		}
	};

const runPlugins      = (app_context: OWebApp, plugins: string, data: tLangInjectData, langCode: string): any => {
		  let len = plugins.length;
		  for (let i = 0; i < len; i++) {
			  let plugin = plugins[i],
				  fn     = LANG_PLUGINS[plugin];

			  if (fn) {
				  data = fn({
					  context: app_context,
					  data,
					  langCode
				  });
			  } else {
				  console.error(`[OWebLang] undefined plugins "${plugin}".`);
			  }
		  }

		  return data;
	  },
	  runReplace      = (app_context: OWebApp, text: string, data: any, langCode: string): string => {

		  let fnExec = function (name: string, value: any, langCode: string) {
			  let fn = LANG_FORMATS_FN_LIST[name];

			  if (typeof fn === "function") {
				  return fn({
					  context: app_context,
					  args   : [value],
					  langCode
				  });
			  }

			  return value;
		  };

		  text = text.replace(LANG_REPLACE_REG, (text, fn, variable) => {
			  let value = (data || {})[variable];

			  if (fn) {
				  value = fnExec(fn, value, langCode);
			  }

			  return value;
		  });

		  return text;
	  },
	  translate       = function (app_context: OWebApp, langKey: string, langData: tLangInjectData, langCode: string): string {

		  if (!LANG_OBJECT[langKey]) {
			  throw new Error(`[OWebLang] undefined language data for: ${langCode}`);
		  }

		  let data = langData || {},
			  text = OWebLang.getLangText(langKey, langCode);

		  if (data["olangPlugins"]) {
			  let plugins = data["olangPlugins"].split("|");
			  data        = runPlugins(app_context, plugins, data, langCode);
		  }

		  if (text !== undefined) {

			  if (LANG_REPLACE_REG.test(text)) {
				  text = runReplace(app_context, text, data, langCode);
			  }

			  return text;
		  }

		  return langKey;
	  },
	  portionReplacer = function (text: string, langCode: string): string {
		  if (LANG_PORTION_COPY_REG.test(text)) {
			  text = text.replace(LANG_PORTION_COPY_REG, function (text, p) {
				  return OWebLang.getLangText(p, langCode);
			  });
		  }

		  return text;
	  };

export default class OWebLang extends OWebEvent {
	defaultLangCode: string = "en";

	/**
	 * @param app_context The app context.
	 */
	constructor(private app_context: OWebApp) {
		super();
	}

	/**
	 * Set default i18n lang code.
	 *
	 * @param langCode The i18n lang code.
	 */
	setDefaultLang(langCode: string) {

		if (!LANG_OBJECT[langCode]) {
			throw new Error(`[OWebLang] can't set default language, undefined language data for: ${langCode}.`)
		}

		if (this.defaultLangCode !== langCode) {
			this.defaultLangCode = langCode;
		}

		return this;
	}

	/**
	 * Returns i18n translation.
	 *
	 * @param langKey The i18n string key.
	 * @param langData The data to inject in translation process.
	 * @param langCode The i18n lang code to use.
	 */
	toHuman(langKey: string, langData: tLangInjectData = {}, langCode: string = this.defaultLangCode): string {
		return translate(this.app_context, langKey, langData, langCode);
	}

	/**
	 * Update an element content/placeholder/title.
	 *
	 * @param el The element to update.
	 * @param data The data to inject in i18n translation process.
	 */
	updateElement(el: HTMLElement, data: tLangInjectData): this {
		let translatedText  = null,
			contentKey      = data.olang,
			contentData     = data.olangData || data,
			titleKey        = data.olangTitle,
			titleData       = data.olangTitleData || data.olangData || data,
			placeholderKey  = data.olangPlaceholder,
			placeholderData = data.olangPlaceholderData || data.olangData || data,
			langCode        = data.olangCode || this.defaultLangCode,
			tag             = el.nodeName;

		if (contentKey !== undefined) {
			translatedText = translate(this.app_context, contentKey, contentData, langCode);

			if (!LANG_VALUE_TAG_REG.test(tag)) {
				el.innerHTML = translatedText;
			} else {
				el.setAttribute("value", translatedText);
			}
		}

		if (titleKey !== undefined) {
			el.setAttribute("title", translate(this.app_context, titleKey, titleData, langCode));
		}

		if (placeholderKey !== undefined) {
			el.setAttribute("placeholder", translate(this.app_context, placeholderKey, placeholderData, langCode));
		}

		return this;
	}

	/**
	 * Sets the i18n lang data.
	 *
	 * @param langCode The i18n lang code
	 * @param data The i18n lang data.
	 */
	static setLangData(langCode: string, data: tLangDefinition) {

		if (!Utils.isString(langCode)) {
			throw new TypeError("[OWebLang] your lang name should be a valid string.");
		}

		if (!Utils.isPlainObject(data)) {
			throw new TypeError("[OWebLang] your lang data should be a valid plain object.");
		}

		LANG_OBJECT[langCode] = Utils.assign(LANG_OBJECT[langCode] || {}, data);

		return this;
	}

	/**
	 * Returns the i18n string.
	 *
	 * @param textKey The i18n text key.
	 * @param langCode The i18n lang code
	 */
	static getLangText(textKey: string, langCode: string): any {
		if (LANG_OBJECT[langCode]) {
			return portionReplacer(LANG_OBJECT[langCode][textKey], langCode);
		} else {
			return undefined;
		}
	}

	/**
	 * Adds plugin.
	 *
	 * @param name The plugin name.
	 * @param fn The plugin function.
	 */
	static addPlugin(name: string, fn: tLangPluginFn) {
		if (LANG_PLUGINS[name]) {
			throw new Error(`[OWebLang] plugin '${name}' already defined.`);
		}

		LANG_PLUGINS[name] = fn;

		return this;
	}
}