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
    getToken(token) {
        return this._tokens[token];
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
    getStateItem(key) {
        return this._state[key];
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
     */
    getSearchParam(name) {
        return searchParam(name, this._target.href);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE9BQU8sRUFBQyxXQUFXLEVBQUUsTUFBTSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRTVDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sZ0JBQWdCO0lBQzVCLE9BQU8sQ0FBZTtJQUN0QixRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ1IsT0FBTyxDQUFlO0lBQ3RCLE1BQU0sQ0FBb0I7SUFDMUIsT0FBTyxDQUFhO0lBRXJDOzs7Ozs7T0FNRztJQUNILFlBQ0MsTUFBa0IsRUFDbEIsTUFBb0IsRUFDcEIsS0FBd0I7UUFFeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLEtBQWE7UUFDckIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDUixPQUFPLEVBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTztRQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsR0FBVztRQUN2QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsWUFBWSxDQUFDLEdBQVcsRUFBRSxLQUFzQjtRQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGNBQWMsQ0FBQyxJQUFZO1FBQzFCLE9BQU8sV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxtQkFBbUI7WUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQy9DLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1NBQ2pFO2FBQU07WUFDTixNQUFNLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxDQUFDLENBQUM7U0FDcEU7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUk7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUQ7YUFBTTtZQUNOLE1BQU0sQ0FBQyxLQUFLLENBQ1gsZ0VBQWdFLENBQ2hFLENBQUM7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsS0FBZ0I7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFOUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJSb3V0ZSwgeyBPUm91dGVUb2tlbnMgfSBmcm9tICcuL09XZWJSb3V0ZSc7XG5pbXBvcnQgT1dlYlJvdXRlciwge1xuXHRPUm91dGVTdGF0ZUl0ZW0sXG5cdE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHRPUm91dGVUYXJnZXQsXG59IGZyb20gJy4vT1dlYlJvdXRlcic7XG5pbXBvcnQge3NlYXJjaFBhcmFtLCBsb2dnZXJ9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViUm91dGVDb250ZXh0IHtcblx0cHJpdmF0ZSBfdG9rZW5zOiBPUm91dGVUb2tlbnM7XG5cdHByaXZhdGUgX3N0b3BwZWQgPSBmYWxzZTtcblx0cHJpdmF0ZSByZWFkb25seSBfdGFyZ2V0OiBPUm91dGVUYXJnZXQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3N0YXRlOiBPUm91dGVTdGF0ZU9iamVjdDtcblx0cHJpdmF0ZSByZWFkb25seSBfcm91dGVyOiBPV2ViUm91dGVyO1xuXG5cdC8qKlxuXHQgKiBPV2ViUm91dGVDb250ZXh0IGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm91dGVyXG5cdCAqIEBwYXJhbSB0YXJnZXRcblx0ICogQHBhcmFtIHN0YXRlXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRyb3V0ZXI6IE9XZWJSb3V0ZXIsXG5cdFx0dGFyZ2V0OiBPUm91dGVUYXJnZXQsXG5cdFx0c3RhdGU6IE9Sb3V0ZVN0YXRlT2JqZWN0XG5cdCkge1xuXHRcdHRoaXMuX3RhcmdldCA9IHRhcmdldDtcblx0XHR0aGlzLl90b2tlbnMgPSB7fTtcblx0XHR0aGlzLl9zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuXHRcdHRoaXMuX3JvdXRlciA9IHJvdXRlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHJvdXRlIHRva2VuIHZhbHVlXG5cdCAqXG5cdCAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4uXG5cdCAqL1xuXHRnZXRUb2tlbih0b2tlbjogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fdG9rZW5zW3Rva2VuXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgbWFwIG9mIGFsbCB0b2tlbnMgYW5kIHZhbHVlcy5cblx0ICovXG5cdGdldFRva2VucygpOk9Sb3V0ZVRva2VucyB7XG5cdFx0cmV0dXJuIHsuLi50aGlzLl90b2tlbnN9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHBhdGguXG5cdCAqL1xuXHRnZXRQYXRoKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX3RhcmdldC5wYXRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc3RvcmVkIHZhbHVlIGluIGhpc3Rvcnkgc3RhdGUgd2l0aCBhIGdpdmVuIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGtleSB0aGUgc3RhdGUga2V5XG5cdCAqL1xuXHRnZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcpOiBPUm91dGVTdGF0ZUl0ZW0ge1xuXHRcdHJldHVybiB0aGlzLl9zdGF0ZVtrZXldO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgYSBrZXkgaW4gaGlzdG9yeSBzdGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIGtleSB0aGUgc3RhdGUga2V5XG5cdCAqIEBwYXJhbSB2YWx1ZSAgdGhlIHN0YXRlIHZhbHVlXG5cdCAqL1xuXHRzZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcsIHZhbHVlOiBPUm91dGVTdGF0ZUl0ZW0pOiB0aGlzIHtcblx0XHR0aGlzLl9zdGF0ZVtrZXldID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXMuc2F2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc2VhcmNoIHBhcmFtIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZSB0aGUgc2VhcmNoIHBhcmFtIG5hbWVcblx0ICovXG5cdGdldFNlYXJjaFBhcmFtKG5hbWU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuXHRcdHJldHVybiBzZWFyY2hQYXJhbShuYW1lLCB0aGlzLl90YXJnZXQuaHJlZik7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIHJvdXRlIGRpc3BhdGNoZXIgaXMgc3RvcHBlZC5cblx0ICovXG5cdHN0b3BwZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0b3BwZWQ7XG5cdH1cblxuXHQvKipcblx0ICogU3RvcCB0aGUgcm91dGUgZGlzcGF0Y2hlci5cblx0ICovXG5cdHN0b3AoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9zdG9wcGVkKSB7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IHdpbGwgc3RvcC4nKTtcblx0XHRcdHRoaXMuc2F2ZSgpOyAvLyBzYXZlIGJlZm9yZSBzdG9wXG5cdFx0XHR0aGlzLl9zdG9wcGVkID0gdHJ1ZTtcblx0XHRcdGNvbnN0IGNkID0gdGhpcy5fcm91dGVyLmdldEN1cnJlbnREaXNwYXRjaGVyKCk7XG5cdFx0XHRjZCAmJiBjZC5jYW5jZWwoKTtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgd2FzIHN0b3BwZWQhJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ2dlci53YXJuKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCBhbHJlYWR5IHN0b3BwZWQhJyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNhdmUgaGlzdG9yeSBzdGF0ZS5cblx0ICovXG5cdHNhdmUoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLnN0b3BwZWQoKSkge1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gc2F2aW5nIHN0YXRlLi4uJyk7XG5cdFx0XHR0aGlzLl9yb3V0ZXIucmVwbGFjZUhpc3RvcnkodGhpcy5fdGFyZ2V0LmhyZWYsIHRoaXMuX3N0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLmVycm9yKFxuXHRcdFx0XHQnW09XZWJEaXNwYXRjaENvbnRleHRdIHlvdSBzaG91bGQgbm90IHRyeSB0byBzYXZlIHdoZW4gc3RvcHBlZC4nXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGFjdGlvbiBhdHRhY2hlZCB0byBhIGdpdmVuIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm91dGVcblx0ICovXG5cdGFjdGlvblJ1bm5lcihyb3V0ZTogT1dlYlJvdXRlKTogdGhpcyB7XG5cdFx0dGhpcy5fdG9rZW5zID0gcm91dGUucGFyc2UodGhpcy5fdGFyZ2V0LnBhdGgpO1xuXG5cdFx0cm91dGUuZ2V0QWN0aW9uKCkodGhpcyk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuIl19