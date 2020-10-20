export default class OWebError extends Error {
    readonly data: any;
    /**
     * OWebError constructor.
     *
     * @param message
     * @param data
     */
    constructor(message: any, data?: any);
}
