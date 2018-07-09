export declare type tScriptFile = [any, () => boolean] | [any];
declare type tBatchCb = (success: boolean, done: Array<string>, failed: Array<string>) => void;
declare type tTryLoadCb = (src: string) => void;
declare const _default: {
    noCache: (url: string) => string;
    tryLoad: (src: string, then?: tTryLoadCb | undefined, fail?: tTryLoadCb | undefined, disable_cache?: boolean) => void;
    batchLoad: (list: tScriptFile[], then?: tBatchCb | undefined, disable_cache?: boolean) => void;
};
export default _default;
