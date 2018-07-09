declare let Utils: {
    isPlainObject: (a: any) => boolean;
    isString: (a: any) => a is string;
    isArray: (arg: any) => arg is any[];
    isFunction: (a: any) => a is Function;
    isEmpty: (a: any) => boolean;
    isNotEmpty: (a: any) => boolean;
    toArray: (a: any) => any[];
    isInDOM: (element: any, inBody?: boolean) => boolean;
    shuffle: (a: any[]) => any[];
    callback: (fn: any, args?: any[] | undefined, ctx?: any) => any;
    assign: any;
    expose: (items: string[], ctx: any) => object;
    getFrom: (from: object, key: string) => any;
    stringKeyReplace: (str: string, data: object) => string;
    textToLineString: (text: string) => string;
    iterate: (obj: {} | any[], fn: (key: any, value: any) => void) => void;
    date: {
        [key: string]: Function;
    };
    math: {
        numberFormat: (x: string | number, dec?: number, decimalSep?: string, digitsSep?: string) => string;
    };
    buildQueryString: (object: object, prefix: string) => string;
    parseQueryString: (str: string) => {};
    eventCancel: (e: Event) => void;
};
export default Utils;
