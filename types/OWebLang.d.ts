export declare type tLangDefinition = {
    [key: string]: any;
};
export declare class OTranslator {
    private readonly ele;
    constructor(element: HTMLElement);
    update(handler?: Function, context?: any): void;
}
export default class OWebLang {
    static getTranslator(ele: HTMLElement): OTranslator;
    static setLangData(langCode: string, data: tLangDefinition): typeof OWebLang;
    static getLangText(textKey: string, langCode: string): any;
    static setDefaultLang(langCode: string): typeof OWebLang;
    static addLangDirectories(path: string): typeof OWebLang;
    static updateAll(): typeof OWebLang;
    static addPlugin(name: string, fn: Function): typeof OWebLang;
    static toHuman(langKey: string, langData?: any, langCode?: string): string;
}
