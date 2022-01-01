import OWebRoute, { ORouteTokens } from './OWebRoute';
import OWebRouter, { ORouteStateItem, ORouteStateObject, ORouteTarget } from './OWebRouter';
export default class OWebRouteContext {
    private _tokens;
    private _stopped;
    private readonly _target;
    private readonly _state;
    private readonly _router;
    constructor(router: OWebRouter, target: ORouteTarget, state: ORouteStateObject);
    getToken(token: string): string;
    getTokens(): ORouteTokens;
    getPath(): string;
    getStateItem(key: string): ORouteStateItem;
    setStateItem(key: string, value: ORouteStateItem): this;
    getSearchParam(name: string): string | null;
    stopped(): boolean;
    stop(): this;
    save(): this;
    actionRunner(route: OWebRoute): this;
}
