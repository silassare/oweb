import OWebApp from './OWebApp';
import {
	forEach,
	isArray,
	isFunction,
	isNotEmpty,
	isString,
	logger,
	toArray,
} from './utils';
import OWebFormError from './OWebFormError';

type OFormErrorMap = { [key: string]: OWebFormError[] };
export type OFormValidator = (
	value: any,
	name: string,
	context: OWebFormValidator,
) => void;

const formValidators: { [key: string]: OFormValidator } = {};

export default class OWebFormValidator {
	private readonly formData: FormData;
	private validatorsMap: { [key: string]: string } = {};
	private errorMap: OFormErrorMap = {};

	/**
	 * @param _appContext The app context.
	 * @param form The form element.
	 * @param required The required fields.
	 * @param excluded The fields to exclude from validation.
	 * @param checkAll When true all fields will be validated.
	 */
	constructor(
		private readonly _appContext: OWebApp,
		private readonly form: HTMLFormElement,
		private readonly required: string[] = [],
		private readonly excluded: string[] = [],
		private readonly checkAll: boolean = false,
	) {
		if (!form || form.nodeName !== 'FORM') {
			throw new Error(
				'[OWebFormValidator] a valid form element is required.',
			);
		}

		const m = this;
		this.form = form;
		this.formData = new FormData(this.form);
		const fo = this.form.querySelectorAll('[data-oweb-form-v]'); // returns NodeList not Array of node (ex: in Firefox)

		(isArray(fo) ? fo : toArray(fo)).forEach((field) => {
			const name = field.getAttribute('name'),
				validatorName = field.getAttribute('data-oweb-form-v');

			if (name) {
				if (!formValidators[validatorName]) {
					throw new Error(
						`[OWebFormValidator] validator "${validatorName}" is explicitly set for field "${name}" but is not defined.`,
					);
				}

				m.validatorsMap[name] = validatorName;
			}
		});
	}

	/**
	 * Returns the form element.
	 */
	getForm(): HTMLFormElement {
		return this.form;
	}

	/**
	 * Returns the app context.
	 */
	getAppContext(): OWebApp {
		return this._appContext;
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
		if (fields.length) {
			const formData = new FormData();
			for (let i = 0; i < fields.length; i++) {
				const field = fields[i];
				const values = this.getFieldValues(field); // for checkboxes and others
				values.forEach((value: any) => {
					formData.append(field, value);
				});
			}

			return formData;
		}

		return this.formData;
	}

	/**
	 * Gets a given field name value.
	 *
	 * @param name
	 */
	getField(name: string): any {
		return this.formData.get(name);
	}

	/**
	 * Sets a given field value.
	 * @param name
	 * @param value
	 */
	setField(name: string, value: any): this {
		this.formData.set(name, value);
		return this;
	}

	/**
	 * Gets checkboxes like fields value.
	 *
	 * @param name
	 */
	getFieldValues(name: string): any {
		return this.formData.getAll(name);
	}

	/**
	 * Search for field description.
	 *
	 * We search the field label, placeholder or title.
	 *
	 * @param name
	 */
	getFieldDescription(name: string): string {
		const field = this.form.querySelector(`[name='${name}']`);
		let description: any = name;

		if (field) {
			const id = field.getAttribute('id');
			let label, placeholder, title;
			if (
				id &&
				(label = this.form.querySelector(`label[for='${id}']`))
			) {
				description = label.textContent;
			} else if (
				(placeholder = field.getAttribute('placeholder')) &&
				placeholder.trim().length
			) {
				description = placeholder;
			} else if (
				(title = field.getAttribute('title')) &&
				title.trim().length
			) {
				description = title;
			}
		}

		return description;
	}

	/**
	 * Returns error map.
	 */
	getErrors(): OFormErrorMap {
		return this.errorMap;
	}

	/**
	 * Runs form validation.
	 */
	validate(): boolean {
		const context = this,
			fieldNames: string[] = [];
		let c = -1,
			name;

		// empty error list
		context.errorMap = {};

		toArray(context.form.elements).forEach(function (i) {
			if (i.name !== undefined && fieldNames.indexOf(i.name) < 0) {
				fieldNames.push(i.name);
			}
		});

		while ((name = fieldNames[++c])) {
			try {
				if (context.excluded.indexOf(name) < 0) {
					const value = context.getField(name),
						validatorName = context.validatorsMap[name] || name,
						fn = formValidators[validatorName];

					if (isNotEmpty(value)) {
						if (isFunction(fn)) {
							fn(value, name, context);
						} else {
							logger.warn(
								`[OWebFormValidator] validator '${validatorName}' is not defined, field '${name}' is then considered as safe.`,
							);
						}
					} else if (~context.required.indexOf(name)) {
						this.assert(false, 'OZ_FORM_CONTAINS_EMPTY_FIELD', {
							label: context.getFieldDescription(name),
						});
					}
				}
			} catch (e) {
				if (e.isFormError) {
					if (!this.errorMap[name]) {
						this.errorMap[name] = [];
					}

					this.errorMap[name].push(e);

					if (!this.checkAll) {
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

		return Object.keys(this.errorMap).length === 0;
	}

	/**
	 * Make an assertions.
	 *
	 * @param predicate The assertion predicate.
	 * @param message The error message when the predicate is false.
	 * @param data The error data.
	 */
	assert(predicate: any, message: string, data?: {}): this {
		if (!predicate) {
			throw new OWebFormError(message, data);
		}

		return this;
	}

	/**
	 * Adds a new validator.
	 *
	 * @param name The validator name.
	 * @param validator The validator function.
	 */
	static addFieldValidator(name: string, validator: OFormValidator): void {
		if (!isString(name)) {
			throw new TypeError(
				'[OWebFormValidator] field name should be a valid string.',
			);
		}

		if (!isFunction(validator)) {
			throw new TypeError(
				'[OWebFormValidator] field validator should be a valid function.',
			);
		}

		if (name in validator) {
			logger.warn(
				`[OWebFormValidator] field "${name}" validator will be overwritten.`,
			);
		}

		formValidators[name] = validator;
	}

	/**
	 * Adds fields validators.
	 *
	 * @param map The map of fields validators.
	 */
	static addFieldValidators(map: { [key: string]: OFormValidator }): void {
		forEach(map, (fn: OFormValidator, key: string) => {
			OWebFormValidator.addFieldValidator(key, fn);
		});
	}
}
