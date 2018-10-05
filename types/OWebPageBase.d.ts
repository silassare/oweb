import { VueConstructor } from "vue/types/vue";
import OWebPager, { iPage, tPageRoute, tPageRouteFull } from "./OWebPager";
import { OWebRouteContext } from "./OWebRouter";
export default abstract class OWebPageBase implements iPage {
    abstract getName(): string;
    abstract getRoutes(): tPageRoute[];
    abstract component(): VueConstructor | undefined;
    install(pager: OWebPager): this;
    onClose(oldRoute: tPageRouteFull, newRoute: tPageRouteFull): void;
    onOpen(context: OWebRouteContext, route: tPageRouteFull): void;
    requireLogin(context: OWebRouteContext, route: tPageRouteFull): boolean;
}
