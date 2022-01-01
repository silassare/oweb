export default class OWebError extends Error {
    readonly data: any;
    constructor(message?: Error | string, data?: any);
}
