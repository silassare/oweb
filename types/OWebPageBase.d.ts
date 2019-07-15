import OWebPager, { iPage, tPageRoute, tPageRouteFull } from "./OWebPager";
import { OWebRouteContext } from "./OWebRouter";
export default abstract class OWebPageBase<Component> implements iPage<Component> {
    /**
     * The page name getter.
     */
    abstract getName(): string;
    /**
     * The page routes getter.
     */
    abstract getRoutes(): tPageRoute[];
    /**
     * The page component getter.
     */
    abstract getComponent(): Component;
    /**
     * Called once when registering the page.
     *
     * @param pager
     */
    install(pager: OWebPager<Component>): this;
    /**
     * Does this page require a verified user for the requested page route.
     *
     * @param context The app context.
     * @param route The request page route.
     */
    requireLogin(context: OWebRouteContext, route: tPageRouteFull): boolean;
    /**
     * Called before page open.
     *
     * @param context
     * @param route
     */
    onOpen(context: OWebRouteContext, route: tPageRouteFull): void;
    /**
     * Called before page close.
     *
     * @param oldRoute
     * @param newRoute
     */
    onClose(oldRoute: tPageRouteFull, newRoute: tPageRouteFull): void;
}
