import OWebEvent from './OWebEvent';
export declare type OI18nDefinition = {
    [key: string]: any;
};
export declare type OI18nData = {
    [key: string]: any;
};
export declare type OI18nOptions = {
    text?: string;
    lang?: string;
    data?: OI18nData;
    pluralize?: OI18nPluralize;
};
export declare type OI18n = OI18nOptions | string;
export declare type OI18nElement = string | {
    text?: string;
    placeholder?: string;
    title?: string;
    lang?: string;
    data?: OI18nData;
    pluralize?: OI18nPluralize;
};
export declare type OI18nPluralize = number | ((data: OI18nData, parts: string[]) => number);
export default class OWebI18n extends OWebEvent {
    defaultLangCode: string;
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
    toHuman(key: OI18n, data?: OI18nData, pluralize?: OI18nPluralize, lang?: string): string;
    /**
     * Sets i18n for HTMLElement
     *
     * @param el
     * @param options
     */
    el(el: HTMLElement, options: OI18nElement): void;
    /**
     * Sets the i18n lang data.
     *
     * @param lang The i18n lang code
     * @param data The i18n lang data.
     */
    static loadLangData(lang: string, data: OI18nDefinition): void;
}
