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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlBhZ2VCYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJQYWdlQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLENBQUMsT0FBTztJQWdCYjs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLEtBQTJCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsWUFBWSxDQUFDLE9BQXlCLEVBQUUsS0FBcUI7UUFDNUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsT0FBeUIsRUFBRSxLQUFxQjtJQUN2RCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxPQUFPLENBQUMsUUFBd0IsRUFBRSxRQUF3QjtJQUMxRCxDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYlBhZ2VyLCB7aVBhZ2UsIHRQYWdlUm91dGUsIHRQYWdlUm91dGVGdWxsfSBmcm9tIFwiLi9PV2ViUGFnZXJcIjtcbmltcG9ydCB7T1dlYlJvdXRlQ29udGV4dH0gZnJvbSBcIi4vT1dlYlJvdXRlclwiO1xuXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBPV2ViUGFnZUJhc2U8Q29tcG9uZW50PiBpbXBsZW1lbnRzIGlQYWdlPENvbXBvbmVudD4ge1xuXHQvKipcblx0ICogVGhlIHBhZ2UgbmFtZSBnZXR0ZXIuXG5cdCAqL1xuXHRhYnN0cmFjdCBnZXROYW1lKCk6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIHBhZ2Ugcm91dGVzIGdldHRlci5cblx0ICovXG5cdGFic3RyYWN0IGdldFJvdXRlcygpOiB0UGFnZVJvdXRlW107XG5cblx0LyoqXG5cdCAqIFRoZSBwYWdlIGNvbXBvbmVudCBnZXR0ZXIuXG5cdCAqL1xuXHRhYnN0cmFjdCBnZXRDb21wb25lbnQoKTogQ29tcG9uZW50O1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgb25jZSB3aGVuIHJlZ2lzdGVyaW5nIHRoZSBwYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFnZXJcblx0ICovXG5cdGluc3RhbGwocGFnZXI6IE9XZWJQYWdlcjxDb21wb25lbnQ+KTogdGhpcyB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogRG9lcyB0aGlzIHBhZ2UgcmVxdWlyZSBhIHZlcmlmaWVkIHVzZXIgZm9yIHRoZSByZXF1ZXN0ZWQgcGFnZSByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGFwcCBjb250ZXh0LlxuXHQgKiBAcGFyYW0gcm91dGUgVGhlIHJlcXVlc3QgcGFnZSByb3V0ZS5cblx0ICovXG5cdHJlcXVpcmVMb2dpbihjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0LCByb3V0ZTogdFBhZ2VSb3V0ZUZ1bGwpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIGJlZm9yZSBwYWdlIG9wZW4uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0XG5cdCAqIEBwYXJhbSByb3V0ZVxuXHQgKi9cblx0b25PcGVuKGNvbnRleHQ6IE9XZWJSb3V0ZUNvbnRleHQsIHJvdXRlOiB0UGFnZVJvdXRlRnVsbCk6IHZvaWQge1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCBiZWZvcmUgcGFnZSBjbG9zZS5cblx0ICpcblx0ICogQHBhcmFtIG9sZFJvdXRlXG5cdCAqIEBwYXJhbSBuZXdSb3V0ZVxuXHQgKi9cblx0b25DbG9zZShvbGRSb3V0ZTogdFBhZ2VSb3V0ZUZ1bGwsIG5ld1JvdXRlOiB0UGFnZVJvdXRlRnVsbCk6IHZvaWQge1xuXHR9XG59Il19