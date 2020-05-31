/**
 * D The day of the week in three letters
 * l (L lowercase) The entire day of the week 0 to 6
 * ll (LL lowercase) The entire day of the week 1 to 7
 * d The day of the month
 * M The name of the month in three or four letters
 * F The full name of the month
 * m The number of the month 0 to 11
 * mm The number of the month 01 to 12
 * Y The year in four digits
 * y The year in two digits
 * h Time from 0 to 12
 * H Time from 0 to 23
 * i The minutes 0 to 59
 * s The seconds 0 to 59
 * a am / pm Display
 * A AM / PM display
 *
 * // OWebDate
 * ii The minutes 00, 01,..., 59
 * ss The seconds 00, 01,..., 59
 */
import OWebApp from '../OWebApp';
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
    private appContext;
    private date;
    constructor(appContext: OWebApp, date?: tDateValue);
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
