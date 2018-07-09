export default class OWebEvent {
    _app_events: {
        [key: string]: Array<Function>;
    };
    constructor();
    on(event: string, handler: Function): this;
    off(event: string, handler: Function): this;
    protected trigger(event: string, data?: Array<any>, cancelable?: boolean, callback?: Function): this;
}
