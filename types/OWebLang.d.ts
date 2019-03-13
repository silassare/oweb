import OWebEvent from "./OWebEvent";
import OWebApp from "./OWebApp";
export declare type tLangInjectData = {
    [key: string]: any;
};
export declare type tLangDefinition = {
    [key: string]: any;
};
export declare type tLangPluginArgs = {
    context: OWebApp;
    data: tLangInjectData;
    langCode: string;
};
export declare type tLangPluginFn = (o: tLangPluginArgs) => tLangInjectData;
export declare type tLangFormatterArgs = {
    context: OWebApp;
    args: string[];
    langCode: string;
};
export declare type tLangFormatterFn = (o: tLangFormatterArgs) => string;
export default class OWebLang extends OWebEvent {
    private app_context;
    defaultLangCode: string;
    /**
     * @param app_context The app context.
     */
    constructor(app_context: OWebApp);
    /**
     * Set default i18n lang code.
     *
     * @param langCode The i18n lang code.
     */
    setDefaultLang(langCode: string): this;
    /**
     * Returns i18n translation.
     *
     * @param langKey The i18n string key.
     * @param langData The data to inject in translation process.
     * @param langCode The i18n lang code to use.
     */
    toHuman(langKey: string, langData?: tLangInjectData, langCode?: string): string;
    /**
     * Update an element content/placeholder/title.
     *
     * @param el The element to update.
     * @param data The data to inject in i18n translation process.
     */
    updateElement(el: HTMLElement, data: tLangInjectData): this;
    /**
     * Sets the i18n lang data.
     *
     * @param langCode The i18n lang code
     * @param data The i18n lang data.
     */
    static setLangData(langCode: string, data: tLangDefinition): typeof OWebLang;
    /**
     * Returns the i18n string.
     *
     * @param textKey The i18n text key.
     * @param langCode The i18n lang code
     */
    static getLangText(textKey: string, langCode: string): any;
    /**
     * Adds plugin.
     *
     * @param name The plugin name.
     * @param fn The plugin function.
     */
    static addPlugin(name: string, fn: tLangPluginFn): typeof OWebLang;
}
