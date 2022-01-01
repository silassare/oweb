export declare type OEventHandler = (...args: any[]) => void | boolean;
export default class OWebEvent {
    private _events;
    on(event: string, handler: (this: this, ...args: any[]) => ReturnType<OEventHandler>): this;
    off(event: string, handler: () => void): this;
    protected trigger(event: string, data?: any[], cancelable?: boolean, context?: any): boolean;
}
