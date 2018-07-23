"use strict";
import OWebCustomError from "./OWebCustomError";
import Utils from "./utils/Utils";
let formValidators = {};
export default class OWebFormValidator {
    constructor(app_context, form, required = [], excluded = [], checkAll = false) {
        this.app_context = app_context;
        this.form = form;
        this.required = required;
        this.excluded = excluded;
        this.checkAll = checkAll;
        this.validatorsMap = {};
        this.errorList = [];
        if (!form || form.nodeName !== "FORM") {
            throw new Error("[OWebFormValidator] a valid form element is required.");
        }
        let m = this;
        this.form = form;
        this.formData = new FormData(this.form);
        let fo = this.form.querySelectorAll("[data-oweb-form-v]"); // return NodeList not Array of node (ex: in Firefox)
        (Utils.isArray(fo) ? fo : Utils.toArray(fo)).forEach((field) => {
            let name = field.getAttribute("name"), validator_name = field.getAttribute("data-oweb-form-v");
            if (name) {
                if (!formValidators[validator_name]) {
                    throw new Error(`[OWebFormValidator] validator "${validator_name}" is explicitly set for field "${name}" but is not defined.`);
                }
                m.validatorsMap[name] = validator_name;
            }
        });
    }
    getForm() {
        return this.form;
    }
    getAppContext() {
        return this.app_context;
    }
    getConfig(key) {
        return this.getAppContext().configs.get(key);
    }
    getFormData(fields) {
        if (Utils.isArray(fields)) {
            let formData = new FormData();
            for (let i = 0; i < fields.length; i++) {
                let field = fields[i];
                let values = this.getAllFields(field); //for checkboxes and others
                values.forEach((value) => {
                    formData.append(field, value);
                });
            }
            return formData;
        }
        return this.formData;
    }
    getField(name) {
        return this.formData.get(name);
    }
    setField(name, value) {
        this.formData.set(name, value);
        return this;
    }
    // for checkboxes and others
    getAllFields(name) {
        return this.formData.getAll(name);
    }
    getFieldDescription(name) {
        let field = this.form.querySelector("[name='" + name + "']"), description = name;
        if (field) {
            let id = field.getAttribute("id"), label, placeholder;
            if (id && (label = this.form.querySelector("label[for='" + id + "']"))) {
                description = label.textContent;
            }
            else if ((placeholder = field.getAttribute("placeholder")) && placeholder.trim().length) {
                description = placeholder;
            }
        }
        return description;
    }
    getErrors() {
        return this.errorList;
    }
    validate() {
        let context = this, c = -1, field_names = [], name;
        // empty error list
        context.errorList.splice(0);
        Utils.toArray(context.form.elements).forEach(function (i) {
            if (i.name !== undefined && field_names.indexOf(i.name) < 0) {
                field_names.push(i.name);
            }
        });
        while ((this.checkAll || !this.errorList.length) && (name = field_names[++c])) {
            try {
                if (context.excluded.indexOf(name) < 0) {
                    let value = context.getField(name), validator_name = context.validatorsMap[name] || name, fn = formValidators[validator_name];
                    if (~context.required.indexOf(name)) {
                        this.assert(Utils.isNotEmpty(value), "OZ_FORM_CONTAINS_EMPTY_FIELD", { "label": context.getFieldDescription(name) });
                    }
                    if (Utils.isFunction(fn)) {
                        fn(value, name, context);
                    }
                    else {
                        console.warn("[OWebFormValidator] validator '%s' is not defined, field '%s' is then considered as safe.", validator_name, name);
                    }
                }
            }
            catch (e) {
                if (context.catchable(e)) {
                    throw e;
                }
            }
        }
        return this.errorList.length === 0;
    }
    assert(assertion, message, data) {
        if (!assertion) {
            throw new OWebCustomError(message, data);
        }
        return this;
    }
    catchable(e) {
        if (e instanceof OWebCustomError) {
            if (this.checkAll) {
                this.errorList.push(e);
            }
            else {
                this.getAppContext().view.dialog({
                    type: "error",
                    text: e.message,
                    data: e.getData()
                });
            }
            return true;
        }
        return false;
    }
    static addFieldValidator(name, validator) {
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
    static addFieldValidators(map) {
        Utils.forEach(map, (key, fn) => {
            OWebFormValidator.addFieldValidator(key, fn);
        });
    }
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm1WYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm1WYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDO0FBRWIsT0FBTyxlQUFlLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBSWxDLElBQUksY0FBYyxHQUFzQyxFQUFFLENBQUM7QUFFM0QsTUFBTSxDQUFDLE9BQU87SUFLYixZQUE2QixXQUFvQixFQUFtQixJQUFxQixFQUFtQixXQUEwQixFQUFFLEVBQW1CLFdBQTBCLEVBQUUsRUFBbUIsV0FBb0IsS0FBSztRQUF0TSxnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUFtQixTQUFJLEdBQUosSUFBSSxDQUFpQjtRQUFtQixhQUFRLEdBQVIsUUFBUSxDQUFvQjtRQUFtQixhQUFRLEdBQVIsUUFBUSxDQUFvQjtRQUFtQixhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUgzTixrQkFBYSxHQUE4QixFQUFFLENBQUM7UUFDOUMsY0FBUyxHQUFrQyxFQUFFLENBQUM7UUFHckQsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRTtZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7U0FDekU7UUFFRCxJQUFJLENBQUMsR0FBVyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBTyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsSUFBSSxFQUFFLEdBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUEscURBQXFEO1FBRXRILENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMs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