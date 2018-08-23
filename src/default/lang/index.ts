import en from "./en";
import fr from "./fr";
import {Utils, OWebLang} from "../../oweb";

Utils.forEach({fr, en}, function (value, code) {
	OWebLang.setLangData(code, value);
});