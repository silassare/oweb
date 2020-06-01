import OWebNet, { INetResponse, INetRequestOptions } from './OWebNet';
export default class OWebXHR<T> extends OWebNet<T> {
    private _abort?;
    private _sent;
    constructor(url: string, options: Partial<INetRequestOptions<T>>);
    private _assertNotSent;
    promise(): Promise<INetResponse<T>>;
    send(): this;
    abort(): this;
    private requestBody;
}
