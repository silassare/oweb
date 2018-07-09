import Utils from "../utils/Utils";
import OWebFormValidator from "../OWebFormValidator";

OWebFormValidator.addFieldValidators({
	"code": function (value: any, name: string, fv: OWebFormValidator) {
		let codeReg = new RegExp(fv.getConfig("OZ_CODE_REG"));
		fv.assert(codeReg.test(value), "OZ_AUTH_CODE_INVALID");
	},
	"uname": function (value: any, name: string, fv: OWebFormValidator) {
		value = value.replace(/\s+/g, " ").trim();

		fv.assert(value.length >= fv.getConfig("OZ_USER_NAME_MIN_LENGTH"), "OZ_FIELD_USER_NAME_TOO_SHORT");
		fv.assert(value.length <= fv.getConfig("OZ_USER_NAME_MAX_LENGTH"), "OZ_FIELD_USER_NAME_TOO_LONG");
		fv.setField(name, value);
	},
	"login_pass": function (value: any, name: string, fv: OWebFormValidator) {
		let pass = value,
			min  = fv.getConfig("OZ_PASS_MIN_LENGTH"),
			max  = fv.getConfig("OZ_PASS_MAX_LENGTH");
		fv.assert(pass.length >= min, "OZ_FIELD_PASS_INVALID");
		fv.assert(pass.length <= max, "OZ_FIELD_PASS_INVALID");
	},
	"pass": function (value: any, name: string, fv: OWebFormValidator) {
		let pass = value,
			min  = fv.getConfig("OZ_PASS_MIN_LENGTH"),
			max  = fv.getConfig("OZ_PASS_MAX_LENGTH");
		fv.assert(pass.length >= min, "OZ_FIELD_PASS_TOO_SHORT", {"min": min, "max": max});
		fv.assert(pass.length <= max, "OZ_FIELD_PASS_TOO_LONG", {"min": min, "max": max});
	},
	"vpass": function (value: any, name: string, fv: OWebFormValidator) {
		fv.assert(value === fv.getField("pass"),
			"OZ_FIELD_PASS_AND_VPASS_NOT_EQUAL");
	},
	"birth_date": function (value: any, name: string, fv: OWebFormValidator) {
		let
			date    = Utils.date.fromString(value),
			min_age = fv.getConfig("OZ_USER_MIN_AGE"),
			max_age = fv.getConfig("OZ_USER_MAX_AGE"),
			isValid = date && Utils.date.valid(date["day"], date["month"], date["year"], min_age, max_age);

		fv.assert(isValid, "OZ_FIELD_BIRTH_DATE_INVALID", {"input": value, "min": min_age, "max": max_age});
	},
	"gender": function (value: any, name: string, fv: OWebFormValidator) {
		let genders = fv.getConfig("OZ_USER_ALLOWED_GENDERS");
		fv.assert(genders.indexOf(value) >= 0, "OZ_FIELD_GENDER_INVALID");
	},
	"phone": function (value: any, name: string, fv: OWebFormValidator) {
		// @ts-ignore
		fv.assert(OTelInput.isPhoneNumberPossible(value), "OZ_FIELD_PHONE_INVALID");
		// @ts-ignore
		let t     = OTelInput(null, {"number": value});
		let phone = t.getInput();
		let cc2   = t.getCurrentData().cc2;

		fv.setField(name, phone.replace(/[ -]/g, ""));

		// set only if it is not already set
		// we may have multiple phone field or a cc2 field
		if (!fv.getField("cc2")) {
			fv.setField("cc2", cc2);
		}
	},
	"email": function (value: any, name: string, fv: OWebFormValidator) {
		/**
		 * Email matching regex
		 *
		 * source: http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
		 *        - TLD not required
		 *            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
		 *        - must have TLD
		 *            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
		 */
		let emailReg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
		let email    = value.replace(/\s/g, " ").trim();

		fv.assert(emailReg.test(email), "OZ_FIELD_EMAIL_INVALID");

		fv.setField(name, email);
	}
});