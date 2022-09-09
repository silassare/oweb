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
    isStopped() {
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
            cd && cd.stop();
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
        if (!this.isStopped()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRTlDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sZ0JBQWdCO0lBQzVCLE9BQU8sQ0FBZTtJQUN0QixRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ1IsT0FBTyxDQUFlO0lBQ3RCLE1BQU0sQ0FBb0I7SUFDMUIsT0FBTyxDQUFhO0lBRXJDOzs7Ozs7T0FNRztJQUNILFlBQ0MsTUFBa0IsRUFDbEIsTUFBb0IsRUFDcEIsS0FBd0I7UUFFeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLEtBQWEsRUFBRSxHQUFtQjtRQUMxQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQztJQUMzQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTO1FBQ1IsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWSxDQUFDLEdBQVcsRUFBRSxHQUFxQjtRQUM5QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQztJQUN4QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxZQUFZLENBQUMsR0FBVyxFQUFFLEtBQXNCO1FBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGNBQWMsQ0FBQyxJQUFZLEVBQUUsR0FBWTtRQUN4QyxPQUFPLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDO0lBQzVELENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDUixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxtQkFBbUI7WUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQy9DLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1NBQ2pFO2FBQU07WUFDTixNQUFNLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxDQUFDLENBQUM7U0FDcEU7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUk7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQ3RCLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUQ7YUFBTTtZQUNOLE1BQU0sQ0FBQyxLQUFLLENBQ1gsZ0VBQWdFLENBQ2hFLENBQUM7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsS0FBZ0I7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFOUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJSb3V0ZSwgeyBPUm91dGVUb2tlbnMgfSBmcm9tICcuL09XZWJSb3V0ZSc7XG5pbXBvcnQgT1dlYlJvdXRlciwge1xuXHRPUm91dGVTdGF0ZUl0ZW0sXG5cdE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHRPUm91dGVUYXJnZXQsXG59IGZyb20gJy4vT1dlYlJvdXRlcic7XG5pbXBvcnQgeyBzZWFyY2hQYXJhbSwgbG9nZ2VyIH0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJSb3V0ZUNvbnRleHQge1xuXHRwcml2YXRlIF90b2tlbnM6IE9Sb3V0ZVRva2Vucztcblx0cHJpdmF0ZSBfc3RvcHBlZCA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF90YXJnZXQ6IE9Sb3V0ZVRhcmdldDtcblx0cHJpdmF0ZSByZWFkb25seSBfc3RhdGU6IE9Sb3V0ZVN0YXRlT2JqZWN0O1xuXHRwcml2YXRlIHJlYWRvbmx5IF9yb3V0ZXI6IE9XZWJSb3V0ZXI7XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZUNvbnRleHQgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSByb3V0ZXJcblx0ICogQHBhcmFtIHRhcmdldFxuXHQgKiBAcGFyYW0gc3RhdGVcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJvdXRlcjogT1dlYlJvdXRlcixcblx0XHR0YXJnZXQ6IE9Sb3V0ZVRhcmdldCxcblx0XHRzdGF0ZTogT1JvdXRlU3RhdGVPYmplY3Rcblx0KSB7XG5cdFx0dGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuXHRcdHRoaXMuX3Rva2VucyA9IHt9O1xuXHRcdHRoaXMuX3N0YXRlID0gc3RhdGUgfHwge307XG5cdFx0dGhpcy5fcm91dGVyID0gcm91dGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgcm91dGUgdG9rZW4gdmFsdWVcblx0ICpcblx0ICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbi5cblx0ICovXG5cdGdldFRva2VuKHRva2VuOiBzdHJpbmcsIGRlZj86IHN0cmluZyB8IG51bGwpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5fdG9rZW5zW3Rva2VuXSA/PyBkZWYgPz8gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgbWFwIG9mIGFsbCB0b2tlbnMgYW5kIHZhbHVlcy5cblx0ICovXG5cdGdldFRva2VucygpOiBPUm91dGVUb2tlbnMge1xuXHRcdHJldHVybiB7IC4uLnRoaXMuX3Rva2VucyB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHBhdGguXG5cdCAqL1xuXHRnZXRQYXRoKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX3RhcmdldC5wYXRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc3RvcmVkIHZhbHVlIGluIGhpc3Rvcnkgc3RhdGUgd2l0aCBhIGdpdmVuIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGtleSB0aGUgc3RhdGUga2V5XG5cdCAqL1xuXHRnZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcsIGRlZj86IE9Sb3V0ZVN0YXRlSXRlbSkge1xuXHRcdHJldHVybiB0aGlzLl9zdGF0ZVtrZXldID8/IGRlZiA/PyBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgYSBrZXkgaW4gaGlzdG9yeSBzdGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIGtleSB0aGUgc3RhdGUga2V5XG5cdCAqIEBwYXJhbSB2YWx1ZSAgdGhlIHN0YXRlIHZhbHVlXG5cdCAqL1xuXHRzZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcsIHZhbHVlOiBPUm91dGVTdGF0ZUl0ZW0pOiB0aGlzIHtcblx0XHR0aGlzLl9zdGF0ZVtrZXldID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXMuc2F2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc2VhcmNoIHBhcmFtIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZSB0aGUgc2VhcmNoIHBhcmFtIG5hbWVcblx0ICogQHBhcmFtIGRlZiB0aGUgZGVmYXVsdCB0byByZXR1cm4gd2hlbiBub3QgZGVmaW5lZFxuXHQgKi9cblx0Z2V0U2VhcmNoUGFyYW0obmFtZTogc3RyaW5nLCBkZWY/OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gc2VhcmNoUGFyYW0obmFtZSwgdGhpcy5fdGFyZ2V0LmhyZWYpID8/IGRlZiA/PyBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHRoZSByb3V0ZSBkaXNwYXRjaGVyIGlzIHN0b3BwZWQuXG5cdCAqL1xuXHRpc1N0b3BwZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0b3BwZWQ7XG5cdH1cblxuXHQvKipcblx0ICogU3RvcCB0aGUgcm91dGUgZGlzcGF0Y2hlci5cblx0ICovXG5cdHN0b3AoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9zdG9wcGVkKSB7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IHdpbGwgc3RvcC4nKTtcblx0XHRcdHRoaXMuc2F2ZSgpOyAvLyBzYXZlIGJlZm9yZSBzdG9wXG5cdFx0XHR0aGlzLl9zdG9wcGVkID0gdHJ1ZTtcblx0XHRcdGNvbnN0IGNkID0gdGhpcy5fcm91dGVyLmdldEN1cnJlbnREaXNwYXRjaGVyKCk7XG5cdFx0XHRjZCAmJiBjZC5zdG9wKCk7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IHdhcyBzdG9wcGVkIScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgYWxyZWFkeSBzdG9wcGVkIScpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIGhpc3Rvcnkgc3RhdGUuXG5cdCAqL1xuXHRzYXZlKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5pc1N0b3BwZWQoKSkge1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gc2F2aW5nIHN0YXRlLi4uJyk7XG5cdFx0XHR0aGlzLl9yb3V0ZXIucmVwbGFjZUhpc3RvcnkodGhpcy5fdGFyZ2V0LmhyZWYsIHRoaXMuX3N0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLmVycm9yKFxuXHRcdFx0XHQnW09XZWJEaXNwYXRjaENvbnRleHRdIHlvdSBzaG91bGQgbm90IHRyeSB0byBzYXZlIHdoZW4gc3RvcHBlZC4nXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGFjdGlvbiBhdHRhY2hlZCB0byBhIGdpdmVuIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm91dGVcblx0ICovXG5cdGFjdGlvblJ1bm5lcihyb3V0ZTogT1dlYlJvdXRlKTogdGhpcyB7XG5cdFx0dGhpcy5fdG9rZW5zID0gcm91dGUucGFyc2UodGhpcy5fdGFyZ2V0LnBhdGgpO1xuXG5cdFx0cm91dGUuZ2V0QWN0aW9uKCkodGhpcyk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuIl19