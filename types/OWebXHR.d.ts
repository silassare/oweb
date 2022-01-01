import OWebNet, { ONetRequestOptions, ONetResponse } from './OWebNet';
export default class OWebXHR<T> extends OWebNet<T> {
    private _abort?;
    private _sent;
    constructor(url: string, options: Partial<ONetRequestOptions<T>>);
    isSent(): boolean;
    send(): Promise<ONetResponse<T>>;
    abort(): this;
    private requestBody;
}
