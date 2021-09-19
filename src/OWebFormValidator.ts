import { extractFieldLabelText, isPlainObject } from './utils';
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

export type OFieldValue = string | null | undefined | number | Blob;

export interface OField {
	value: OFieldValue;
	label?: string;
	validator?: string;
}
export type OFormData = FormData | Record<string, OFieldValue>;

export type OFormOptions = Record<string, OField>;
export type OForm = OFormOptions | HTMLFormElement;

type OFormErrors = { [key: string]: OWebFormError[] };
export type OFormValidator = (
	value: any,
	name: string,
	context: OWebFormValidator,
) => void;

const FORM_VALIDATORS: { [key: string]: OFormValidator } = Object.create({});

interface OWebFormAdapter {
	/**
	 * Returns form data.
	 * @param fields The fields name list.
	 */
	toFormData(fields: string[]): FormData;

	/**
	 * Returns fields validators map.
	 */
	getValidatorsMap(): Record<string, string>;

	/**
	 *
	 * @param fieldName
	 * @param validatorName
	 */
	setFieldValidator(fieldName: string, validatorName: string): this;

	/**
	 * Gets a given field name value.
	 *
	 * @param fieldName
	 */
	getField(fieldName: string): OFieldValue;

	/**
	 * Sets a given field value.
	 * @param fieldName
	 * @param value
	 */
	setField(fieldName: string, value: OFieldValue): this;

	/**
	 * Returns all fields names list.
	 */
	getFieldsList(): string[];

	/**
	 * Returns field description.
	 *
	 * We search the field label, placeholder or title.
	 *
	 * @param fieldName
	 */
	getFieldDescription(fieldName: string): string;
}

class OFormDOMFormAdapter implements OWebFormAdapter {
	private validatorsMap: { [key: string]: string } = Object.create({});
	private descriptionsMap: { [key: string]: string } = Object.create({});
	private readonly formData: FormData;

	constructor(private readonly form: HTMLFormElement) {
		if (!form || form.nodeName !== 'FORM') {
			throw new Error(
				'[OWebFormValidator][DOMFormAdapter] a valid form element is required.'
			);
		}

		const m = this;
		this.form = form;
		this.formData = new FormData(this.form);
		const fo = this.form.querySelectorAll('[data-oweb-form-v]'); // returns NodeList not Array of node (ex: in Firefox)

		(isArray(fo) ? fo : toArray(fo)).forEach((field) => {
			const name = field.getAttribute('name'),
				validatorName = field.getAttribute('data-oweb-form-v');

			if (name && validatorName) {
				m.setFieldValidator(name,validatorName);
			}
		});
	}

	toFormData(fields: string[] = []): FormData {
		const fd = new FormData();

		this.formData.forEach(function (value, name) {
			if (!fields.length || fields.indexOf(name) >= 0) {
				fd.append(name, value);
			}
		});

		return fd;
	}

	getValidatorsMap() {
		return this.validatorsMap;
	}

	setFieldValidator(fieldName: string, validatorName: string) {
		if (!FORM_VALIDATORS[validatorName]) {
			throw new Error(
				`[OWebFormValidator][DOMFormAdapter] validator "${validatorName}" is not defined can't set for field "${fieldName}".`
			);
		}

		this.validatorsMap[fieldName] = validatorName;

		return this;
	}

	getField(name: string): any {
		return this.formData.get(name);
	}

	setField(name: string, value: any): this {
		this.formData.set(name, value);
		return this;
	}

	getFieldsList(): string[] {
		const fieldNames: string[] = [];

		toArray(this.form.elements).forEach(function formElementsIterator(el) {
			const entry:any = el as unknown;
			if (entry.name !== undefined && fieldNames.indexOf(entry.name) < 0) {
				fieldNames.push(entry.name);
			}
		});

		return fieldNames;
	}

	getFieldDescription(name: string): string {
		if (!this.descriptionsMap[name]) {
			this.descriptionsMap[name] = extractFieldLabelText(this.form, name);
		}

		return this.descriptionsMap[name];
	}
}

class OFormObjectAdapter implements OWebFormAdapter {
	private validatorsMap: { [key: string]: string } = Object.create({});
	private descriptionsMap: { [key: string]: string } = Object.create({});
	private readonly formObj: { [key: string]: any } = Object.create({});

	constructor(form: OFormOptions) {
		if (!isPlainObject(form)) {
			throw new Error(
				'[OWebFormValidator][ObjectFormAdapter] a valid form plain object is required.'
			);
		}

		forEach<OField>(form, (field, fieldName) => {
			this.formObj[fieldName] = field.value;

			if (field.validator) {
				this.setFieldValidator(fieldName, field.validator);
			}

			if (field.label) {
				this.descriptionsMap[fieldName] = field.label;
			}
		});
	}

	toFormData(fields: string[] = []) {
		const fd = new FormData();

		forEach(this.formObj, function (value, name) {
			if (!fields.length || fields.indexOf(name) >= 0) {
				if (isArray(value) || value instanceof FileList) {
					forEach(value, function (val) {
						fd.append(name, val);
					});
				} else {
					fd.append(name, value);
				}
			}
		});

		return fd;
	}

	getValidatorsMap() {
		return this.validatorsMap;
	}

	setFieldValidator(fieldName: string, validatorName: string) {
		if (!FORM_VALIDATORS[validatorName]) {
			throw new Error(
				`[OWebFormValidator][DOMFormAdapter] validator "${validatorName}" is not defined can't set for field "${fieldName}".`
			);
		}

		this.validatorsMap[fieldName] = validatorName;

		return this;
	}

	getField(name: string): any {
		return this.formObj[name];
	}

	setField(name: string, value: any): this {
		this.formObj[name] = value;
		return this;
	}

	getFieldsList(): string[] {
		return Object.keys(this.formObj);
	}

	getFieldDescription(name: string): string {
		if (this.descriptionsMap[name]) {
			return this.descriptionsMap[name];
		}

		return name;
	}
}

export default class OWebFormValidator {
	private readonly adapter: OWebFormAdapter;
	private validatorsMap: { [key: string]: string } = {};
	private errorMap: OFormErrors                    = {};

	/**
	 * @param _appContext The app context.
	 * @param form The form.
	 * @param required The required fields.
	 * @param excluded The fields to exclude from validation.
	 * @param checkAll When true all fields will be validated.
	 * @param verbose Log warning.
	 */
	constructor(
		private readonly _appContext: OWebApp,
		form: OForm,
		private readonly required: string[] = [],
		private readonly excluded: string[] = [],
		private readonly checkAll: boolean = false,
		private readonly verbose: boolean = false
	) {
		this.adapter =
			form instanceof HTMLFormElement
				? new OFormDOMFormAdapter(form)
				: new OFormObjectAdapter(form);
	}

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
	getField(name: string): OFieldValue {
		return this.adapter.getField(name);
	}

	/**
	 * Sets a given field value.
	 * @param name
	 * @param value
	 */
	setField(name: string, value: OFieldValue): this {
		this.adapter.setField(name, value);
		return this;
	}

	/**
	 * Returns error map.
	 */
	getErrors(): OFormErrors {
		return this.errorMap;
	}

	/**
	 * Runs form validation.
	 */
	validate(showDialog = true): boolean {
		const fieldNames: string[] = this.adapter.getFieldsList();
		let c = -1,
			name;

		// empty error list
		this.errorMap = {};

		while ((name = fieldNames[++c])) {
			if (this.excluded.indexOf(name) < 0) {
				try {
					const value = this.getField(name),
						validatorName = this.validatorsMap[name] || name,
						fn = FORM_VALIDATORS[validatorName];

					if (isNotEmpty(value)) {
						if (isFunction(fn)) {
							fn(value, name, this);
						} else if (this.verbose) {
							logger.warn(
								`[OWebFormValidator] validator '${validatorName}' is not defined, field '${name}' is then considered as safe.`
							);
						}
					} else if (~this.required.indexOf(name)) {
						this.assert(false, 'OZ_FORM_CONTAINS_EMPTY_FIELD', {
							label: this.adapter.getFieldDescription(name),
						});
					}
				} catch (e:any) {
					if (e.isFormError) {
						if (!this.errorMap[name]) {
							this.errorMap[name] = [];
						}

						this.errorMap[name].push(e);

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

		return Object.keys(this.errorMap).length === 0;
	}

	/**
	 * Make an assertions.
	 *
	 * @param predicate The assertion predicate.
	 * @param message The error message when the predicate is false.
	 * @param data The error data.
	 */
	assert(predicate: unknown, message: string, data?: Record<string, unknown>): this {
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
				'[OWebFormValidator] field name should be a valid string.'
			);
		}

		if (!isFunction(validator)) {
			throw new TypeError(
				'[OWebFormValidator] field validator should be a valid function.'
			);
		}

		if (name in validator) {
			logger.warn(
				`[OWebFormValidator] field "${name}" validator will be overwritten.`
			);
		}

		FORM_VALIDATORS[name] = validator;
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
