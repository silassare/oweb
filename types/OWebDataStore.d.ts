export default class OWebDataStore {
    static save(keyName: string, data: any): boolean;
    static load(keyName: string): any;
    static remove(keyName: string): boolean;
    static clear(): boolean;
}
