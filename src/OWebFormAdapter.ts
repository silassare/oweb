import {
	extractFieldLabelText,
	forEach,
	isArray,
	isPlainObject,
	toArray,
} from './utils';
import OWebForm, { OWebFormFieldValidator, OWebFormOptions } from './OWebForm';

export type OWebFormDataEntryValue = File | string;
export abstract class OWebFormAdapter {
	protected validators: { [key: string]: OWebFormFieldValidator[] } =
		Object.create({});

	/**
	 * Gets validators for the field with the given name.
	 */
	getFieldValidators(fieldName: string): OWebFormFieldValidator[] {
		return this.validators[fieldName] || [];
	}

	/**
	 * Adds validator for the field with the given name.
	 *
	 * @param fieldName
	 * @param validator
	 */
	pushFieldValidator(
		fieldName: string,
		validator: string | OWebFormFieldValidator<unknown>
	): this {
		if (typeof validator === 'string') {
			const fn = OWebForm.getDeclaredValidator(validator);
			if (!fn) {
				throw new Error(
					`[OWebFormValidator][OWebFormAdapter] validator "${validator}" is not defined can't set for field "${fieldName}".`
				);
			}

			validator = fn;
		}

		if (!this.validators[fieldName]) {
			this.validators[fieldName] = [];
		}

		this.validators[fieldName].push(validator);

		return this;
	}

	/**
	 * Returns form data.
	 * @param fields The fields name list.
	 */
	abstract toFormData(fields: string[]): FormData;

	/**
	 * Gets a given field name value.
	 *
	 * @param fieldName
	 */
	abstract getFieldValue<T = null | OWebFormDataEntryValue>(
		fieldName: string
	): T;

	/**
	 * Sets a given field value.
	 *
	 * @param fieldName
	 * @param value
	 */
	abstract setFieldValue(
		fieldName: string,
		value: OWebFormDataEntryValue
	): this;

	/**
	 * Returns all fields names list.
	 */
	abstract getFieldsNames(): string[];

	/**
	 * Returns field label.
	 *
	 * We search the field label, placeholder or title.
	 *
	 * @param fieldName
	 */
	abstract getFieldLabel(fieldName: string): string;
}

export class OFormDOMFormAdapter extends OWebFormAdapter {
	private labels: { [key: string]: string } = Object.create({});
	private readonly formData: FormData;

	constructor(private readonly form: HTMLFormElement) {
		super();
		if (!form || form.nodeName !== 'FORM') {
			throw new Error(
				'[OWebFormValidator][DOMFormAdapter] a valid form element is required.'
			);
		}
		this.form = form;
		this.formData = new FormData(this.form);
		const fo = this.form.querySelectorAll('[data-oweb-form-v]'); // returns NodeList not Array of node (ex: in Firefox)

		(isArray(fo) ? fo : toArray(fo)).forEach((field) => {
			const name = field.getAttribute('name'),
				validator = field.getAttribute('data-oweb-form-v');

			if (name && validator) {
				this.pushFieldValidator(name, validator);
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

	getFieldValue<T = null | OWebFormDataEntryValue>(name: string): T {
		return this.formData.get(name) as unknown as T;
	}

	setFieldValue(name: string, value: OWebFormDataEntryValue): this {
		this.formData.set(name, value);
		return this;
	}

	getFieldsNames(): string[] {
		const fieldNames: string[] = [];

		toArray(this.form.elements).forEach(function formElementsIterator(el) {
			const entry: any = el as unknown;
			if (entry.name !== undefined && fieldNames.indexOf(entry.name) < 0) {
				fieldNames.push(entry.name);
			}
		});

		return fieldNames;
	}

	getFieldLabel(name: string): string {
		if (!this.labels[name]) {
			this.labels[name] = extractFieldLabelText(this.form, name);
		}

		return this.labels[name];
	}
}

export class OFormObjectAdapter extends OWebFormAdapter {
	private labels: { [key: string]: string } = Object.create({});
	private readonly formObj: { [key: string]: OWebFormDataEntryValue } =
		Object.create({});

	constructor(form: OWebFormOptions) {
		super();
		if (!isPlainObject(form)) {
			throw new Error(
				'[OWebFormValidator][ObjectFormAdapter] a valid form plain object is required.'
			);
		}

		forEach<OWebFormOptions>(form, (field, fieldName) => {
			this.formObj[fieldName] = field.value;

			if (field.validator) {
				this.pushFieldValidator(fieldName, field.validator);
			}

			if (field.label) {
				this.labels[fieldName] = field.label;
			}
		});
	}

	toFormData(fields: string[] = []): FormData {
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

	getFieldValue<T = null | OWebFormDataEntryValue>(name: string): T {
		return this.formObj[name] as unknown as T;
	}

	setFieldValue(name: string, value: OWebFormDataEntryValue): this {
		this.formObj[name] = value;
		return this;
	}

	getFieldsNames(): string[] {
		return Object.keys(this.formObj);
	}

	getFieldLabel(name: string): string {
		if (this.labels[name]) {
			return this.labels[name];
		}

		return name;
	}
}
