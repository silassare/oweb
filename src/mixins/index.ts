import OWebApp from "../OWebApp";
import {tFileQuality} from "../OWebFS";

let fieldId = 0;

export default function (app: OWebApp) {
	return {
		ow_file_url: function (file: string, quality: tFileQuality = 0, def?: string) {
			let parts    = file.split("_"),
				url      = app.url.get("OZ_SERVER_GET_FILE_URI"),
				o        = "0",
				file_id  = o,
				file_key = o;

			if (parts.length === 2) {
				file_id  = parts[0];
				file_key = parts[1];
			}

			if (def && (file_id === o || file_key === o)) {
				return def;
			}

			let data: any = {
				"{oz_file_id}"     : file_id,
				"{oz_file_key}"    : file_key,
				"{oz_file_quality}": quality
			};

			Object.keys(data).forEach(function (key) {
				url = url.replace(key, data[key]);
			});

			return url;
		},
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