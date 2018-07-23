export default class OWebEvent {
    private _app_events;
    protected constructor();
    on(event: string, handler: Function): this;
    off(event: string, handler: Function): this;
    protected trigger(event: string, data?: Array<any>, cancelable?: boolean, callback?: Function): this;
}
