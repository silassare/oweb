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
    setDefaultLang(lang: string): this;
    toHuman(key: OI18n, data?: OI18nData, pluralize?: OI18nPluralize, lang?: string): string;
    el(el: HTMLElement, options: OI18nElement): void;
    static loadLangData(lang: string, data: OI18nDefinition): void;
}
