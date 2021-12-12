import OWebApp from './OWebApp';
import { isNil, isValidAge, forEach, logger } from './utils';
import OWebFormError from './OWebFormError';
import { OWebFormAdapter, OWebFormDataEntryValue } from './OWebFormAdapter';
import OWebDate, { ODateValue } from './plugins/OWebDate';

export interface OWebFormField {
	[key: string]: unknown;
	value: any;
	label?: string;
	validator?: string | OWebFormFieldValidator;
}
export type OWebFormFieldValidator<T = unknown> = (
	value: T,
	fieldName: string,
	context: OWebForm
) => void;

export type OWebFormData = FormData | Record<string, any>;
export type OWebFormOptions = Record<string, OWebFormField>;
export type OWebFormErrors = { [key: string]: OWebFormError[] };

const DECLARED_VALIDATORS: { [key: string]: OWebFormFieldValidator } =
	Object.create({});

export default class OWebForm {
	private errors: OWebFormErrors = {};

	/**
	 * @param _appContext The app context.
	 * @param adapter The form.
	 * @param required The required fields.
	 * @param excluded The fields to exclude from validation.
	 * @param checkAll When true all fields will be validated.
	 * @param verbose Log warning.
	 */
	constructor(
		private readonly _appContext: OWebApp,
		private readonly adapter: OWebFormAdapter,
		private readonly required: string[] = [],
		private readonly excluded: string[] = [],
		private readonly checkAll: boolean = false,
		private readonly verbose: boolean = false
	) {}

	/**
	 * Returns the app context.
	 */
	getAppContext(): OWebApp {
		return this._appContext;
	}

	/**
	 * Returns the form adapter.
	 */
	getFormAdapter(): OWebFormAdapter {
		return this.adapter;
	}

	/**
	 * Gets app config.
	 *
	 * @param key
	 */
	getConfig(key: string): any {
		return this.getAppContext().configs.get(key);
	}

	/**
	 * Returns a FormData containing the validated form fields.
	 *
	 * @param fields The fields name list. When empty all field will be added to the FormData.
	 */
	getFormData(fields: string[] = []): FormData {
		return this.adapter.toFormData(fields);
	}

	/**
	 * Gets a given field name value.
	 *
	 * @param name
	 */
	getFieldValue<T = null | OWebFormDataEntryValue>(name: string): T {
		return this.adapter.getFieldValue<T>(name);
	}

	/**
	 * Sets a given field value.
	 * @param name
	 * @param value
	 */
	setFieldValue(name: string, value: OWebFormDataEntryValue): this {
		this.adapter.setFieldValue(name, value);
		return this;
	}

	/**
	 * Returns error map.
	 */
	getErrors(): OWebFormErrors {
		return this.errors;
	}

	/**
	 * Runs form validation.
	 */
	validate(showDialog = true): boolean {
		const fieldNames: string[] = this.adapter.getFieldsNames();
		let c = -1,
			name;

		// empty error list
		this.errors = {};

		while ((name = fieldNames[++c])) {
			if (this.excluded.indexOf(name) < 0) {
				try {
					const value = this.getFieldValue(name);

					if (!isNil(value)) {
						const validators = this.adapter.getFieldValidators(name);

						if (validators.length) {
							for (let i = 0; i < validators.length; i++) {
								validators[i](value, name, this);
							}
						} else if (this.verbose) {
							logger.warn(
								`[OWebFormValidator] no validators defined for field '${name}'.`
							);
						}
					} else if (~this.required.indexOf(name)) {
						this.assert(false, 'OZ_FORM_CONTAINS_EMPTY_FIELD', {
							label: this.adapter.getFieldLabel(name),
						});
					}
				} catch (e: any) {
					if (e.isFormError) {
						if (!this.errors[name]) {
							this.errors[name] = [];
						}

						this.errors[name].push(e);

						if (!this.checkAll && showDialog) {
							this.getAppContext().view.dialog({
								type: 'error',
								text: e.message,
								data: e.data,
							});
							break;
						}
					} else {
						throw e;
					}
				}
			}
		}

		return Object.keys(this.errors).length === 0;
	}

	/**
	 * Make an assertions.
	 *
	 * @param predicate The assertion predicate.
	 * @param message The error message when the predicate is false.
	 * @param data The error data.
	 */
	assert(
		predicate: unknown,
		message: string,
		data?: Record<string, unknown>
	): this {
		if (!predicate) {
			throw new OWebFormError(message, data);
		}

		return this;
	}

	/**
	 * Declare a field validator.
	 *
	 * @param name The validator name.
	 * @param validator The validator function.
	 */
	static declareFieldValidator(
		name: string,
		validator: OWebFormFieldValidator
	): void {
		if (name in DECLARED_VALIDATORS) {
			logger.warn(`[OWebFormValidator] field validator "${name}" overwritten.`);
		}

		DECLARED_VALIDATORS[name] = validator;
	}

	/**
	 * Gets field validator.
	 *
	 * @param name The field validator name.
	 */
	static getDeclaredValidator(
		name: string
	): OWebFormFieldValidator | undefined {
		return DECLARED_VALIDATORS[name];
	}
}

export const defaultValidators = {
	code: (value: unknown, _name: string, fv: OWebForm) => {
		const codeReg = new RegExp(fv.getConfig('OZ_CODE_REG'));
		fv.assert(
			codeReg.test(isNil(value) ? '' : String(value)),
			'OZ_AUTH_CODE_INVALID'
		);
	},
	uname: (value: unknown, name: string, fv: OWebForm) => {
		const v: string = (isNil(value) ? '' : String(value))
			.replace(/\s+/g, ' ')
			.trim();

		fv.assert(
			v.length >= fv.getConfig('OZ_USER_NAME_MIN_LENGTH'),
			'OZ_FIELD_USER_NAME_TOO_SHORT'
		)
			.assert(
				v.length <= fv.getConfig('OZ_USER_NAME_MAX_LENGTH'),
				'OZ_FIELD_USER_NAME_TOO_LONG'
			)
			.setFieldValue(name, v);
	},
	login_pass: (value: unknown, _name: string, fv: OWebForm) => {
		const pass = isNil(value) ? '' : String(value),
			min = fv.getConfig('OZ_PASS_MIN_LENGTH'),
			max = fv.getConfig('OZ_PASS_MAX_LENGTH');
		fv.assert(pass.length >= min, 'OZ_FIELD_PASS_INVALID').assert(
			pass.length <= max,
			'OZ_FIELD_PASS_INVALID'
		);
	},
	pass: (value: unknown, _name: string, fv: OWebForm) => {
		const pass = isNil(value) ? '' : String(value),
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
	pass_verify: (value: unknown, _name: string, fv: OWebForm) => {
		fv.assert(
			value === fv.getFieldValue('pass'),
			'OZ_FIELD_PASS_AND_VPASS_NOT_EQUAL'
		);
	},
	birth_date: (value: unknown, name: string, fv: OWebForm) => {
		const od = new OWebDate(
				fv.getAppContext(),
				isNil(value) ? undefined : (value as ODateValue)
			),
			date = od.describe(),
			minAge = fv.getConfig('OZ_USER_MIN_AGE'),
			maxAge = fv.getConfig('OZ_USER_MAX_AGE'),
			isValid =
				date && isValidAge(date.d, parseInt(date.mm), date.Y, minAge, maxAge);

		fv.assert(isValid, 'OZ_FIELD_BIRTH_DATE_INVALID', {
			input: value,
			min: minAge,
			max: maxAge,
		});

		date && fv.setFieldValue(name, `${date.Y}-${date.mm}-${date.d}`);
	},
	gender: (value: unknown, _name: string, fv: OWebForm) => {
		const genders = fv.getConfig('OZ_USER_ALLOWED_GENDERS');
		fv.assert(genders.indexOf(value) >= 0, 'OZ_FIELD_GENDER_INVALID');
	},
	email: (value: unknown, name: string, fv: OWebForm) => {
		/**
		 * Email matching regex
		 *
		 * source: http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
		 *        - TLD not required
		 *            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
		 *        - must have TLD
		 *            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
		 */
		const emailReg =
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
		const email = (isNil(value) ? '' : String(value))
			.replace(/\s/g, ' ')
			.trim();

		fv.assert(emailReg.test(email), 'OZ_FIELD_EMAIL_INVALID').setFieldValue(
			name,
			email
		);
	},
};

forEach(defaultValidators, (validator, name) => {
	OWebForm.declareFieldValidator(name, validator);
});
