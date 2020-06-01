import { _debug, _warn, _error } from './utils/Utils';
export default class OWebRouteContext {
    /**
     * OWebRouteContext constructor.
     *
     * @param router
     * @param target
     * @param state
     */
    constructor(router, target, state) {
        this._stopped = false;
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
        return Object.create(this._tokens);
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
     * Gets search param.
     *
     * @param param the param name
     */
    getSearchParam(param) {
        return new URL(this._target.href).searchParams.get(param);
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
            _debug('[OWebDispatchContext] route context will stop.');
            this.save(); // save before stop
            this._stopped = true;
            this._router.getCurrentDispatcher().cancel();
            _debug('[OWebDispatchContext] route context was stopped!');
        }
        else {
            _warn('[OWebDispatchContext] route context already stopped!');
        }
        return this;
    }
    /**
     * Save history state.
     */
    save() {
        if (!this.stopped()) {
            _debug('[OWebDispatchContext] saving state...');
            this._router.replaceHistory(this._target.href, this._state);
        }
        else {
            _error('[OWebDispatchContext] you should not try to save when stopped.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV0RCxNQUFNLENBQUMsT0FBTyxPQUFPLGdCQUFnQjtJQU9wQzs7Ozs7O09BTUc7SUFDSCxZQUNDLE1BQWtCLEVBQ2xCLE1BQW9CLEVBQ3BCLEtBQXdCO1FBZmpCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFpQmpDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFFBQVEsQ0FBQyxLQUFhO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTO1FBQ1IsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPO1FBQ04sT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFlBQVksQ0FBQyxHQUFXO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxZQUFZLENBQUMsR0FBVyxFQUFFLEtBQXNCO1FBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUFDLEtBQWE7UUFDM0IsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTztRQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN0QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbkIsTUFBTSxDQUFDLGdEQUFnRCxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsbUJBQW1CO1lBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QyxNQUFNLENBQUMsa0RBQWtELENBQUMsQ0FBQztTQUMzRDthQUFNO1lBQ04sS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7U0FDOUQ7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUk7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM1RDthQUFNO1lBQ04sTUFBTSxDQUNMLGdFQUFnRSxDQUNoRSxDQUFDO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWSxDQUFDLEtBQWdCO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTlDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4QixPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViUm91dGUsIHsgdFJvdXRlVG9rZW5zTWFwIH0gZnJvbSAnLi9PV2ViUm91dGUnO1xuaW1wb3J0IE9XZWJSb3V0ZXIsIHtcblx0dFJvdXRlVGFyZ2V0LFxuXHR0Um91dGVTdGF0ZU9iamVjdCxcblx0dFJvdXRlU3RhdGVJdGVtLFxufSBmcm9tICcuL09XZWJSb3V0ZXInO1xuaW1wb3J0IHsgX2RlYnVnLCBfd2FybiwgX2Vycm9yIH0gZnJvbSAnLi91dGlscy9VdGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJSb3V0ZUNvbnRleHQge1xuXHRwcml2YXRlIF90b2tlbnM6IHRSb3V0ZVRva2Vuc01hcDtcblx0cHJpdmF0ZSBfc3RvcHBlZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF90YXJnZXQ6IHRSb3V0ZVRhcmdldDtcblx0cHJpdmF0ZSByZWFkb25seSBfc3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0O1xuXHRwcml2YXRlIHJlYWRvbmx5IF9yb3V0ZXI6IE9XZWJSb3V0ZXI7XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZUNvbnRleHQgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSByb3V0ZXJcblx0ICogQHBhcmFtIHRhcmdldFxuXHQgKiBAcGFyYW0gc3RhdGVcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJvdXRlcjogT1dlYlJvdXRlcixcblx0XHR0YXJnZXQ6IHRSb3V0ZVRhcmdldCxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsXG5cdCkge1xuXHRcdHRoaXMuX3RhcmdldCA9IHRhcmdldDtcblx0XHR0aGlzLl90b2tlbnMgPSB7fTtcblx0XHR0aGlzLl9zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuXHRcdHRoaXMuX3JvdXRlciA9IHJvdXRlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHJvdXRlIHRva2VuIHZhbHVlXG5cdCAqXG5cdCAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4uXG5cdCAqL1xuXHRnZXRUb2tlbih0b2tlbjogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5fdG9rZW5zW3Rva2VuXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgbWFwIG9mIGFsbCB0b2tlbnMgYW5kIHZhbHVlcy5cblx0ICovXG5cdGdldFRva2VucygpIHtcblx0XHRyZXR1cm4gT2JqZWN0LmNyZWF0ZSh0aGlzLl90b2tlbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHBhdGguXG5cdCAqL1xuXHRnZXRQYXRoKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX3RhcmdldC5wYXRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc3RvcmVkIHZhbHVlIGluIGhpc3Rvcnkgc3RhdGUgd2l0aCBhIGdpdmVuIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGtleSB0aGUgc3RhdGUga2V5XG5cdCAqL1xuXHRnZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcpOiB0Um91dGVTdGF0ZUl0ZW0ge1xuXHRcdHJldHVybiB0aGlzLl9zdGF0ZVtrZXldO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgYSBrZXkgaW4gaGlzdG9yeSBzdGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIGtleSB0aGUgc3RhdGUga2V5XG5cdCAqIEBwYXJhbSB2YWx1ZSAgdGhlIHN0YXRlIHZhbHVlXG5cdCAqL1xuXHRzZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcsIHZhbHVlOiB0Um91dGVTdGF0ZUl0ZW0pOiB0aGlzIHtcblx0XHR0aGlzLl9zdGF0ZVtrZXldID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXMuc2F2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc2VhcmNoIHBhcmFtLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFyYW0gdGhlIHBhcmFtIG5hbWVcblx0ICovXG5cdGdldFNlYXJjaFBhcmFtKHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gbmV3IFVSTCh0aGlzLl90YXJnZXQuaHJlZikuc2VhcmNoUGFyYW1zLmdldChwYXJhbSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIHJvdXRlIGRpc3BhdGNoZXIgaXMgc3RvcHBlZC5cblx0ICovXG5cdHN0b3BwZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0b3BwZWQ7XG5cdH1cblxuXHQvKipcblx0ICogU3RvcCB0aGUgcm91dGUgZGlzcGF0Y2hlci5cblx0ICovXG5cdHN0b3AoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9zdG9wcGVkKSB7XG5cdFx0XHRfZGVidWcoJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IHdpbGwgc3RvcC4nKTtcblx0XHRcdHRoaXMuc2F2ZSgpOyAvLyBzYXZlIGJlZm9yZSBzdG9wXG5cdFx0XHR0aGlzLl9zdG9wcGVkID0gdHJ1ZTtcblx0XHRcdHRoaXMuX3JvdXRlci5nZXRDdXJyZW50RGlzcGF0Y2hlcigpIS5jYW5jZWwoKTtcblx0XHRcdF9kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgd2FzIHN0b3BwZWQhJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdF93YXJuKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCBhbHJlYWR5IHN0b3BwZWQhJyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNhdmUgaGlzdG9yeSBzdGF0ZS5cblx0ICovXG5cdHNhdmUoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLnN0b3BwZWQoKSkge1xuXHRcdFx0X2RlYnVnKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gc2F2aW5nIHN0YXRlLi4uJyk7XG5cdFx0XHR0aGlzLl9yb3V0ZXIucmVwbGFjZUhpc3RvcnkodGhpcy5fdGFyZ2V0LmhyZWYsIHRoaXMuX3N0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0X2Vycm9yKFxuXHRcdFx0XHQnW09XZWJEaXNwYXRjaENvbnRleHRdIHlvdSBzaG91bGQgbm90IHRyeSB0byBzYXZlIHdoZW4gc3RvcHBlZC4nLFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBhY3Rpb24gYXR0YWNoZWQgdG8gYSBnaXZlbiByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHJvdXRlXG5cdCAqL1xuXHRhY3Rpb25SdW5uZXIocm91dGU6IE9XZWJSb3V0ZSk6IHRoaXMge1xuXHRcdHRoaXMuX3Rva2VucyA9IHJvdXRlLnBhcnNlKHRoaXMuX3RhcmdldC5wYXRoKTtcblxuXHRcdHJvdXRlLmdldEFjdGlvbigpKHRoaXMpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cbiJdfQ==