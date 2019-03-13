import OWebApp from "../OWebApp";
export declare type tDateValue = Date | number | string;
export declare type tDateDesc = {
    D: string;
    l: number;
    L: string;
    ll: number;
    LL: string;
    d: number;
    M: string;
    F: string;
    m: number;
    mm: string;
    Y: number;
    y: number;
    h: number;
    H: number;
    i: number;
    ii: string;
    s: number;
    ss: string;
    ms: number;
    a: string;
    A: string;
};
export default class OWebDate {
    private app_context;
    private date;
    constructor(app_context: OWebApp, date?: tDateValue);
    /**
     * Format date with a given lang key.
     *
     * @param langKey
     */
    format(langKey: string): string;
    /**
     * Returns date description object.
     */
    describe(): tDateDesc;
    /**
     * Date setter.
     *
     * @param date
     */
    setDate(date: tDateValue): this;
    /**
     * Date getter.
     */
    getDate(): tDateValue;
    /**
     * Returns unix like timestamp.
     */
    static timestamp(): number;
}
