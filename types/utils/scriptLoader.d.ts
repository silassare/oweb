export declare type tScriptFile = [any, () => boolean] | [any];
declare type tBatchCb = (success: boolean, done: string[], failed: string[]) => void;
declare type tTryLoadCb = (src: string) => void;
declare const _default: {
    noCache: (url: string) => string;
    tryLoad: (src: string, then?: tTryLoadCb | undefined, fail?: tTryLoadCb | undefined, disableCache?: boolean) => void;
    batchLoad: (list: tScriptFile[], then?: tBatchCb | undefined, disableCache?: boolean) => void;
};
export default _default;
