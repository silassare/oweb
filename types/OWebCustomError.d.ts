export default class OWebCustomError extends Error {
    private readonly data;
    constructor(message: any, data?: any);
    getData(): any;
}
