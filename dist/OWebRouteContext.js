import { searchParam, logger } from './utils';
export default class OWebRouteContext {
    _tokens;
    _stopped = false;
    _target;
    _state;
    _router;
    /**
     * OWebRouteContext constructor.
     *
     * @param router
     * @param target
     * @param state
     */
    constructor(router, target, state) {
        this._target = target;
        this._tokens = {};
        this._state = state || {};
        this._router = router;
    }
    /**
     * Gets route token value
     *
     * @param token The token.
     */
    getToken(token, def) {
        return this._tokens[token] ?? def ?? null;
    }
    /**
     * Gets a map of all tokens and values.
     */
    getTokens() {
        return { ...this._tokens };
    }
    /**
     * Gets the path.
     */
    getPath() {
        return this._target.path;
    }
    /**
     * Gets stored value in history state with a given key.
     *
     * @param key the state key
     */
    getStateItem(key, def) {
        return this._state[key] ?? def ?? null;
    }
    /**
     * Sets a key in history state.
     *
     * @param key the state key
     * @param value  the state value
     */
    setStateItem(key, value) {
        this._state[key] = value;
        return this.save();
    }
    /**
     * Gets search param value.
     *
     * @param name the search param name
     * @param def the default to return when not defined
     */
    getSearchParam(name, def) {
        return searchParam(name, this._target.href) ?? def ?? null;
    }
    /**
     * Check if the route dispatcher is stopped.
     */
    stopped() {
        return this._stopped;
    }
    /**
     * Stop the route dispatcher.
     */
    stop() {
        if (!this._stopped) {
            logger.debug('[OWebDispatchContext] route context will stop.');
            this.save(); // save before stop
            this._stopped = true;
            const cd = this._router.getCurrentDispatcher();
            cd && cd.cancel();
            logger.debug('[OWebDispatchContext] route context was stopped!');
        }
        else {
            logger.warn('[OWebDispatchContext] route context already stopped!');
        }
        return this;
    }
    /**
     * Save history state.
     */
    save() {
        if (!this.stopped()) {
            logger.debug('[OWebDispatchContext] saving state...');
            this._router.replaceHistory(this._target.href, this._state);
        }
        else {
            logger.error('[OWebDispatchContext] you should not try to save when stopped.');
        }
        return this;
    }
    /**
     * Runs action attached to a given route.
     *
     * @param route
     */
    actionRunner(route) {
        this._tokens = route.parse(this._target.path);
        route.getAction()(this);
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRTlDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sZ0JBQWdCO0lBQzVCLE9BQU8sQ0FBZTtJQUN0QixRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ1IsT0FBTyxDQUFlO0lBQ3RCLE1BQU0sQ0FBb0I7SUFDMUIsT0FBTyxDQUFhO0lBRXJDOzs7Ozs7T0FNRztJQUNILFlBQ0MsTUFBa0IsRUFDbEIsTUFBb0IsRUFDcEIsS0FBd0I7UUFFeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLEtBQWEsRUFBRSxHQUFtQjtRQUMxQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQztJQUMzQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTO1FBQ1IsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWSxDQUFDLEdBQVcsRUFBRSxHQUFxQjtRQUM5QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQztJQUN4QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxZQUFZLENBQUMsR0FBVyxFQUFFLEtBQXNCO1FBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGNBQWMsQ0FBQyxJQUFZLEVBQUUsR0FBWTtRQUN4QyxPQUFPLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDO0lBQzVELENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxtQkFBbUI7WUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQy9DLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1NBQ2pFO2FBQU07WUFDTixNQUFNLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxDQUFDLENBQUM7U0FDcEU7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUk7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUQ7YUFBTTtZQUNOLE1BQU0sQ0FBQyxLQUFLLENBQ1gsZ0VBQWdFLENBQ2hFLENBQUM7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsS0FBZ0I7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFOUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJSb3V0ZSwgeyBPUm91dGVUb2tlbnMgfSBmcm9tICcuL09XZWJSb3V0ZSc7XG5pbXBvcnQgT1dlYlJvdXRlciwge1xuXHRPUm91dGVTdGF0ZUl0ZW0sXG5cdE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHRPUm91dGVUYXJnZXQsXG59IGZyb20gJy4vT1dlYlJvdXRlcic7XG5pbXBvcnQgeyBzZWFyY2hQYXJhbSwgbG9nZ2VyIH0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJSb3V0ZUNvbnRleHQge1xuXHRwcml2YXRlIF90b2tlbnM6IE9Sb3V0ZVRva2Vucztcblx0cHJpdmF0ZSBfc3RvcHBlZCA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF90YXJnZXQ6IE9Sb3V0ZVRhcmdldDtcblx0cHJpdmF0ZSByZWFkb25seSBfc3RhdGU6IE9Sb3V0ZVN0YXRlT2JqZWN0O1xuXHRwcml2YXRlIHJlYWRvbmx5IF9yb3V0ZXI6IE9XZWJSb3V0ZXI7XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZUNvbnRleHQgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSByb3V0ZXJcblx0ICogQHBhcmFtIHRhcmdldFxuXHQgKiBAcGFyYW0gc3RhdGVcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJvdXRlcjogT1dlYlJvdXRlcixcblx0XHR0YXJnZXQ6IE9Sb3V0ZVRhcmdldCxcblx0XHRzdGF0ZTogT1JvdXRlU3RhdGVPYmplY3Rcblx0KSB7XG5cdFx0dGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuXHRcdHRoaXMuX3Rva2VucyA9IHt9O1xuXHRcdHRoaXMuX3N0YXRlID0gc3RhdGUgfHwge307XG5cdFx0dGhpcy5fcm91dGVyID0gcm91dGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgcm91dGUgdG9rZW4gdmFsdWVcblx0ICpcblx0ICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbi5cblx0ICovXG5cdGdldFRva2VuKHRva2VuOiBzdHJpbmcsIGRlZj86IHN0cmluZyB8IG51bGwpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5fdG9rZW5zW3Rva2VuXSA/PyBkZWYgPz8gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgbWFwIG9mIGFsbCB0b2tlbnMgYW5kIHZhbHVlcy5cblx0ICovXG5cdGdldFRva2VucygpOiBPUm91dGVUb2tlbnMge1xuXHRcdHJldHVybiB7IC4uLnRoaXMuX3Rva2VucyB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHBhdGguXG5cdCAqL1xuXHRnZXRQYXRoKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX3RhcmdldC5wYXRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc3RvcmVkIHZhbHVlIGluIGhpc3Rvcnkgc3RhdGUgd2l0aCBhIGdpdmVuIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGtleSB0aGUgc3RhdGUga2V5XG5cdCAqL1xuXHRnZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcsIGRlZj86IE9Sb3V0ZVN0YXRlSXRlbSkge1xuXHRcdHJldHVybiB0aGlzLl9zdGF0ZVtrZXldID8/IGRlZiA/PyBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgYSBrZXkgaW4gaGlzdG9yeSBzdGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIGtleSB0aGUgc3RhdGUga2V5XG5cdCAqIEBwYXJhbSB2YWx1ZSAgdGhlIHN0YXRlIHZhbHVlXG5cdCAqL1xuXHRzZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcsIHZhbHVlOiBPUm91dGVTdGF0ZUl0ZW0pOiB0aGlzIHtcblx0XHR0aGlzLl9zdGF0ZVtrZXldID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXMuc2F2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc2VhcmNoIHBhcmFtIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZSB0aGUgc2VhcmNoIHBhcmFtIG5hbWVcblx0ICogQHBhcmFtIGRlZiB0aGUgZGVmYXVsdCB0byByZXR1cm4gd2hlbiBub3QgZGVmaW5lZFxuXHQgKi9cblx0Z2V0U2VhcmNoUGFyYW0obmFtZTogc3RyaW5nLCBkZWY/OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gc2VhcmNoUGFyYW0obmFtZSwgdGhpcy5fdGFyZ2V0LmhyZWYpID8/IGRlZiA/PyBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHRoZSByb3V0ZSBkaXNwYXRjaGVyIGlzIHN0b3BwZWQuXG5cdCAqL1xuXHRzdG9wcGVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9zdG9wcGVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0b3AgdGhlIHJvdXRlIGRpc3BhdGNoZXIuXG5cdCAqL1xuXHRzdG9wKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fc3RvcHBlZCkge1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCB3aWxsIHN0b3AuJyk7XG5cdFx0XHR0aGlzLnNhdmUoKTsgLy8gc2F2ZSBiZWZvcmUgc3RvcFxuXHRcdFx0dGhpcy5fc3RvcHBlZCA9IHRydWU7XG5cdFx0XHRjb25zdCBjZCA9IHRoaXMuX3JvdXRlci5nZXRDdXJyZW50RGlzcGF0Y2hlcigpO1xuXHRcdFx0Y2QgJiYgY2QuY2FuY2VsKCk7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IHdhcyBzdG9wcGVkIScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgYWxyZWFkeSBzdG9wcGVkIScpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIGhpc3Rvcnkgc3RhdGUuXG5cdCAqL1xuXHRzYXZlKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5zdG9wcGVkKCkpIHtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIHNhdmluZyBzdGF0ZS4uLicpO1xuXHRcdFx0dGhpcy5fcm91dGVyLnJlcGxhY2VIaXN0b3J5KHRoaXMuX3RhcmdldC5ocmVmLCB0aGlzLl9zdGF0ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ2dlci5lcnJvcihcblx0XHRcdFx0J1tPV2ViRGlzcGF0Y2hDb250ZXh0XSB5b3Ugc2hvdWxkIG5vdCB0cnkgdG8gc2F2ZSB3aGVuIHN0b3BwZWQuJ1xuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBhY3Rpb24gYXR0YWNoZWQgdG8gYSBnaXZlbiByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHJvdXRlXG5cdCAqL1xuXHRhY3Rpb25SdW5uZXIocm91dGU6IE9XZWJSb3V0ZSk6IHRoaXMge1xuXHRcdHRoaXMuX3Rva2VucyA9IHJvdXRlLnBhcnNlKHRoaXMuX3RhcmdldC5wYXRoKTtcblxuXHRcdHJvdXRlLmdldEFjdGlvbigpKHRoaXMpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cbiJdfQ==