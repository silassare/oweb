export declare type OScriptFile = [string, () => boolean] | [string];
export declare type OBatchCb = (success: boolean, done: string[], failed: string[]) => void;
export declare type OScriptLoadCb = (src: string) => void;
export declare function noCache(url: string): string;
export declare function loadScript(src: string, then?: OScriptLoadCb, fail?: OScriptLoadCb, disableCache?: boolean): void;
export declare function loadScriptBatch(list: OScriptFile[], then?: OBatchCb, disableCache?: boolean): void;
