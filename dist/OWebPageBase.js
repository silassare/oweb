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
    onOpen(context, route) {
    }
    /**
     * Called before page close.
     *
     * @param oldRoute
     * @param newRoute
     */
    onClose(oldRoute, newRoute) {
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlBhZ2VCYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJQYWdlQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLENBQUMsT0FBTztJQVdiOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsS0FBZ0I7UUFDdkIsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxZQUFZLENBQUMsT0FBeUIsRUFBRSxLQUFxQjtRQUM1RCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxPQUF5QixFQUFFLEtBQXFCO0lBQ3ZELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE9BQU8sQ0FBQyxRQUF3QixFQUFFLFFBQXdCO0lBQzFELENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViUGFnZXIsIHtpUGFnZSwgdFBhZ2VSb3V0ZSwgdFBhZ2VSb3V0ZUZ1bGx9IGZyb20gXCIuL09XZWJQYWdlclwiO1xuaW1wb3J0IHtPV2ViUm91dGVDb250ZXh0fSBmcm9tIFwiLi9PV2ViUm91dGVyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIE9XZWJQYWdlQmFzZSBpbXBsZW1lbnRzIGlQYWdlIHtcblx0LyoqXG5cdCAqIFRoZSBwYWdlIG5hbWUgZ2V0dGVyLlxuXHQgKi9cblx0YWJzdHJhY3QgZ2V0TmFtZSgpOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBwYWdlIHJvdXRlcyBnZXR0ZXIuXG5cdCAqL1xuXHRhYnN0cmFjdCBnZXRSb3V0ZXMoKTogdFBhZ2VSb3V0ZVtdO1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgb25jZSB3aGVuIHJlZ2lzdGVyaW5nIHRoZSBwYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFnZXJcblx0ICovXG5cdGluc3RhbGwocGFnZXI6IE9XZWJQYWdlcik6IHRoaXMge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIERvZXMgdGhpcyBwYWdlIHJlcXVpcmUgYSB2ZXJpZmllZCB1c2VyIGZvciB0aGUgcmVxdWVzdGVkIHBhZ2Ugcm91dGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBhcHAgY29udGV4dC5cblx0ICogQHBhcmFtIHJvdXRlIFRoZSByZXF1ZXN0IHBhZ2Ugcm91dGUuXG5cdCAqL1xuXHRyZXF1aXJlTG9naW4oY29udGV4dDogT1dlYlJvdXRlQ29udGV4dCwgcm91dGU6IHRQYWdlUm91dGVGdWxsKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCBiZWZvcmUgcGFnZSBvcGVuLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dFxuXHQgKiBAcGFyYW0gcm91dGVcblx0ICovXG5cdG9uT3Blbihjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0LCByb3V0ZTogdFBhZ2VSb3V0ZUZ1bGwpOiB2b2lkIHtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsZWQgYmVmb3JlIHBhZ2UgY2xvc2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBvbGRSb3V0ZVxuXHQgKiBAcGFyYW0gbmV3Um91dGVcblx0ICovXG5cdG9uQ2xvc2Uob2xkUm91dGU6IHRQYWdlUm91dGVGdWxsLCBuZXdSb3V0ZTogdFBhZ2VSb3V0ZUZ1bGwpOiB2b2lkIHtcblx0fVxufSJdfQ==