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
            console.warn('[OWebDispatchContext] route context will stop.');
            this.save(); // save before stop
            this._stopped = true;
            this._router.getCurrentDispatcher().cancel();
            console.warn('[OWebDispatchContext] route context was stopped!');
        }
        else {
            console.warn('[OWebDispatchContext] route context already stopped!');
        }
        return this;
    }
    /**
     * Save history state.
     */
    save() {
        if (!this.stopped()) {
            console.log('[OWebDispatchContext] saving state...');
            this._router.replaceHistory(this._target.href, this._state);
        }
        else {
            console.error('[OWebDispatchContext] you should not try to save when stopped.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9BLE1BQU0sQ0FBQyxPQUFPLE9BQU8sZ0JBQWdCO0lBT3BDOzs7Ozs7T0FNRztJQUNILFlBQ0MsTUFBa0IsRUFDbEIsTUFBb0IsRUFDcEIsS0FBd0I7UUFmakIsYUFBUSxHQUFZLEtBQUssQ0FBQztRQWlCakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLEtBQWE7UUFDckIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDUixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWSxDQUFDLEdBQVc7UUFDdkIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFlBQVksQ0FBQyxHQUFXLEVBQUUsS0FBc0I7UUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDekIsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxjQUFjLENBQUMsS0FBYTtRQUMzQixPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPO1FBQ04sT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUk7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLGdEQUFnRCxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsbUJBQW1CO1lBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QyxPQUFPLENBQUMsSUFBSSxDQUFDLGtEQUFrRCxDQUFDLENBQUM7U0FDakU7YUFBTTtZQUNOLE9BQU8sQ0FBQyxJQUFJLENBQ1gsc0RBQXNELENBQ3RELENBQUM7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSTtRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM1RDthQUFNO1lBQ04sT0FBTyxDQUFDLEtBQUssQ0FDWixnRUFBZ0UsQ0FDaEUsQ0FBQztTQUNGO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFlBQVksQ0FBQyxLQUFnQjtRQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU5QyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFeEIsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYlJvdXRlLCB7IHRSb3V0ZVRva2Vuc01hcCB9IGZyb20gJy4vT1dlYlJvdXRlJztcbmltcG9ydCBPV2ViUm91dGVyLCB7XG5cdHRSb3V0ZVRhcmdldCxcblx0dFJvdXRlU3RhdGVPYmplY3QsXG5cdHRSb3V0ZVN0YXRlSXRlbSxcbn0gZnJvbSAnLi9PV2ViUm91dGVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlJvdXRlQ29udGV4dCB7XG5cdHByaXZhdGUgX3Rva2VuczogdFJvdXRlVG9rZW5zTWFwO1xuXHRwcml2YXRlIF9zdG9wcGVkOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3RhcmdldDogdFJvdXRlVGFyZ2V0O1xuXHRwcml2YXRlIHJlYWRvbmx5IF9zdGF0ZTogdFJvdXRlU3RhdGVPYmplY3Q7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3JvdXRlcjogT1dlYlJvdXRlcjtcblxuXHQvKipcblx0ICogT1dlYlJvdXRlQ29udGV4dCBjb25zdHJ1Y3Rvci5cblx0ICpcblx0ICogQHBhcmFtIHJvdXRlclxuXHQgKiBAcGFyYW0gdGFyZ2V0XG5cdCAqIEBwYXJhbSBzdGF0ZVxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cm91dGVyOiBPV2ViUm91dGVyLFxuXHRcdHRhcmdldDogdFJvdXRlVGFyZ2V0LFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCxcblx0KSB7XG5cdFx0dGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuXHRcdHRoaXMuX3Rva2VucyA9IHt9O1xuXHRcdHRoaXMuX3N0YXRlID0gc3RhdGUgfHwge307XG5cdFx0dGhpcy5fcm91dGVyID0gcm91dGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgcm91dGUgdG9rZW4gdmFsdWVcblx0ICpcblx0ICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbi5cblx0ICovXG5cdGdldFRva2VuKHRva2VuOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLl90b2tlbnNbdG9rZW5dO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBtYXAgb2YgYWxsIHRva2VucyBhbmQgdmFsdWVzLlxuXHQgKi9cblx0Z2V0VG9rZW5zKCkge1xuXHRcdHJldHVybiBPYmplY3QuY3JlYXRlKHRoaXMuX3Rva2Vucyk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgcGF0aC5cblx0ICovXG5cdGdldFBhdGgoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fdGFyZ2V0LnBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBzdG9yZWQgdmFsdWUgaW4gaGlzdG9yeSBzdGF0ZSB3aXRoIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IHRoZSBzdGF0ZSBrZXlcblx0ICovXG5cdGdldFN0YXRlSXRlbShrZXk6IHN0cmluZyk6IHRSb3V0ZVN0YXRlSXRlbSB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YXRlW2tleV07XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhIGtleSBpbiBoaXN0b3J5IHN0YXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IHRoZSBzdGF0ZSBrZXlcblx0ICogQHBhcmFtIHZhbHVlICB0aGUgc3RhdGUgdmFsdWVcblx0ICovXG5cdHNldFN0YXRlSXRlbShrZXk6IHN0cmluZywgdmFsdWU6IHRSb3V0ZVN0YXRlSXRlbSk6IHRoaXMge1xuXHRcdHRoaXMuX3N0YXRlW2tleV0gPSB2YWx1ZTtcblx0XHRyZXR1cm4gdGhpcy5zYXZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBzZWFyY2ggcGFyYW0uXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXJhbSB0aGUgcGFyYW0gbmFtZVxuXHQgKi9cblx0Z2V0U2VhcmNoUGFyYW0ocGFyYW06IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuXHRcdHJldHVybiBuZXcgVVJMKHRoaXMuX3RhcmdldC5ocmVmKS5zZWFyY2hQYXJhbXMuZ2V0KHBhcmFtKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiB0aGUgcm91dGUgZGlzcGF0Y2hlciBpcyBzdG9wcGVkLlxuXHQgKi9cblx0c3RvcHBlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RvcHBlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdG9wIHRoZSByb3V0ZSBkaXNwYXRjaGVyLlxuXHQgKi9cblx0c3RvcCgpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX3N0b3BwZWQpIHtcblx0XHRcdGNvbnNvbGUud2FybignW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgd2lsbCBzdG9wLicpO1xuXHRcdFx0dGhpcy5zYXZlKCk7IC8vIHNhdmUgYmVmb3JlIHN0b3Bcblx0XHRcdHRoaXMuX3N0b3BwZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5fcm91dGVyLmdldEN1cnJlbnREaXNwYXRjaGVyKCkhLmNhbmNlbCgpO1xuXHRcdFx0Y29uc29sZS53YXJuKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCB3YXMgc3RvcHBlZCEnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHQnW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgYWxyZWFkeSBzdG9wcGVkIScsXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIGhpc3Rvcnkgc3RhdGUuXG5cdCAqL1xuXHRzYXZlKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5zdG9wcGVkKCkpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gc2F2aW5nIHN0YXRlLi4uJyk7XG5cdFx0XHR0aGlzLl9yb3V0ZXIucmVwbGFjZUhpc3RvcnkodGhpcy5fdGFyZ2V0LmhyZWYsIHRoaXMuX3N0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcblx0XHRcdFx0J1tPV2ViRGlzcGF0Y2hDb250ZXh0XSB5b3Ugc2hvdWxkIG5vdCB0cnkgdG8gc2F2ZSB3aGVuIHN0b3BwZWQuJyxcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgYWN0aW9uIGF0dGFjaGVkIHRvIGEgZ2l2ZW4gcm91dGUuXG5cdCAqXG5cdCAqIEBwYXJhbSByb3V0ZVxuXHQgKi9cblx0YWN0aW9uUnVubmVyKHJvdXRlOiBPV2ViUm91dGUpOiB0aGlzIHtcblx0XHR0aGlzLl90b2tlbnMgPSByb3V0ZS5wYXJzZSh0aGlzLl90YXJnZXQucGF0aCk7XG5cblx0XHRyb3V0ZS5nZXRBY3Rpb24oKSh0aGlzKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG4iXX0=