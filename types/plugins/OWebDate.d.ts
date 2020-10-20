/**
 * D The day of the week short name
 * L  The day of the week full name
 * l The day of the week 0 to 6
 * ll The day of the week 1 to 7
 * d The day of the month
 * M The name of the month in three or four letters
 * F The full name of the month
 * m The number of the month 0 to 11
 * mm The number of the month 01 to 12
 * Y The year in four digits
 * y The year in two digits
 * h The hour using 0 to 12
 * H The hour using 0 to 23
 * i The minutes 0 to 59
 * s The seconds 0 to 59
 * a am / pm Display
 * A AM / PM display
 *
 * ii The minutes 00, 01,..., 59
 * ss The seconds 00, 01,..., 59
 * hh The hour 01,..., 12
 */
import OWebApp from '../OWebApp';
export declare type ODateValue = Date | number | string;
export declare type ODateDesc = {
    D: string;
    L: string;
    l: number;
    ll: number;
    d: number;
    M: string;
    F: string;
    m: number;
    mm: string;
    Y: number;
    y: number;
    h: number;
    hh: string;
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
    private _appContext;
    private date;
    constructor(_appContext: OWebApp, date?: ODateValue);
    /**
     * Format date with a given lang key.
     *
     * @param format
     */
    format(format: string): string;
    /**
     * Returns date description object.
     */
    describe(): ODateDesc;
    /**
     * Date setter.
     *
     * @param date
     */
    setDate(date: ODateValue): this;
    /**
     * Date getter.
     */
    getDate(): ODateValue;
    /**
     * Returns unix like timestamp.
     */
    static timestamp(): number;
}
