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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlBhZ2VCYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJQYWdlQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLENBQUMsT0FBTyxPQUFnQixZQUFZO0lBaUJ6Qzs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLEtBQTJCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsWUFBWSxDQUFDLE9BQXlCLEVBQUUsS0FBcUI7UUFDNUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxxQ0FBcUM7SUFDckMsTUFBTSxDQUFDLE9BQXlCLEVBQUUsS0FBcUIsSUFBUyxDQUFDO0lBRWpFOzs7OztPQUtHO0lBQ0gscUNBQXFDO0lBQ3JDLE9BQU8sQ0FBQyxRQUF3QixFQUFFLFFBQXdCLElBQVMsQ0FBQztDQUNwRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViUGFnZXIsIHtJUGFnZSwgSVBhZ2VSb3V0ZSwgSVBhZ2VSb3V0ZUZ1bGx9IGZyb20gJy4vT1dlYlBhZ2VyJztcbmltcG9ydCBPV2ViUm91dGVDb250ZXh0IGZyb20gJy4vT1dlYlJvdXRlQ29udGV4dCc7XG5cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIE9XZWJQYWdlQmFzZTxDb21wb25lbnQ+XG5cdGltcGxlbWVudHMgSVBhZ2U8Q29tcG9uZW50PiB7XG5cdC8qKlxuXHQgKiBUaGUgcGFnZSBuYW1lIGdldHRlci5cblx0ICovXG5cdGFic3RyYWN0IGdldE5hbWUoKTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgcGFnZSByb3V0ZXMgZ2V0dGVyLlxuXHQgKi9cblx0YWJzdHJhY3QgZ2V0Um91dGVzKCk6IElQYWdlUm91dGVbXTtcblxuXHQvKipcblx0ICogVGhlIHBhZ2UgY29tcG9uZW50IGdldHRlci5cblx0ICovXG5cdGFic3RyYWN0IGdldENvbXBvbmVudCgpOiBDb21wb25lbnQ7XG5cblx0LyoqXG5cdCAqIENhbGxlZCBvbmNlIHdoZW4gcmVnaXN0ZXJpbmcgdGhlIHBhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYWdlclxuXHQgKi9cblx0aW5zdGFsbChwYWdlcjogT1dlYlBhZ2VyPENvbXBvbmVudD4pOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBEb2VzIHRoaXMgcGFnZSByZXF1aXJlIGEgdmVyaWZpZWQgdXNlciBmb3IgdGhlIHJlcXVlc3RlZCBwYWdlIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSByb3V0ZSBUaGUgcmVxdWVzdCBwYWdlIHJvdXRlLlxuXHQgKi9cblx0cmVxdWlyZUxvZ2luKGNvbnRleHQ6IE9XZWJSb3V0ZUNvbnRleHQsIHJvdXRlOiBJUGFnZVJvdXRlRnVsbCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsZWQgYmVmb3JlIHBhZ2Ugb3Blbi5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRcblx0ICogQHBhcmFtIHJvdXRlXG5cdCAqL1xuXHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWVtcHR5XG5cdG9uT3Blbihjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0LCByb3V0ZTogSVBhZ2VSb3V0ZUZ1bGwpOiB2b2lkIHt9XG5cblx0LyoqXG5cdCAqIENhbGxlZCBiZWZvcmUgcGFnZSBjbG9zZS5cblx0ICpcblx0ICogQHBhcmFtIG9sZFJvdXRlXG5cdCAqIEBwYXJhbSBuZXdSb3V0ZVxuXHQgKi9cblx0Ly8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1lbXB0eVxuXHRvbkNsb3NlKG9sZFJvdXRlOiBJUGFnZVJvdXRlRnVsbCwgbmV3Um91dGU6IElQYWdlUm91dGVGdWxsKTogdm9pZCB7fVxufVxuIl19