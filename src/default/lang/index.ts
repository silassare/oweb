import OWebLang from "../../OWebLang";
import Utils from "../../utils/Utils";
import en from "./en";
import fr from "./fr";

Utils.forEach({fr, en}, function (value, code) {
	OWebLang.setLangData(code, value);
});