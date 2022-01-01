import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
export interface OJSONSerializable {
    toJSON(): OJSONValue;
}
export declare type OJSONValue = string | number | boolean | Date | OJSONSerializable | {
    [key: string]: OJSONValue;
} | OJSONValue[];
export default class OWebDataStore extends OWebEvent {
    static readonly EVT_DATA_STORE_CLEARED: string;
    private readonly _key;
    private _data;
    constructor(_appContext: OWebApp);
    set(key: string, value: OJSONValue): boolean;
    get(key: string | RegExp): any;
    remove(key: string | RegExp): boolean;
    clear(): boolean;
    onClear(cb: (this: this) => void): this;
    private _persist;
}
