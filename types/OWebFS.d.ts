export declare type OFileQuality = 0 | 1 | 2 | 3;
export declare type OFileAliasInfo = {
    file_id: string;
    file_key: string;
};
export declare type OFileMarked = (Blob | File) & {
    oz_mark_file_id?: string;
    oz_mark_file_key?: string;
};
export default class OWebFS {
    static readonly OFA_MIME_TYPE = "text/x-ozone-file-alias";
    static isFile(f: unknown): f is OFileMarked;
    static isMarkedFile(f: unknown): boolean;
    static createFileAlias(info: OFileAliasInfo): File;
}
