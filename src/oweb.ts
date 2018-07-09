import OWebApp from "./OWebApp";
import {tUrlList} from "./OWebUrl";
import {tConfigList} from "./OWebConfigs";

// side-effect import
import "./default/index";

export default function oweb(app_name: string, app_configs: tConfigList, app_url: tUrlList): OWebApp {
	return new OWebApp(app_name, app_configs, app_url);
}
