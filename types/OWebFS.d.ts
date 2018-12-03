export declare type tFileQuality = 0 | 1 | 2 | 3;
export declare type tFileAliasInfo = {
    file_id: string;
    file_key: string;
};
export default class OWebFS {
    static readonly OFA_MIME_TYPE: string;
    static isFile(f: any): boolean;
    static isMarkedFile(f: any): boolean;
    static createFileAlias(info: tFileAliasInfo): File;
}
