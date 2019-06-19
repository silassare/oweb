import Utils from "../src/utils/Utils";
import OWebEvent from "../src/OWebEvent";
import OWebApp from "../src/OWebApp";

export type tI18nDefinition = { [key: string]: any };
export type tI18nData = { [key: string]: any };
export type tI18nOptions = {
	text?: string,
	placeholder?: string,
	title?: string,
	lang?: string,
	data?: tI18nData,
	pluralize?: tI18nPluralize
};
export type tI18nPluralize = number | ((parts: string[]) => number);

const LANG_OBJECT: { [key: string]: tI18nDefinition } = {};
const token_with_filter                               = /{\s*(@)?(?:([a-z-]{2,})\.)?([a-z_][a-z0-9_]*)\s*}/; // {name} | {@message} | {@fr.message}

const sample = {
	message                               : 'Hello World!',
	message_with_token                    : 'Hello {name}!',
	message_with_pluralize                : 'one message ~ two messages ~ {n} messages',
	message_with_sub_message              : '{@message_with_token} Welcome to our website.',
	message_with_sub_message_specific_lang: '{@fr.message_with_token} We speak french too!'
};

let parse = function (str: string) {

	let out = str.replace(/([\r\n"'])/g, "\\$1")
				 .replace(token_with_filter, function (found, is_sub, lang, path) {
					 let l, x;
					 if (is_sub) {
						 l = lang ? '"' + lang + '"' : 'l';
						 x = `_("${path}", d, ${l})`;
					 } else {
						 x = 'd.' + path;
					 }

					 return '"+' + x + '+"';
				 });

	return new Function('_', 'd', 'l', `return ["${out}"];`.replace(/\s?~\s?/g, '","'));
};

let _tmp      = new Map,
	translate = function (lang_key: string, data: tI18nData, pluralize: tI18nPluralize = 0, lang: string): string {

		let key     = lang + "." + lang_key,
			message = "undefined",
			fn;

		if (_tmp.has(key)) {
			fn = _tmp.get(key);
		} else if (LANG_OBJECT[lang] && (message = LANG_OBJECT[lang][lang_key])) {
			_tmp.set(key, fn = parse(message));
		}

		if (fn) {
			let parts = fn(translate, data, lang),
				len   = parts.length, index;

			if (typeof pluralize === 'function') {
				index = pluralize(parts);
			} else {
				index = pluralize;
			}

			index   = Math.max(Math.min(index, len - 1), 0);
			message = parts[index];
		}

		return message;
	};

export default class OWebI18n extends OWebEvent {
	defaultLangCode: string = "en";

	/**
	 * @param app_context The app context.
	 */
	constructor(private app_context: OWebApp) {
		super();
	}

	/**
	 * Sets default i18n lang code.
	 *
	 * @param lang The i18n lang code.
	 */
	setDefaultLang(lang: string) {

		if (!LANG_OBJECT[lang]) {
			throw new Error(`[OWebLang] can't set default language, undefined language data for: ${lang}.`)
		}

		this.defaultLangCode = lang;

		return this;
	}

	/**
	 * Returns i18n translation.
	 *
	 * @param key The i18n string key.
	 * @param data The data to inject in translation process.
	 * @param pluralize
	 * @param lang The i18n lang code to use.
	 */
	toHuman(key: string, data: tI18nData = {}, pluralize: tI18nPluralize = 0, lang: string = this.defaultLangCode): string {
		return translate(key, data, pluralize, lang);
	}

	/**
	 * Sets i18n for HTMLElement
	 *
	 * @param el
	 * @param options
	 */
	el(el: HTMLElement, options: tI18nOptions | string) {

		if (typeof options === 'string') {
			options = {text: options};
		}

		const {nodeName}                                                                    = el,
			  isInput                                                                       = (nodeName === 'INPUT' || nodeName === 'TEXTAREA'),
			  {text, placeholder, title, data = {}, lang = this.defaultLangCode, pluralize} = options;
		let str;

		if (text) {
			str = translate(text, data, pluralize, lang);
			if (!isInput) {
				el.innerHTML = str;
			} else {
				el.setAttribute("value", str);
			}
		}

		if (isInput && placeholder) {
			str = translate(placeholder, data, pluralize, lang);
			el.setAttribute('placeholder', str);
		}

		if (title) {
			str = translate(title, data, pluralize, lang);
			el.setAttribute('title', str);
		}
	}

	/**
	 * Sets the i18n lang data.
	 *
	 * @param lang The i18n lang code
	 * @param data The i18n lang data.
	 */
	static loadLangData(lang: string, data: tI18nDefinition) {

		if (!Utils.isString(lang)) {
			throw new TypeError("[OWebI18n] your lang name should be a valid string.");
		}

		if (!Utils.isPlainObject(data)) {
			throw new TypeError("[OWebI18n] your lang data should be a valid plain object.");
		}

		LANG_OBJECT[lang] = Utils.assign(LANG_OBJECT[lang] || {}, data);

		return this;
	}
}