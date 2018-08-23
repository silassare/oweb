import {OWebApp, Utils, OWebCustomError} from "./oweb";

export type tFormValidator = (value: any, name: string, context: OWebFormValidator) => void;

let formValidators: { [key: string]: tFormValidator } = {};

export class OWebFormError extends OWebCustomError {
	readonly __oweb_form_error = true;
}

export default class OWebFormValidator {
	private readonly formData: FormData;
	private validatorsMap: { [key: string]: string } = {};
	private errorList: OWebFormError[]               = [];

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
					throw new Error(`[OWebFormValidator] validator "${validator_name}" is explicitly set for field "${ name }" but is not defined.`);
				}

				m.validatorsMap[name] = validator_name;
			}
		});
	}

	getForm(): HTMLFormElement {
		return this.form;
	}

	getAppContext(): OWebApp {
		return this.app_context;
	}

	getConfig(key: string): any {
		return this.getAppContext().configs.get(key);
	}

	getFormData(fields: Array<string>): FormData {

		if (Utils.isArray(fields)) {
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

	getField(name: string): any {
		return this.formData.get(name);
	}

	setField(name: string, value: any): this {
		this.formData.set(name, value);
		return this;
	}

	// for checkboxes and others
	getAllFields(name: string): any {
		return this.formData.getAll(name);
	}

	getFieldDescription(name: string): string {
		let field            = this.form.querySelector("[name='" + name + "']"),
			description: any = name;

		if (field) {
			let id = field.getAttribute("id"), label, placeholder;
			if (id && (label = this.form.querySelector("label[for='" + id + "']"))) {
				description = label.textContent;
			} else if ((placeholder = field.getAttribute("placeholder")) && placeholder.trim().length) {
				description = placeholder;
			}
		}

		return description;
	}

	getErrors(): Array<OWebFormError> {
		return this.errorList;
	}

	validate(): boolean {
		let context                    = this,
			c                          = -1,
			field_names: Array<string> = [],
			name;

		// empty error list
		context.errorList.splice(0);

		Utils.toArray(context.form.elements).forEach(function (i) {
			if (i.name !== undefined && field_names.indexOf(i.name) < 0) {
				field_names.push(i.name);
			}
		});

		while (name = field_names[++c]) {
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

					this.errorList.push(e);

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

		return this.errorList.length === 0;
	}

	assert(assertion: any, message: string, data?: {}): this {
		if (!assertion) {
			throw new OWebFormError(message, data);
		}

		return this;
	}

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

	static addFieldValidators(map: { [key: string]: tFormValidator }): void {
		Utils.forEach(map, (fn: tFormValidator, key: string) => {
			OWebFormValidator.addFieldValidator(key, fn);
		});
	}
};