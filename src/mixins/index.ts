import OWebApp from "../OWebApp";
import oz from "./oz.mixin";

export default function (app: OWebApp) {
	return oz(app).extend({
		methods: {
			ow_local_time: function (time: string) {
				let offset = (new Date).getTimezoneOffset() * 60;
				return (parseInt(time) + offset) * 1000;
			},
			ow_route_link: function (path: string): string {
				return app.router.pathToURL(path).href;
			}
		}
	})
}