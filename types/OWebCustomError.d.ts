/**
 * OWeb custom error class.
 */
export default class OWebCustomError extends Error {
    readonly data: any;
    constructor(message: any, data?: any);
}
