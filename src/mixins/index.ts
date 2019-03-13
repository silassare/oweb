import OWebApp from "../OWebApp";
import oz from "./oz";

let fieldId = 0;

export default function (app: OWebApp) {
	return {
		...oz(app),

		ow_local_time: function (time: string | number) {
			let offset = (new Date).getTimezoneOffset() * 60;

			if (typeof time === "string") {
				time = parseInt(time);
			}

			return (time + offset) * 1000;
		},
		ow_route_link: function (path: string): string {
			return app.router.pathToURL(path).href;
		},
		ow_mark_field(field: any) {
			let id = "ow-field-id-" + (++fieldId);
			if (field.label) {
				field.label.for = id;
			}
			if (field.attributes) {
				field.attributes.id = id;
			}

			return field;
		}
	}
}