export declare const id: () => string;
export declare const noop: () => void;
export declare const isArray: (arg: any) => arg is any[];
export declare const isPlainObject: (a: any) => boolean;
export declare const isString: (a: any) => a is string;
export declare const isFunction: (a: any) => a is (...args: any[]) => any;
export declare const isEmpty: (a: any) => boolean;
export declare const isNotEmpty: (a: any) => boolean;
export declare const toArray: (a: any) => any[];
export declare const escapeRegExp: (str: string) => string;
export declare const callback: (fn: any, args?: any[] | undefined, ctx?: any) => any;
export declare const forEach: <T>(obj: {
    [key: string]: T;
} | T[], fn: (value: T, key: any) => void) => void;
export declare const assign: any;
export declare const clone: <T>(a: T) => T;
export declare const stringPlaceholderReplace: (str: string, data: object) => string;
export declare const textToLineString: (text: string) => string;
export declare const _setDigitsSep: (x: number, sep: string) => string;
export declare const numberFormat: (x: number | string, dec?: number, decimalSep?: string, digitsSep?: string) => string;
export declare const gt: (x: number, y: number, eq?: boolean) => boolean;
export declare const lt: (x: number, y: number, eq?: boolean) => boolean;
export declare const between: (x: number, a: number, b: number, eq?: boolean) => boolean;
export declare const isRange: (a: any, b: any) => boolean;
export declare const isInDOM: (element: any, inBody?: boolean) => boolean;
export declare const buildQueryString: (object: object, prefix: string) => string;
export declare const shuffle: (a: any[]) => any[];
export declare const parseQueryString: (str: string) => {};
export declare const preventDefault: (e: Event) => void;
export declare const isValidAge: (day: number, month: number, year: number, minAge: number, maxAge: number) => boolean;
export declare const fileSizeFormat: (size: number, decimalPoint?: string, thousandsSep?: string) => string;
/**
 * Opens the provided url by injecting a hidden iframe that calls
 * window.open(), then removes the iframe from the DOM.
 *
 * Prevent reverse tabnabbing phishing attacks caused by _blank
 *
 * https://mathiasbynens.github.io/rel-noopener/
 *
 * https://github.com/danielstjules/blankshield/blob/6e208bf25a44bf50d1a5e85ae96fee0c015d05bc/blankshield.js#L166
 *
 * @param url
 * @param strWindowName
 * @param strWindowFeatures
 */
export declare const safeOpen: (url?: string, strWindowName?: string, strWindowFeatures?: string) => Window | null;
export declare const logger: {
    readonly debug: (...data: any[]) => void;
    readonly log: (...data: any[]) => void;
    readonly info: (...data: any[]) => void;
    readonly error: (...data: any[]) => void;
    readonly warn: (...data: any[]) => void;
};
