import OWebRoute from './OWebRoute';
import OWebRouter, { ORouteStateItem, ORouteStateObject, ORouteTarget } from './OWebRouter';
export default class OWebRouteContext {
    private _tokens;
    private _stopped;
    private readonly _target;
    private readonly _state;
    private readonly _router;
    /**
     * OWebRouteContext constructor.
     *
     * @param router
     * @param target
     * @param state
     */
    constructor(router: OWebRouter, target: ORouteTarget, state: ORouteStateObject);
    /**
     * Gets route token value
     *
     * @param token The token.
     */
    getToken(token: string): any;
    /**
     * Gets a map of all tokens and values.
     */
    getTokens(): any;
    /**
     * Gets the path.
     */
    getPath(): string;
    /**
     * Gets stored value in history state with a given key.
     *
     * @param key the state key
     */
    getStateItem(key: string): ORouteStateItem;
    /**
     * Sets a key in history state.
     *
     * @param key the state key
     * @param value  the state value
     */
    setStateItem(key: string, value: ORouteStateItem): this;
    /**
     * Gets search param.
     *
     * @param param the param name
     */
    getSearchParam(param: string): string | null;
    /**
     * Check if the route dispatcher is stopped.
     */
    stopped(): boolean;
    /**
     * Stop the route dispatcher.
     */
    stop(): this;
    /**
     * Save history state.
     */
    save(): this;
    /**
     * Runs action attached to a given route.
     *
     * @param route
     */
    actionRunner(route: OWebRoute): this;
}
