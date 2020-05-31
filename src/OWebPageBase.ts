import OWebPager, { IPage, IPageRoute, IPageRouteFull } from './OWebPager';
import OWebRouteContext from './OWebRouteContext';

export default abstract class OWebPageBase<Component>
	implements IPage<Component> {
	/**
	 * The page name getter.
	 */
	abstract getName(): string;

	/**
	 * The page routes getter.
	 */
	abstract getRoutes(): IPageRoute[];

	/**
	 * The page component getter.
	 */
	abstract getComponent(): Component;

	/**
	 * Called once when registering the page.
	 *
	 * @param pager
	 */
	install(pager: OWebPager<Component>): this {
		return this;
	}

	/**
	 * Does this page require a verified user for the requested page route.
	 *
	 * @param context The app context.
	 * @param route The request page route.
	 */
	requireLogin(context: OWebRouteContext, route: IPageRouteFull): boolean {
		return false;
	}

	/**
	 * Called before page open.
	 *
	 * @param context
	 * @param route
	 */
	// tslint:disable-next-line: no-empty
	onOpen(context: OWebRouteContext, route: IPageRouteFull): void {}

	/**
	 * Called before page close.
	 *
	 * @param oldRoute
	 * @param newRoute
	 */
	// tslint:disable-next-line: no-empty
	onClose(oldRoute: IPageRouteFull, newRoute: IPageRouteFull): void {}
}
