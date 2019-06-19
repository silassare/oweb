import OWebEvent from "../src/OWebEvent";
import OWebApp from "../src/OWebApp";
export declare type tI18nDefinition = {
    [key: string]: any;
};
export declare type tI18nData = {
    [key: string]: any;
};
export declare type tI18nOptions = {
    text?: string;
    placeholder?: string;
    title?: string;
    lang?: string;
    data?: tI18nData;
    pluralize?: tI18nPluralize;
};
export declare type tI18nPluralize = number | ((parts: string[]) => number);
export default class OWebI18n extends OWebEvent {
    private app_context;
    defaultLangCode: string;
    /**
     * @param app_context The app context.
     */
    constructor(app_context: OWebApp);
    /**
     * Sets default i18n lang code.
     *
     * @param lang The i18n lang code.
     */
    setDefaultLang(lang: string): this;
    /**
     * Returns i18n translation.
     *
     * @param key The i18n string key.
     * @param data The data to inject in translation process.
     * @param pluralize
     * @param lang The i18n lang code to use.
     */
    toHuman(key: string, data?: tI18nData, pluralize?: tI18nPluralize, lang?: string): string;
    /**
     * Sets i18n for HTMLElement
     *
     * @param el
     * @param options
     */
    el(el: HTMLElement, options: tI18nOptions | string): void;
    /**
     * Sets the i18n lang data.
     *
     * @param lang The i18n lang code
     * @param data The i18n lang data.
     */
    static loadLangData(lang: string, data: tI18nDefinition): typeof OWebI18n;
}
