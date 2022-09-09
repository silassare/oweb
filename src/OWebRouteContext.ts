import OWebRoute, { ORouteTokens } from './OWebRoute';
import OWebRouter, {
	ORouteStateItem,
	ORouteStateObject,
	ORouteTarget,
} from './OWebRouter';
import { searchParam, logger } from './utils';

export default class OWebRouteContext {
	private _tokens: ORouteTokens;
	private _stopped = false;
	private readonly _target: ORouteTarget;
	private readonly _state: ORouteStateObject;
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
		target: ORouteTarget,
		state: ORouteStateObject
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
	getToken(token: string, def?: string | null): string | null {
		return this._tokens[token] ?? def ?? null;
	}

	/**
	 * Gets a map of all tokens and values.
	 */
	getTokens(): ORouteTokens {
		return { ...this._tokens };
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
	getStateItem(key: string, def?: ORouteStateItem) {
		return this._state[key] ?? def ?? null;
	}

	/**
	 * Sets a key in history state.
	 *
	 * @param key the state key
	 * @param value  the state value
	 */
	setStateItem(key: string, value: ORouteStateItem): this {
		this._state[key] = value;
		return this.save();
	}

	/**
	 * Gets search param value.
	 *
	 * @param name the search param name
	 * @param def the default to return when not defined
	 */
	getSearchParam(name: string, def?: string): string | null {
		return searchParam(name, this._target.href) ?? def ?? null;
	}

	/**
	 * Check if the route dispatcher is stopped.
	 */
	isStopped(): boolean {
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
			const cd = this._router.getCurrentDispatcher();
			cd && cd.stop();
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
		if (!this.isStopped()) {
			logger.debug('[OWebDispatchContext] saving state...');
			this._router.replaceHistory(this._target.href, this._state);
		} else {
			logger.error(
				'[OWebDispatchContext] you should not try to save when stopped.'
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
