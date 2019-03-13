export declare type tFileQuality = 0 | 1 | 2 | 3;
export declare type tFileAliasInfo = {
    file_id: string;
    file_key: string;
};
export default class OWebFS {
    static readonly OFA_MIME_TYPE: string;
    /**
     * Check for file object.
     *
     * @param f
     */
    static isFile(f: any): boolean;
    /**
     * Check for marked file object.
     * @param f
     */
    static isMarkedFile(f: any): boolean;
    /**
     * Create O'Zone file alias.
     *
     * @param info
     */
    static createFileAlias(info: tFileAliasInfo): File;
}
