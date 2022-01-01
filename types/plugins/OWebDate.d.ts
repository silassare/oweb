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
    format(format?: string): string;
    fromNow(): string;
    compare(_startDate: ODateValue, _endDate: ODateValue): {
        format: string;
    };
    describe(): ODateDesc;
    setDate(date: ODateValue): this;
    getDate(): ODateValue;
    static timestamp(): number;
}
