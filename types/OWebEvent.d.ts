export default class OWebEvent {
    private _events;
    protected constructor();
    /**
     * Register event handler.
     *
     * @param event The event name.
     * @param handler The event handler function.
     */
    on(event: string, handler: (this: this, ...args: any[]) => void | boolean): this;
    /**
     * Removes event handler.
     *
     * @param event The event name.
     * @param handler The event handler function.
     */
    off(event: string, handler: Function): this;
    /**
     * Trigger an event.
     *
     * @param event The event name.
     * @param data The data to be passed as arguments to the event handlers.
     * @param cancelable When true the event will stop when a handler returns false.
     * @param context The context in which each handler will be called. Default: this.
     */
    protected trigger(event: string, data?: Array<any>, cancelable?: boolean, context?: any): boolean;
}
