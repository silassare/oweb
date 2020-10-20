export declare const id: () => string;
export declare const noop: () => undefined;
export declare const isArray: (arg: any) => arg is any[];
export declare const isPlainObject: (a: any) => a is {};
export declare const isString: (a: any) => a is string;
export declare const isFunction: (a: any) => a is (...args: any[]) => any;
export declare function isEmpty(a: any): boolean;
export declare const isNotEmpty: (a: any) => boolean;
export declare const toArray: (a: any) => any[];
export declare const escapeRegExp: (str: string) => string;
export declare function callback(fn: any, args?: any[], ctx?: any): any;
export declare function forEach<T>(obj: {
    [key: string]: T;
} | T[], fn: (value: T, key: any) => void): void;
export declare const assign: any;
export declare function clone<T>(a: T): T;
export declare function stringPlaceholderReplace(str: string, data: object): string;
export declare function textToLineString(text: string): string;
export declare function _setDigitsSep(x: number, sep: string): string;
export declare function numberFormat(x: number | string, dec?: number, decimalSep?: string, digitsSep?: string): string;
export declare function gt(x: number, y: number, eq?: boolean): boolean;
export declare function lt(x: number, y: number, eq?: boolean): boolean;
export declare function between(x: number, a: number, b: number, eq?: boolean): boolean;
export declare function isRange(a: any, b: any): boolean;
export declare function isInDOM(element: any, inBody?: boolean): boolean;
export declare function shuffle(a: any[]): any[];
export declare function parseQueryString(str: string): {};
export declare function preventDefault(e: Event): void;
export declare function isValidAge(day: number, month: number, year: number, minAge: number, maxAge: number): boolean;
export declare function fileSizeFormat(size: number, decimalPoint?: string, thousandsSep?: string): string;
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
export declare function safeOpen(url?: string, strWindowName?: string, strWindowFeatures?: string): Window | null;
export declare const logger: Console & {
    on: () => void;
    off: () => void;
};
export declare function encode(val: string): string;
/**
 * Build query string from object. Recursively!
 * @param params
 * @param prefix
 */
export declare function buildQueryString(params: object | URLSearchParams, prefix?: string): string;
/**
 * Build a URL with a given params
 *
 * @param url
 * @param params
 */
export declare function buildURL(url: string, params: object | URLSearchParams): string;
export * from './scriptLoader';
export { default as PathResolver } from './PathResolver';
