import OWebApp from "./OWebApp";
import OWebCustomError from "./OWebCustomError";
import Utils from "./utils/Utils";

type tFormErrorMap = { [key: string]: OWebFormError[] };
export type tFormValidator = (value: any, name: string, context: OWebFormValidator) => void;

let formValidators: { [key: string]: tFormValidator } = {};

export class OWebFormError extends OWebCustomError {
	readonly __oweb_form_error = true;
}

export default class OWebFormValidator {
	private readonly formData: FormData;
	private validatorsMap: { [key: string]: string } = {};
	private errorMap: tFormErrorMap                  = {};

	/**
	 * @param app_context The app context.
	 * @param form The form element.
	 * @param required The required fields.
	 * @param excluded The fields to exclude from validation.
	 * @param checkAll When true all fields will be validated.
	 */
	constructor(private readonly app_context: OWebApp, private readonly form: HTMLFormElement, private readonly required: Array<string> = [], private readonly excluded: Array<string> = [], private readonly checkAll: boolean = false) {
		if (!form || form.nodeName !== "FORM") {
			throw new Error("[OWebFormValidator] a valid form element is required.");
		}

		let m         = this;
		this.form     = form;
		this.formData = new FormData(this.form);
		let fo        = this.form.querySelectorAll("[data-oweb-form-v]");// return NodeList not Array of node (ex: in Firefox)

		(Utils.isArray(fo) ? fo : Utils.toArray(fo)).forEach((field) => {
			let name           = field.getAttribute("name"),
				validator_name = field.getAttribute("data-oweb-form-v");

			if (name) {
				if (!formValidators[validator_name]) {
					throw new Error(`[OWebFormValidator] validator "${validator_name}" is explicitly set for field "${name}" but is not defined.`);
				}

				m.validatorsMap[name] = validator_name;
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
		return this.app_context;
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
	getFormData(fields: Array<string> = []): FormData {

		if (fields.length) {
			let formData = new FormData();
			for (let i = 0; i < fields.length; i++) {
				let field  = fields[i];
				let values = this.getAllFields(field);//for checkboxes and others
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
	getAllFields(name: string): any {
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
		let field            = this.form.querySelector("[name='" + name + "']"),
			description: any = name;

		if (field) {
			let id = field.getAttribute("id"), label, placeholder, title;
			if (id && (label = this.form.querySelector("label[for='" + id + "']"))) {
				description = label.textContent;
			} else if ((placeholder = field.getAttribute("placeholder")) && placeholder.trim().length) {
				description = placeholder;
			} else if ((title = field.getAttribute("title")) && title.trim().length) {
				description = title;
			}
		}

		return description;
	}

	/**
	 * Returns error map.
	 */
	getErrors(): tFormErrorMap {
		return this.errorMap;
	}

	/**
	 * Run form validation.
	 */
	validate(): boolean {
		let context                    = this,
			c                          = -1,
			field_names: Array<string> = [],
			name;

		// empty error list
		context.errorMap = {};

		Utils.toArray(context.form.elements).forEach(function (i) {
			if (i.name !== undefined && field_names.indexOf(i.name) < 0) {
				field_names.push(i.name);
			}
		});

		while ((name = field_names[++c])) {
			try {
				if (context.excluded.indexOf(name) < 0) {
					let value          = context.getField(name),
						validator_name = context.validatorsMap[name] || name,
						fn             = formValidators[validator_name];

					if (Utils.isNotEmpty(value)) {
						if (Utils.isFunction(fn)) {
							fn(value, name, context);
						} else {
							console.warn("[OWebFormValidator] validator '%s' is not defined, field '%s' is then considered as safe.", validator_name, name);
						}
					} else if (~context.required.indexOf(name)) {
						this.assert(false, "OZ_FORM_CONTAINS_EMPTY_FIELD", {"label": context.getFieldDescription(name)});
					}
				}
			} catch (e) {
				if (e.__oweb_form_error) {

					if (!this.errorMap[name]) {
						this.errorMap[name] = [];
					}

					this.errorMap[name].push(e);

					if (!this.checkAll) {
						this.getAppContext().view.dialog({
							type: "error",
							text: e.message,
							data: e.data
						});
						break;
					}

				} else {
					throw e
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
	static addFieldValidator(name: string, validator: tFormValidator): void {

		if (!Utils.isString(name)) {
			throw new TypeError("[OWebFormValidator] field name should be a valid string.");
		}

		if (!Utils.isFunction(validator)) {
			throw new TypeError("[OWebFormValidator] field validator should be a valid function.");
		}

		if (name in validator) {
			console.warn(`[OWebFormValidator] field "${name}" validator will be overwritten.`);
		}

		formValidators[name] = validator;
	}

	/**
	 * Adds fields validators.
	 *
	 * @param map The map of fields validators.
	 */
	static addFieldValidators(map: { [key: string]: tFormValidator }): void {
		Utils.forEach(map, (fn: tFormValidator, key: string) => {
			OWebFormValidator.addFieldValidator(key, fn);
		});
	}
};