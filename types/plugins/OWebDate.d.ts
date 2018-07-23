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
    private readonly date;
    constructor(date: string);
    format(langKey: string, langCode: string): string;
    describe(langCode?: string): tDateDesc;
    static fromInputValue(date_str: string): OWebDate | false;
    static timestamp(): number;
}
