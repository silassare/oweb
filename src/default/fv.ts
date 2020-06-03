import OWebFormValidator from '../OWebFormValidator';
import OWebDate from '../plugins/OWebDate';
import OWebInput from 'oweb-tel-input';
import { isValidAge } from '../utils';

OWebFormValidator.addFieldValidators({
	code: (value: any, name: string, fv: OWebFormValidator) => {
		const codeReg = new RegExp(fv.getConfig('OZ_CODE_REG'));
		fv.assert(codeReg.test(value), 'OZ_AUTH_CODE_INVALID');
	},
	uname: (value: any, name: string, fv: OWebFormValidator) => {
		value = value.replace(/\s+/g, ' ').trim();

		fv.assert(
			value.length >= fv.getConfig('OZ_USER_NAME_MIN_LENGTH'),
			'OZ_FIELD_USER_NAME_TOO_SHORT',
		)
			.assert(
				value.length <= fv.getConfig('OZ_USER_NAME_MAX_LENGTH'),
				'OZ_FIELD_USER_NAME_TOO_LONG',
			)
			.setField(name, value);
	},
	login_pass: (value: any, name: string, fv: OWebFormValidator) => {
		const pass = value,
			min = fv.getConfig('OZ_PASS_MIN_LENGTH'),
			max = fv.getConfig('OZ_PASS_MAX_LENGTH');
		fv.assert(pass.length >= min, 'OZ_FIELD_PASS_INVALID').assert(
			pass.length <= max,
			'OZ_FIELD_PASS_INVALID',
		);
	},
	cpass: (value: any, name: string, fv: OWebFormValidator) => {
		const pass = value,
			min = fv.getConfig('OZ_PASS_MIN_LENGTH'),
			max = fv.getConfig('OZ_PASS_MAX_LENGTH');
		fv.assert(pass.length >= min, 'OZ_FIELD_PASS_INVALID').assert(
			pass.length <= max,
			'OZ_FIELD_PASS_INVALID',
		);
	},
	pass: (value: any, name: string, fv: OWebFormValidator) => {
		const pass = value,
			min = fv.getConfig('OZ_PASS_MIN_LENGTH'),
			max = fv.getConfig('OZ_PASS_MAX_LENGTH');
		fv.assert(pass.length >= min, 'OZ_FIELD_PASS_TOO_SHORT', {
			min,
			max,
		}).assert(pass.length <= max, 'OZ_FIELD_PASS_TOO_LONG', {
			min,
			max,
		});
	},
	vpass: (value: any, name: string, fv: OWebFormValidator) => {
		fv.assert(
			value === fv.getField('pass'),
			'OZ_FIELD_PASS_AND_VPASS_NOT_EQUAL',
		);
	},
	birth_date: (value: any, name: string, fv: OWebFormValidator) => {
		const od = new OWebDate(fv.getAppContext(), value),
			date = od.describe(),
			minAge = fv.getConfig('OZ_USER_MIN_AGE'),
			maxAge = fv.getConfig('OZ_USER_MAX_AGE'),
			isValid =
				date &&
				isValidAge(date.d, parseInt(date.mm), date.Y, minAge, maxAge);

		fv.assert(isValid, 'OZ_FIELD_BIRTH_DATE_INVALID', {
			input: value,
			min: minAge,
			max: maxAge,
		});

		date && fv.setField(name, `${date.Y}-${date.mm}-${date.d}`);
	},
	gender: (value: any, name: string, fv: OWebFormValidator) => {
		const genders = fv.getConfig('OZ_USER_ALLOWED_GENDERS');
		fv.assert(genders.indexOf(value) >= 0, 'OZ_FIELD_GENDER_INVALID');
	},
	phone: (value: any, name: string, fv: OWebFormValidator) => {
		fv.assert(
			OWebInput.isPhoneNumberPossible(value),
			'OZ_FIELD_PHONE_INVALID',
		);

		const t = new OWebInput({ number: value }),
			phone = t.getInput(),
			cc2 = t.getCurrentCountry().cc2;

		fv.setField(name, phone.replace(/[ -]/g, ''));

		// we set only if it is not already done
		// we may have multiple phone field or a cc2 field
		if (!fv.getField('cc2')) {
			fv.setField('cc2', cc2);
		}
	},
	email: (value: any, name: string, fv: OWebFormValidator) => {
		/**
		 * Email matching regex
		 *
		 * source: http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
		 *        - TLD not required
		 *            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
		 *        - must have TLD
		 *            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
		 */
		const emailReg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
		const email = value.replace(/\s/g, ' ').trim();

		fv.assert(emailReg.test(email), 'OZ_FIELD_EMAIL_INVALID').setField(
			name,
			email,
		);
	},
});
