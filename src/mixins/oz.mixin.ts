import Vue from "vue";
import OWebApp from "../OWebApp";

export default function (app: OWebApp) {
	return Vue.extend({
		methods: {
			oz_file_link: function (file_id: string, file_key?: string, file_quality: 0 | 1 | 2 | 3 = 0, def?: string) {
				let parts = arguments[0].split("_"),
					url   = app.url.get("OZ_SERVER_GET_FILE_URI");

				if (parts.length === 2) {
					file_id      = parts[0];
					file_key     = parts[1];
					file_quality = arguments[1];
					def          = arguments[2];
				}

				file_quality = ([0, 1, 2, 3].indexOf(file_quality) >= 0) ? file_quality : 0;

				if (def && (file_id === "0" || file_key === "0")) {
					return def;
				}

				let data: any = {
					"{oz_file_id}"     : file_id,
					"{oz_file_key}"    : file_key,
					"{oz_file_quality}": file_quality
				};

				Object.keys(data).forEach(function (key) {
					url = url.replace(key, data[key]);
				});

				return url;
			}
		}
	})
}