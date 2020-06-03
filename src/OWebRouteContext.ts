import OWebRoute, { tRouteTokensMap } from './OWebRoute';
import OWebRouter, {
	tRouteStateItem,
	tRouteStateObject,
	tRouteTarget,
} from './OWebRouter';
import { logger } from './utils';

export default class OWebRouteContext {
	private _tokens: tRouteTokensMap;
	private _stopped: boolean = false;
	private readonly _target: tRouteTarget;
	private readonly _state: tRouteStateObject;
	private readonly _router: OWebRouter;

	/**
	 * OWebRouteContext constructor.
	 *
	 * @param router
	 * @param target
	 * @param state
	 */
	constructor(
		router: OWebRouter,
		target: tRouteTarget,
		state: tRouteStateObject,
	) {
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
	getToken(token: string): any {
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
	getPath(): string {
		return this._target.path;
	}

	/**
	 * Gets stored value in history state with a given key.
	 *
	 * @param key the state key
	 */
	getStateItem(key: string): tRouteStateItem {
		return this._state[key];
	}

	/**
	 * Sets a key in history state.
	 *
	 * @param key the state key
	 * @param value  the state value
	 */
	setStateItem(key: string, value: tRouteStateItem): this {
		this._state[key] = value;
		return this.save();
	}

	/**
	 * Gets search param.
	 *
	 * @param param the param name
	 */
	getSearchParam(param: string): string | null {
		return new URL(this._target.href).searchParams.get(param);
	}

	/**
	 * Check if the route dispatcher is stopped.
	 */
	stopped(): boolean {
		return this._stopped;
	}

	/**
	 * Stop the route dispatcher.
	 */
	stop(): this {
		if (!this._stopped) {
			logger.debug('[OWebDispatchContext] route context will stop.');
			this.save(); // save before stop
			this._stopped = true;
			this._router.getCurrentDispatcher()!.cancel();
			logger.debug('[OWebDispatchContext] route context was stopped!');
		} else {
			logger.warn('[OWebDispatchContext] route context already stopped!');
		}
		return this;
	}

	/**
	 * Save history state.
	 */
	save(): this {
		if (!this.stopped()) {
			logger.debug('[OWebDispatchContext] saving state...');
			this._router.replaceHistory(this._target.href, this._state);
		} else {
			logger.error(
				'[OWebDispatchContext] you should not try to save when stopped.',
			);
		}
		return this;
	}

	/**
	 * Runs action attached to a given route.
	 *
	 * @param route
	 */
	actionRunner(route: OWebRoute): this {
		this._tokens = route.parse(this._target.path);

		route.getAction()(this);

		return this;
	}
}
