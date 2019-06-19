import OWebI18n from "../../OWebI18n";
import Utils from "../../utils/Utils";
import en from "./en";
import fr from "./fr";

Utils.forEach({fr, en}, function (value, code) {
	OWebI18n.loadLangData(code, value);
});