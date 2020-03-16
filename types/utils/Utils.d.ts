declare const Utils: {
    isPlainObject: (a: any) => boolean;
    isString: (a: any) => a is string;
    isArray: (arg: any) => arg is any[];
    isFunction: (a: any) => a is Function;
    isEmpty: (a: any) => boolean;
    isNotEmpty: (a: any) => boolean;
    toArray: (a: any) => any[];
    isInDOM: (element: any, inBody?: boolean) => boolean;
    shuffle: (a: any[]) => any[];
    escapeRegExp: (str: string) => string;
    id: () => string;
    callback: (fn: any, args?: any[] | undefined, ctx?: any) => any;
    assign: any;
    copy: <T>(a: T) => T;
    expose: (items: string[], ctx: any) => object;
    getFrom: (from: object, key: string) => any;
    stringKeyReplace: (str: string, data: object) => string;
    textToLineString: (text: string) => string;
    forEach: <T_1>(obj: {
        [key: string]: T_1;
    } | T_1[], fn: (value: T_1, key: any) => void) => void;
    math: {
        numberFormat: (x: string | number, dec?: number, decimalSep?: string, digitsSep?: string) => string;
        gt: (x: number, y: number, eq?: boolean) => boolean;
        lt: (x: number, y: number, eq?: boolean) => boolean;
        between: (x: number, a: number, b: number, eq?: boolean) => boolean;
        isRange: (a: number, b: number) => boolean;
    };
    isValidAge: (day: number, month: number, year: number, minAge: number, maxAge: number) => boolean;
    buildQueryString: (object: object, prefix: string) => string;
    parseQueryString: (str: string) => {};
    eventCancel: (e: Event) => void;
    preventDefault: (e: Event) => void;
    fileSizeFormat: (size: number, decimalPoint?: string, thousandsSep?: string) => string;
    safeOpen: (url?: string, strWindowName?: string, strWindowFeatures?: string) => Window | null;
};
export default Utils;
