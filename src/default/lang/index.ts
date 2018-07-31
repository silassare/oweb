import en from "./en";
import fr from "./fr";
import Utils from "../../utils/Utils";
import OWebLang from "../../OWebLang";

Utils.forEach({fr, en}, function (value, code) {
	OWebLang.setLangData(code, value);
});