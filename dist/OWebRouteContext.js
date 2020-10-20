import { logger } from './utils';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFakMsTUFBTSxDQUFDLE9BQU8sT0FBTyxnQkFBZ0I7SUFPcEM7Ozs7OztPQU1HO0lBQ0gsWUFDQyxNQUFrQixFQUNsQixNQUFvQixFQUNwQixLQUF3QjtRQWZqQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBaUJ4QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsS0FBYTtRQUNyQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUztRQUNSLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTztRQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsR0FBVztRQUN2QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsWUFBWSxDQUFDLEdBQVcsRUFBRSxLQUFzQjtRQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGNBQWMsQ0FBQyxLQUFhO1FBQzNCLE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxtQkFBbUI7WUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDckIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQy9DLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1NBQ2pFO2FBQU07WUFDTixNQUFNLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxDQUFDLENBQUM7U0FDcEU7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUk7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUQ7YUFBTTtZQUNOLE1BQU0sQ0FBQyxLQUFLLENBQ1gsZ0VBQWdFLENBQ2hFLENBQUM7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsS0FBZ0I7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFOUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJSb3V0ZSwgeyBPUm91dGVUb2tlbnNNYXAgfSBmcm9tICcuL09XZWJSb3V0ZSc7XG5pbXBvcnQgT1dlYlJvdXRlciwge1xuXHRPUm91dGVTdGF0ZUl0ZW0sXG5cdE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHRPUm91dGVUYXJnZXQsXG59IGZyb20gJy4vT1dlYlJvdXRlcic7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlJvdXRlQ29udGV4dCB7XG5cdHByaXZhdGUgX3Rva2VuczogT1JvdXRlVG9rZW5zTWFwO1xuXHRwcml2YXRlIF9zdG9wcGVkID0gZmFsc2U7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3RhcmdldDogT1JvdXRlVGFyZ2V0O1xuXHRwcml2YXRlIHJlYWRvbmx5IF9zdGF0ZTogT1JvdXRlU3RhdGVPYmplY3Q7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3JvdXRlcjogT1dlYlJvdXRlcjtcblxuXHQvKipcblx0ICogT1dlYlJvdXRlQ29udGV4dCBjb25zdHJ1Y3Rvci5cblx0ICpcblx0ICogQHBhcmFtIHJvdXRlclxuXHQgKiBAcGFyYW0gdGFyZ2V0XG5cdCAqIEBwYXJhbSBzdGF0ZVxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cm91dGVyOiBPV2ViUm91dGVyLFxuXHRcdHRhcmdldDogT1JvdXRlVGFyZ2V0LFxuXHRcdHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCxcblx0KSB7XG5cdFx0dGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuXHRcdHRoaXMuX3Rva2VucyA9IHt9O1xuXHRcdHRoaXMuX3N0YXRlID0gc3RhdGUgfHwge307XG5cdFx0dGhpcy5fcm91dGVyID0gcm91dGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgcm91dGUgdG9rZW4gdmFsdWVcblx0ICpcblx0ICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbi5cblx0ICovXG5cdGdldFRva2VuKHRva2VuOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLl90b2tlbnNbdG9rZW5dO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBtYXAgb2YgYWxsIHRva2VucyBhbmQgdmFsdWVzLlxuXHQgKi9cblx0Z2V0VG9rZW5zKCkge1xuXHRcdHJldHVybiBPYmplY3QuY3JlYXRlKHRoaXMuX3Rva2Vucyk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgcGF0aC5cblx0ICovXG5cdGdldFBhdGgoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fdGFyZ2V0LnBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBzdG9yZWQgdmFsdWUgaW4gaGlzdG9yeSBzdGF0ZSB3aXRoIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IHRoZSBzdGF0ZSBrZXlcblx0ICovXG5cdGdldFN0YXRlSXRlbShrZXk6IHN0cmluZyk6IE9Sb3V0ZVN0YXRlSXRlbSB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YXRlW2tleV07XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhIGtleSBpbiBoaXN0b3J5IHN0YXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IHRoZSBzdGF0ZSBrZXlcblx0ICogQHBhcmFtIHZhbHVlICB0aGUgc3RhdGUgdmFsdWVcblx0ICovXG5cdHNldFN0YXRlSXRlbShrZXk6IHN0cmluZywgdmFsdWU6IE9Sb3V0ZVN0YXRlSXRlbSk6IHRoaXMge1xuXHRcdHRoaXMuX3N0YXRlW2tleV0gPSB2YWx1ZTtcblx0XHRyZXR1cm4gdGhpcy5zYXZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBzZWFyY2ggcGFyYW0uXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXJhbSB0aGUgcGFyYW0gbmFtZVxuXHQgKi9cblx0Z2V0U2VhcmNoUGFyYW0ocGFyYW06IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuXHRcdHJldHVybiBuZXcgVVJMKHRoaXMuX3RhcmdldC5ocmVmKS5zZWFyY2hQYXJhbXMuZ2V0KHBhcmFtKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiB0aGUgcm91dGUgZGlzcGF0Y2hlciBpcyBzdG9wcGVkLlxuXHQgKi9cblx0c3RvcHBlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RvcHBlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdG9wIHRoZSByb3V0ZSBkaXNwYXRjaGVyLlxuXHQgKi9cblx0c3RvcCgpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX3N0b3BwZWQpIHtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgd2lsbCBzdG9wLicpO1xuXHRcdFx0dGhpcy5zYXZlKCk7IC8vIHNhdmUgYmVmb3JlIHN0b3Bcblx0XHRcdHRoaXMuX3N0b3BwZWQgPSB0cnVlO1xuXHRcdFx0Y29uc3QgY2QgPSB0aGlzLl9yb3V0ZXIuZ2V0Q3VycmVudERpc3BhdGNoZXIoKTtcblx0XHRcdGNkICYmIGNkLmNhbmNlbCgpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCB3YXMgc3RvcHBlZCEnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLndhcm4oJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IGFscmVhZHkgc3RvcHBlZCEnKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2F2ZSBoaXN0b3J5IHN0YXRlLlxuXHQgKi9cblx0c2F2ZSgpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuc3RvcHBlZCgpKSB7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSBzYXZpbmcgc3RhdGUuLi4nKTtcblx0XHRcdHRoaXMuX3JvdXRlci5yZXBsYWNlSGlzdG9yeSh0aGlzLl90YXJnZXQuaHJlZiwgdGhpcy5fc3RhdGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dnZXIuZXJyb3IoXG5cdFx0XHRcdCdbT1dlYkRpc3BhdGNoQ29udGV4dF0geW91IHNob3VsZCBub3QgdHJ5IHRvIHNhdmUgd2hlbiBzdG9wcGVkLicsXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGFjdGlvbiBhdHRhY2hlZCB0byBhIGdpdmVuIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm91dGVcblx0ICovXG5cdGFjdGlvblJ1bm5lcihyb3V0ZTogT1dlYlJvdXRlKTogdGhpcyB7XG5cdFx0dGhpcy5fdG9rZW5zID0gcm91dGUucGFyc2UodGhpcy5fdGFyZ2V0LnBhdGgpO1xuXG5cdFx0cm91dGUuZ2V0QWN0aW9uKCkodGhpcyk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuIl19