export default class OWebPageBase {
    /**
     * Called once when registering the page.
     *
     * @param pager
     */
    install(pager) {
        return this;
    }
    /**
     * Does this page require a verified user for the requested page route.
     *
     * @param context The app context.
     * @param route The request page route.
     */
    requireLogin(context, route) {
        return false;
    }
    /**
     * Called before page open.
     *
     * @param context
     * @param route
     */
    // tslint:disable-next-line: no-empty
    onOpen(context, route) { }
    /**
     * Called before page close.
     *
     * @param oldRoute
     * @param newRoute
     */
    // tslint:disable-next-line: no-empty
    onClose(oldRoute, newRoute) { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlBhZ2VCYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJQYWdlQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLENBQUMsT0FBTyxPQUFnQixZQUFZO0lBaUJ6Qzs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLEtBQTJCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsWUFBWSxDQUFDLE9BQXlCLEVBQUUsS0FBcUI7UUFDNUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxxQ0FBcUM7SUFDckMsTUFBTSxDQUFDLE9BQXlCLEVBQUUsS0FBcUIsSUFBUyxDQUFDO0lBRWpFOzs7OztPQUtHO0lBQ0gscUNBQXFDO0lBQ3JDLE9BQU8sQ0FBQyxRQUF3QixFQUFFLFFBQXdCLElBQVMsQ0FBQztDQUNwRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViUGFnZXIsIHsgSVBhZ2UsIElQYWdlUm91dGUsIElQYWdlUm91dGVGdWxsIH0gZnJvbSAnLi9PV2ViUGFnZXInO1xuaW1wb3J0IE9XZWJSb3V0ZUNvbnRleHQgZnJvbSAnLi9PV2ViUm91dGVDb250ZXh0JztcblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgT1dlYlBhZ2VCYXNlPENvbXBvbmVudD5cblx0aW1wbGVtZW50cyBJUGFnZTxDb21wb25lbnQ+IHtcblx0LyoqXG5cdCAqIFRoZSBwYWdlIG5hbWUgZ2V0dGVyLlxuXHQgKi9cblx0YWJzdHJhY3QgZ2V0TmFtZSgpOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBwYWdlIHJvdXRlcyBnZXR0ZXIuXG5cdCAqL1xuXHRhYnN0cmFjdCBnZXRSb3V0ZXMoKTogSVBhZ2VSb3V0ZVtdO1xuXG5cdC8qKlxuXHQgKiBUaGUgcGFnZSBjb21wb25lbnQgZ2V0dGVyLlxuXHQgKi9cblx0YWJzdHJhY3QgZ2V0Q29tcG9uZW50KCk6IENvbXBvbmVudDtcblxuXHQvKipcblx0ICogQ2FsbGVkIG9uY2Ugd2hlbiByZWdpc3RlcmluZyB0aGUgcGFnZS5cblx0ICpcblx0ICogQHBhcmFtIHBhZ2VyXG5cdCAqL1xuXHRpbnN0YWxsKHBhZ2VyOiBPV2ViUGFnZXI8Q29tcG9uZW50Pik6IHRoaXMge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIERvZXMgdGhpcyBwYWdlIHJlcXVpcmUgYSB2ZXJpZmllZCB1c2VyIGZvciB0aGUgcmVxdWVzdGVkIHBhZ2Ugcm91dGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBhcHAgY29udGV4dC5cblx0ICogQHBhcmFtIHJvdXRlIFRoZSByZXF1ZXN0IHBhZ2Ugcm91dGUuXG5cdCAqL1xuXHRyZXF1aXJlTG9naW4oY29udGV4dDogT1dlYlJvdXRlQ29udGV4dCwgcm91dGU6IElQYWdlUm91dGVGdWxsKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCBiZWZvcmUgcGFnZSBvcGVuLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dFxuXHQgKiBAcGFyYW0gcm91dGVcblx0ICovXG5cdC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tZW1wdHlcblx0b25PcGVuKGNvbnRleHQ6IE9XZWJSb3V0ZUNvbnRleHQsIHJvdXRlOiBJUGFnZVJvdXRlRnVsbCk6IHZvaWQge31cblxuXHQvKipcblx0ICogQ2FsbGVkIGJlZm9yZSBwYWdlIGNsb3NlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb2xkUm91dGVcblx0ICogQHBhcmFtIG5ld1JvdXRlXG5cdCAqL1xuXHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWVtcHR5XG5cdG9uQ2xvc2Uob2xkUm91dGU6IElQYWdlUm91dGVGdWxsLCBuZXdSb3V0ZTogSVBhZ2VSb3V0ZUZ1bGwpOiB2b2lkIHt9XG59XG4iXX0=