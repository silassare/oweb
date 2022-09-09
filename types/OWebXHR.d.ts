import OWebNet, { ONetRequestOptions, ONetResponse } from './OWebNet';
export default class OWebXHR<T> extends OWebNet<T> {
    private _abort?;
    private _sent;
    /**
     * OWebXHR constructor.
     *
     * @param url
     * @param options
     */
    constructor(url: string, options: Partial<ONetRequestOptions<T>>);
    /**
     * @inheritDoc
     */
    isSent(): boolean;
    /**
     * @inheritDoc
     */
    send(): Promise<ONetResponse<T>>;
    /**
     * @inheritDoc
     */
    abort(): this;
    /**
     * Builds the request body.
     *
     * @param body
     * @private
     */
    private requestBody;
}
//# sourceMappingURL=OWebXHR.d.ts.map