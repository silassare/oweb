export declare type OEventHandler = (...args: any[]) => void | boolean;
export default class OWebEvent {
    private _events;
    /**
     * Register event handler.
     *
     * @param event The event name.
     * @param handler The event handler function.
     */
    on(event: string, handler: (this: this, ...args: any[]) => ReturnType<OEventHandler>): this;
    /**
     * Removes event handler.
     *
     * @param event The event name.
     * @param handler The event handler function.
     */
    off(event: string, handler: () => void): this;
    /**
     * Trigger an event.
     *
     * @param event The event name.
     * @param data The data to be passed as arguments to the event handlers.
     * @param cancelable When true the event will stop when a handler returns false.
     * @param context The context in which each handler will be called. Default: this.
     */
    protected trigger(event: string, data?: any[], cancelable?: boolean, context?: any): boolean;
}
//# sourceMappingURL=OWebEvent.d.ts.map