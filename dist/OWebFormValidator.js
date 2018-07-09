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
            throw new Error("OWebFormValidator: a valid form element is required.");
        }
        let m = this;
        this.form = form;
        this.formData = new FormData(this.form);
        let fo = this.form.querySelectorAll("[data-oweb-form-v]"); // return NodeList not Array of node (ex: in Firefox)
        (Utils.isArray(fo) ? fo : Utils.toArray(fo)).forEach((field) => {
            let name = field.getAttribute("name"), validator_name = field.getAttribute("data-oweb-form-v");
            if (name) {
                if (!formValidators[validator_name]) {
                    throw new Error("OWebFormValidator: validator '" +
                        validator_name +
                        "' is explicitly set for field '" + name +
                        "' but is not defined.");
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
                        console.warn("OWebFormValidator: validator '%s' is not defined, field '%s' is then considered as safe.", validator_name, name);
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
            throw new TypeError("OWebFormValidator: field name should be a valid string");
        }
        if (!Utils.isFunction(validator)) {
            throw new TypeError("OWebFormValidator: field validator should be a valid function");
        }
        if (name in validator) {
            console.warn("OWebFormValidator: field '%s' validator will be overwritten", name);
        }
        formValidators[name] = validator;
    }
    static addFieldValidators(map) {
        Utils.iterate(map, (key, fn) => {
            OWebFormValidator.addFieldValidator(key, fn);
        });
    }
}
;
//# sourceMappingURL=OWebFormValidator.js.map