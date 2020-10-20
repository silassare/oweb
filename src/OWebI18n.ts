import OWebEvent from './OWebEvent';
import { assign, isPlainObject, isString } from './utils';

export type OI18nDefinition = { [key: string]: any };
export type OI18nData = { [key: string]: any };
export type OI18nOptions = {
	text?: string;
	placeholder?: string;
	title?: string;
	lang?: string;
	data?: OI18nData;
	pluralize?: OI18nPluralize;
};
export type OI18n = OI18nOptions | string;

export type OI18nPluralize =
	| number
	| ((data: OI18nData, parts: string[]) => number);

const LANG_OBJECT: { [key: string]: OI18nDefinition } = {};
// {name} | {@message} | {@app.name} | {@fr:message} | {@fr:app.name}
const TOKEN_REG = /{\s*(@)?(?:([a-z-]{2,}):)?((?:[a-z_][a-z0-9_]*)(?:\.[a-z_][a-z0-9_]*)*)\s*}/gi;

/**
 * ```js
 *
 * const samples = {
 *  message                               : 'Hello World!',
 *  message_with_token                    : 'Hello {name}!',
 *  message_with_pluralize                : 'one message ~ two messages ~ {n} messages',
 *  message_with_sub_message              : '{@message_with_token} Welcome to our website.',
 *  message_with_sub_message_deep         : 'App name is: {@app.name}.',
 *  message_with_sub_message_specific_lang: '{@fr:message_with_token} We speak french too!',
 *  app                                   : {
 * 		name: 'MagicApp'
 * 	}
 * };
 * ```
 */
const parse = function (str: string) {
	const out = str
		.replace(/([\r\n"'])/g, '\\$1')
		.replace(TOKEN_REG, function (found, isSub, lang, path) {
			let l, x;
			if (isSub) {
				l = lang ? '"' + lang + '"' : 'l';
				x = `_(d["${path}"] || "${path}", d, 0, ${l})`;
			} else {
				x = 'd.' + path;
			}

			return '"+' + x + '+"';
		});

	return new Function(
		'_',
		'd',
		'l',
		`return ["${out}"];`.replace(/\s?~\s?/g, '","'),
	);
};
const getKey = function (key: string, langData: any) {
	const parts = (key || '').split('.');
	let message = langData;

	for (let i = 0; i < parts.length; i++) {
		if (message === undefined || message === null) {
			return undefined;
		}

		message = message[parts[i]] || undefined;
	}

	return message;
};

const _tmp = new Map(),
	translate = function (
		key: string,
		data: OI18nData,
		pluralize: OI18nPluralize = 0,
		lang: string,
	): string {
		const id = `${lang}:${key}`;
		let message = key,
			format,
			fn;

		if (_tmp.has(id)) {
			fn = _tmp.get(id);
		} else if (
			LANG_OBJECT[lang] &&
			(format = getKey(key, LANG_OBJECT[lang]))
		) {
			_tmp.set(id, (fn = parse(format)));
		}

		if (fn) {
			const parts = fn(translate, data, lang),
				len = parts.length;
			let index;

			if (typeof pluralize === 'function') {
				index = pluralize(data, parts);
			} else {
				index = pluralize;
			}

			index = Math.max(Math.min(index, len - 1), 0);
			message = parts[index];
		}

		return message;
	};

export default class OWebI18n extends OWebEvent {
	defaultLangCode = 'en';

	/**
	 * Sets default i18n lang code.
	 *
	 * @param lang The i18n lang code.
	 */
	setDefaultLang(lang: string) {
		if (!LANG_OBJECT[lang]) {
			throw new Error(
				`[OWebLang] can't set default language, undefined language data for: ${lang}.`,
			);
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
	toHuman(
		key: OI18n,
		data: OI18nData = {},
		pluralize: OI18nPluralize = 0,
		lang: string = this.defaultLangCode,
	): string {
		if (typeof key !== 'string') {
			const opt: OI18nOptions = key as any;
			return translate(
				opt.text || '',
				opt.data || data,
				opt.pluralize || pluralize,
				opt.lang || lang,
			);
		}

		return translate(key, data, pluralize, lang);
	}

	/**
	 * Sets i18n for HTMLElement
	 *
	 * @param el
	 * @param options
	 */
	el(el: HTMLElement, options: OI18n) {
		if (typeof options === 'string') {
			options = { text: options };
		}

		const { nodeName } = el,
			isInput = nodeName === 'INPUT' || nodeName === 'TEXTAREA',
			{
				text,
				placeholder,
				title,
				data = {},
				lang = this.defaultLangCode,
				pluralize,
			} = options;
		let str;

		if (text) {
			str = translate(text, data, pluralize, lang);
			if (!isInput) {
				el.innerHTML = str;
			} else {
				el.setAttribute('value', str);
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
	static loadLangData(lang: string, data: OI18nDefinition) {
		if (!isString(lang)) {
			throw new TypeError(
				'[OWebI18n] your lang name should be a valid string.',
			);
		}

		if (!isPlainObject(data)) {
			throw new TypeError(
				'[OWebI18n] your lang data should be a valid plain object.',
			);
		}

		LANG_OBJECT[lang] = assign(LANG_OBJECT[lang] || {}, data);

		return this;
	}
}
