import OWebCustomError from "./OWebCustomError";
import Utils from "./utils/Utils";
let formValidators = {};
export class OWebFormError extends OWebCustomError {
    constructor() {
        super(...arguments);
        this.__oweb_form_error = true;
    }
}
export default class OWebFormValidator {
    /**
     * @param app_context The app context.
     * @param form The form element.
     * @param required The required fields.
     * @param excluded The fields to exclude from validation.
     * @param checkAll When true all fields will be validated.
     */
    constructor(app_context, form, required = [], excluded = [], checkAll = false) {
        this.app_context = app_context;
        this.form = form;
        this.required = required;
        this.excluded = excluded;
        this.checkAll = checkAll;
        this.validatorsMap = {};
        this.errorMap = {};
        if (!form || form.nodeName !== "FORM") {
            throw new Error("[OWebFormValidator] a valid form element is required.");
        }
        let m = this;
        this.form = form;
        this.formData = new FormData(this.form);
        let fo = this.form.querySelectorAll("[data-oweb-form-v]"); // returns NodeList not Array of node (ex: in Firefox)
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
    /**
     * Returns the form element.
     */
    getForm() {
        return this.form;
    }
    /**
     * Returns the app context.
     */
    getAppContext() {
        return this.app_context;
    }
    /**
     * Gets app config.
     *
     * @param key
     */
    getConfig(key) {
        return this.getAppContext().configs.get(key);
    }
    /**
     * Returns a FormData containing the validated form fields.
     *
     * @param fields The fields name list. When empty all field will be added to the FormData.
     */
    getFormData(fields = []) {
        if (fields.length) {
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
    /**
     * Gets a given field name value.
     *
     * @param name
     */
    getField(name) {
        return this.formData.get(name);
    }
    /**
     * Sets a given field value.
     * @param name
     * @param value
     */
    setField(name, value) {
        this.formData.set(name, value);
        return this;
    }
    /**
     * Gets checkboxes like fields value.
     *
     * @param name
     */
    getAllFields(name) {
        return this.formData.getAll(name);
    }
    /**
     * Search for field description.
     *
     * We search the field label, placeholder or title.
     *
     * @param name
     */
    getFieldDescription(name) {
        let field = this.form.querySelector("[name='" + name + "']"), description = name;
        if (field) {
            let id = field.getAttribute("id"), label, placeholder, title;
            if (id && (label = this.form.querySelector("label[for='" + id + "']"))) {
                description = label.textContent;
            }
            else if ((placeholder = field.getAttribute("placeholder")) && placeholder.trim().length) {
                description = placeholder;
            }
            else if ((title = field.getAttribute("title")) && title.trim().length) {
                description = title;
            }
        }
        return description;
    }
    /**
     * Returns error map.
     */
    getErrors() {
        return this.errorMap;
    }
    /**
     * Runs form validation.
     */
    validate() {
        let context = this, c = -1, field_names = [], name;
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
                    let value = context.getField(name), validator_name = context.validatorsMap[name] || name, fn = formValidators[validator_name];
                    if (Utils.isNotEmpty(value)) {
                        if (Utils.isFunction(fn)) {
                            fn(value, name, context);
                        }
                        else {
                            console.warn("[OWebFormValidator] validator '%s' is not defined, field '%s' is then considered as safe.", validator_name, name);
                        }
                    }
                    else if (~context.required.indexOf(name)) {
                        this.assert(false, "OZ_FORM_CONTAINS_EMPTY_FIELD", { "label": context.getFieldDescription(name) });
                    }
                }
            }
            catch (e) {
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
                }
                else {
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
    assert(predicate, message, data) {
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
    /**
     * Adds fields validators.
     *
     * @param map The map of fields validators.
     */
    static addFieldValidators(map) {
        Utils.forEach(map, (fn, key) => {
            OWebFormValidator.addFieldValidator(key, fn);
        });
    }
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm1WYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm1WYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxlQUFlLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBS2xDLElBQUksY0FBYyxHQUFzQyxFQUFFLENBQUM7QUFFM0QsTUFBTSxvQkFBcUIsU0FBUSxlQUFlO0lBQWxEOztRQUNVLHNCQUFpQixHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDO0NBQUE7QUFFRCxNQUFNLENBQUMsT0FBTztJQUtiOzs7Ozs7T0FNRztJQUNILFlBQTZCLFdBQW9CLEVBQW1CLElBQXFCLEVBQW1CLFdBQTBCLEVBQUUsRUFBbUIsV0FBMEIsRUFBRSxFQUFtQixXQUFvQixLQUFLO1FBQXRNLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQW1CLFNBQUksR0FBSixJQUFJLENBQWlCO1FBQW1CLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBQW1CLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBQW1CLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBVjNOLGtCQUFhLEdBQThCLEVBQUUsQ0FBQztRQUM5QyxhQUFRLEdBQW1DLEVBQUUsQ0FBQztRQVVyRCxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssTUFBTSxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQztTQUN6RTtRQUVELElBQUksQ0FBQyxHQUFXLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFPLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxJQUFJLEVBQUUsR0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixD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LElBQUksQ0FBQyw4QkFBOEIsSUFBSSxrQ0FBa0MsQ0FBQyxDQUFDO1NBQ25GO1FBRUQsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFzQztRQUMvRCxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQWtCLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDdEQsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gXCIuL09XZWJBcHBcIjtcbmltcG9ydCBPV2ViQ3VzdG9tRXJyb3IgZnJvbSBcIi4vT1dlYkN1c3RvbUVycm9yXCI7XG5pbXBvcnQgVXRpbHMgZnJvbSBcIi4vdXRpbHMvVXRpbHNcIjtcblxudHlwZSB0Rm9ybUVycm9yTWFwID0geyBba2V5OiBzdHJpbmddOiBPV2ViRm9ybUVycm9yW10gfTtcbmV4cG9ydCB0eXBlIHRGb3JtVmFsaWRhdG9yID0gKHZhbHVlOiBhbnksIG5hbWU6IHN0cmluZywgY29udGV4dDogT1dlYkZvcm1WYWxpZGF0b3IpID0+IHZvaWQ7XG5cbmxldCBmb3JtVmFsaWRhdG9yczogeyBba2V5OiBzdHJpbmddOiB0Rm9ybVZhbGlkYXRvciB9ID0ge307XG5cbmV4cG9ydCBjbGFzcyBPV2ViRm9ybUVycm9yIGV4dGVuZHMgT1dlYkN1c3RvbUVycm9yIHtcblx0cmVhZG9ubHkgX19vd2ViX2Zvcm1fZXJyb3IgPSB0cnVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRm9ybVZhbGlkYXRvciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgZm9ybURhdGE6IEZvcm1EYXRhO1xuXHRwcml2YXRlIHZhbGlkYXRvcnNNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcblx0cHJpdmF0ZSBlcnJvck1hcDogdEZvcm1FcnJvck1hcCAgICAgICAgICAgICAgICAgID0ge307XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBhcHBfY29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBmb3JtIFRoZSBmb3JtIGVsZW1lbnQuXG5cdCAqIEBwYXJhbSByZXF1aXJlZCBUaGUgcmVxdWlyZWQgZmllbGRzLlxuXHQgKiBAcGFyYW0gZXhjbHVkZWQgVGhlIGZpZWxkcyB0byBleGNsdWRlIGZyb20gdmFsaWRhdGlvbi5cblx0ICogQHBhcmFtIGNoZWNrQWxsIFdoZW4gdHJ1ZSBhbGwgZmllbGRzIHdpbGwgYmUgdmFsaWRhdGVkLlxuXHQgKi9cblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCwgcHJpdmF0ZSByZWFkb25seSBmb3JtOiBIVE1MRm9ybUVsZW1lbnQsIHByaXZhdGUgcmVhZG9ubHkgcmVxdWlyZWQ6IEFycmF5PHN0cmluZz4gPSBbXSwgcHJpdmF0ZSByZWFkb25seSBleGNsdWRlZDogQXJyYXk8c3RyaW5nPiA9IFtdLCBwcml2YXRlIHJlYWRvbmx5IGNoZWNrQWxsOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHRpZiAoIWZvcm0gfHwgZm9ybS5ub2RlTmFtZSAhPT0gXCJGT1JNXCIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIltPV2ViRm9ybVZhbGlkYXRvcl0gYSB2YWxpZCBmb3JtIGVsZW1lbnQgaXMgcmVxdWlyZWQuXCIpO1xuXHRcdH1cblxuXHRcdGxldCBtICAgICAgICAgPSB0aGlzO1xuXHRcdHRoaXMuZm9ybSAgICAgPSBmb3JtO1xuXHRcdHRoaXMuZm9ybURhdGEgPSBuZXcgRm9ybURhdGEodGhpcy5mb3JtKTtcblx0XHRsZXQgZm8gICAgICAgID0gdGhpcy5mb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1vd2ViLWZvcm0tdl1cIik7Ly8gcmV0dXJucyBOb2RlTGlzdCBub3QgQXJyYXkgb2Ygbm9kZSAoZXg6IGluIEZpcmVmb3gpXG5cblx0XHQoVXRpbHMuaXNBcnJheShmbykgPyBmbyA6IFV0aWxzLnRvQXJyYXkoZm8pKS5mb3JFYWNoKChmaWVsZCkgPT4ge1xuXHRcdFx0bGV0IG5hbWUgICAgICAgICAgID0gZmllbGQuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSxcblx0XHRcdFx0dmFsaWRhdG9yX25hbWUgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoXCJkYXRhLW93ZWItZm9ybS12XCIpO1xuXG5cdFx0XHRpZiAobmFtZSkge1xuXHRcdFx0XHRpZiAoIWZvcm1WYWxpZGF0b3JzW3ZhbGlkYXRvcl9uYW1lXSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgW09XZWJGb3JtVmFsaWRhdG9yXSB2YWxpZGF0b3IgXCIke3ZhbGlkYXRvcl9uYW1lfVwiIGlzIGV4cGxpY2l0bHkgc2V0IGZvciBmaWVsZCBcIiR7bmFtZX1cIiBidXQgaXMgbm90IGRlZmluZWQuYCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRtLnZhbGlkYXRvcnNNYXBbbmFtZV0gPSB2YWxpZGF0b3JfbmFtZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmb3JtIGVsZW1lbnQuXG5cdCAqL1xuXHRnZXRGb3JtKCk6IEhUTUxGb3JtRWxlbWVudCB7XG5cdFx0cmV0dXJuIHRoaXMuZm9ybTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhcHAgY29udGV4dC5cblx0ICovXG5cdGdldEFwcENvbnRleHQoKTogT1dlYkFwcCB7XG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhcHAgY29uZmlnLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5XG5cdCAqL1xuXHRnZXRDb25maWcoa2V5OiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLmdldEFwcENvbnRleHQoKS5jb25maWdzLmdldChrZXkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBGb3JtRGF0YSBjb250YWluaW5nIHRoZSB2YWxpZGF0ZWQgZm9ybSBmaWVsZHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWVsZHMgVGhlIGZpZWxkcyBuYW1lIGxpc3QuIFdoZW4gZW1wdHkgYWxsIGZpZWxkIHdpbGwgYmUgYWRkZWQgdG8gdGhlIEZvcm1EYXRhLlxuXHQgKi9cblx0Z2V0Rm9ybURhdGEoZmllbGRzOiBBcnJheTxzdHJpbmc+ID0gW10pOiBGb3JtRGF0YSB7XG5cblx0XHRpZiAoZmllbGRzLmxlbmd0aCkge1xuXHRcdFx0bGV0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRsZXQgZmllbGQgID0gZmllbGRzW2ldO1xuXHRcdFx0XHRsZXQgdmFsdWVzID0gdGhpcy5nZXRBbGxGaWVsZHMoZmllbGQpOy8vZm9yIGNoZWNrYm94ZXMgYW5kIG90aGVyc1xuXHRcdFx0XHR2YWx1ZXMuZm9yRWFjaCgodmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChmaWVsZCwgdmFsdWUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZvcm1EYXRhO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBnaXZlbiBmaWVsZCBuYW1lIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZVxuXHQgKi9cblx0Z2V0RmllbGQobmFtZTogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5mb3JtRGF0YS5nZXQobmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhIGdpdmVuIGZpZWxkIHZhbHVlLlxuXHQgKiBAcGFyYW0gbmFtZVxuXHQgKiBAcGFyYW0gdmFsdWVcblx0ICovXG5cdHNldEZpZWxkKG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHRoaXMge1xuXHRcdHRoaXMuZm9ybURhdGEuc2V0KG5hbWUsIHZhbHVlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGNoZWNrYm94ZXMgbGlrZSBmaWVsZHMgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRBbGxGaWVsZHMobmFtZTogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5mb3JtRGF0YS5nZXRBbGwobmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogU2VhcmNoIGZvciBmaWVsZCBkZXNjcmlwdGlvbi5cblx0ICpcblx0ICogV2Ugc2VhcmNoIHRoZSBmaWVsZCBsYWJlbCwgcGxhY2Vob2xkZXIgb3IgdGl0bGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRGaWVsZERlc2NyaXB0aW9uKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0bGV0IGZpZWxkICAgICAgICAgICAgPSB0aGlzLmZvcm0ucXVlcnlTZWxlY3RvcihcIltuYW1lPSdcIiArIG5hbWUgKyBcIiddXCIpLFxuXHRcdFx0ZGVzY3JpcHRpb246IGFueSA9IG5hbWU7XG5cblx0XHRpZiAoZmllbGQpIHtcblx0XHRcdGxldCBpZCA9IGZpZWxkLmdldEF0dHJpYnV0ZShcImlkXCIpLCBsYWJlbCwgcGxhY2Vob2xkZXIsIHRpdGxlO1xuXHRcdFx0aWYgKGlkICYmIChsYWJlbCA9IHRoaXMuZm9ybS5xdWVyeVNlbGVjdG9yKFwibGFiZWxbZm9yPSdcIiArIGlkICsgXCInXVwiKSkpIHtcblx0XHRcdFx0ZGVzY3JpcHRpb24gPSBsYWJlbC50ZXh0Q29udGVudDtcblx0XHRcdH0gZWxzZSBpZiAoKHBsYWNlaG9sZGVyID0gZmllbGQuZ2V0QXR0cmlidXRlKFwicGxhY2Vob2xkZXJcIikpICYmIHBsYWNlaG9sZGVyLnRyaW0oKS5sZW5ndGgpIHtcblx0XHRcdFx0ZGVzY3JpcHRpb24gPSBwbGFjZWhvbGRlcjtcblx0XHRcdH0gZWxzZSBpZiAoKHRpdGxlID0gZmllbGQuZ2V0QXR0cmlidXRlKFwidGl0bGVcIikpICYmIHRpdGxlLnRyaW0oKS5sZW5ndGgpIHtcblx0XHRcdFx0ZGVzY3JpcHRpb24gPSB0aXRsZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZGVzY3JpcHRpb247XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBlcnJvciBtYXAuXG5cdCAqL1xuXHRnZXRFcnJvcnMoKTogdEZvcm1FcnJvck1hcCB7XG5cdFx0cmV0dXJuIHRoaXMuZXJyb3JNYXA7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBmb3JtIHZhbGlkYXRpb24uXG5cdCAqL1xuXHR2YWxpZGF0ZSgpOiBib29sZWFuIHtcblx0XHRsZXQgY29udGV4dCAgICAgICAgICAgICAgICAgICAgPSB0aGlzLFxuXHRcdFx0YyAgICAgICAgICAgICAgICAgICAgICAgICAgPSAtMSxcblx0XHRcdGZpZWxkX25hbWVzOiBBcnJheTxzdHJpbmc+ID0gW10sXG5cdFx0XHRuYW1lO1xuXG5cdFx0Ly8gZW1wdHkgZXJyb3IgbGlzdFxuXHRcdGNvbnRleHQuZXJyb3JNYXAgPSB7fTtcblxuXHRcdFV0aWxzLnRvQXJyYXkoY29udGV4dC5mb3JtLmVsZW1lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChpKSB7XG5cdFx0XHRpZiAoaS5uYW1lICE9PSB1bmRlZmluZWQgJiYgZmllbGRfbmFtZXMuaW5kZXhPZihpLm5hbWUpIDwgMCkge1xuXHRcdFx0XHRmaWVsZF9uYW1lcy5wdXNoKGkubmFtZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR3aGlsZSAoKG5hbWUgPSBmaWVsZF9uYW1lc1srK2NdKSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKGNvbnRleHQuZXhjbHVkZWQuaW5kZXhPZihuYW1lKSA8IDApIHtcblx0XHRcdFx0XHRsZXQgdmFsdWUgICAgICAgICAgPSBjb250ZXh0LmdldEZpZWxkKG5hbWUpLFxuXHRcdFx0XHRcdFx0dmFsaWRhdG9yX25hbWUgPSBjb250ZXh0LnZhbGlkYXRvcnNNYXBbbmFtZV0gfHwgbmFtZSxcblx0XHRcdFx0XHRcdGZuICAgICAgICAgICAgID0gZm9ybVZhbGlkYXRvcnNbdmFsaWRhdG9yX25hbWVdO1xuXG5cdFx0XHRcdFx0aWYgKFV0aWxzLmlzTm90RW1wdHkodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRpZiAoVXRpbHMuaXNGdW5jdGlvbihmbikpIHtcblx0XHRcdFx0XHRcdFx0Zm4odmFsdWUsIG5hbWUsIGNvbnRleHQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKFwiW09XZWJGb3JtVmFsaWRhdG9yXSB2YWxpZGF0b3IgJyVzJyBpcyBub3QgZGVmaW5lZCwgZmllbGQgJyVzJyBpcyB0aGVuIGNvbnNpZGVyZWQgYXMgc2FmZS5cIiwgdmFsaWRhdG9yX25hbWUsIG5hbWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAofmNvbnRleHQucmVxdWlyZWQuaW5kZXhPZihuYW1lKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5hc3NlcnQoZmFsc2UsIFwiT1pfRk9STV9DT05UQUlOU19FTVBUWV9GSUVMRFwiLCB7XCJsYWJlbFwiOiBjb250ZXh0LmdldEZpZWxkRGVzY3JpcHRpb24obmFtZSl9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0aWYgKGUuX19vd2ViX2Zvcm1fZXJyb3IpIHtcblxuXHRcdFx0XHRcdGlmICghdGhpcy5lcnJvck1hcFtuYW1lXSkge1xuXHRcdFx0XHRcdFx0dGhpcy5lcnJvck1hcFtuYW1lXSA9IFtdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRoaXMuZXJyb3JNYXBbbmFtZV0ucHVzaChlKTtcblxuXHRcdFx0XHRcdGlmICghdGhpcy5jaGVja0FsbCkge1xuXHRcdFx0XHRcdFx0dGhpcy5nZXRBcHBDb250ZXh0KCkudmlldy5kaWFsb2coe1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdFx0XHRcdHRleHQ6IGUubWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0ZGF0YTogZS5kYXRhXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IGVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmVycm9yTWFwKS5sZW5ndGggPT09IDA7XG5cdH1cblxuXHQvKipcblx0ICogTWFrZSBhbiBhc3NlcnRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJlZGljYXRlIFRoZSBhc3NlcnRpb24gcHJlZGljYXRlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZSB3aGVuIHRoZSBwcmVkaWNhdGUgaXMgZmFsc2UuXG5cdCAqIEBwYXJhbSBkYXRhIFRoZSBlcnJvciBkYXRhLlxuXHQgKi9cblx0YXNzZXJ0KHByZWRpY2F0ZTogYW55LCBtZXNzYWdlOiBzdHJpbmcsIGRhdGE/OiB7fSk6IHRoaXMge1xuXHRcdGlmICghcHJlZGljYXRlKSB7XG5cdFx0XHR0aHJvdyBuZXcgT1dlYkZvcm1FcnJvcihtZXNzYWdlLCBkYXRhKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgbmV3IHZhbGlkYXRvci5cblx0ICpcblx0ICogQHBhcmFtIG5hbWUgVGhlIHZhbGlkYXRvciBuYW1lLlxuXHQgKiBAcGFyYW0gdmFsaWRhdG9yIFRoZSB2YWxpZGF0b3IgZnVuY3Rpb24uXG5cdCAqL1xuXHRzdGF0aWMgYWRkRmllbGRWYWxpZGF0b3IobmFtZTogc3RyaW5nLCB2YWxpZGF0b3I6IHRGb3JtVmFsaWRhdG9yKTogdm9pZCB7XG5cblx0XHRpZiAoIVV0aWxzLmlzU3RyaW5nKG5hbWUpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiW09XZWJGb3JtVmFsaWRhdG9yXSBmaWVsZCBuYW1lIHNob3VsZCBiZSBhIHZhbGlkIHN0cmluZy5cIik7XG5cdFx0fVxuXG5cdFx0aWYgKCFVdGlscy5pc0Z1bmN0aW9uKHZhbGlkYXRvcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIHZhbGlkYXRvciBzaG91bGQgYmUgYSB2YWxpZCBmdW5jdGlvbi5cIik7XG5cdFx0fVxuXG5cdFx0aWYgKG5hbWUgaW4gdmFsaWRhdG9yKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFtPV2ViRm9ybVZhbGlkYXRvcl0gZmllbGQgXCIke25hbWV9XCIgdmFsaWRhdG9yIHdpbGwgYmUgb3ZlcndyaXR0ZW4uYCk7XG5cdFx0fVxuXG5cdFx0Zm9ybVZhbGlkYXRvcnNbbmFtZV0gPSB2YWxpZGF0b3I7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBmaWVsZHMgdmFsaWRhdG9ycy5cblx0ICpcblx0ICogQHBhcmFtIG1hcCBUaGUgbWFwIG9mIGZpZWxkcyB2YWxpZGF0b3JzLlxuXHQgKi9cblx0c3RhdGljIGFkZEZpZWxkVmFsaWRhdG9ycyhtYXA6IHsgW2tleTogc3RyaW5nXTogdEZvcm1WYWxpZGF0b3IgfSk6IHZvaWQge1xuXHRcdFV0aWxzLmZvckVhY2gobWFwLCAoZm46IHRGb3JtVmFsaWRhdG9yLCBrZXk6IHN0cmluZykgPT4ge1xuXHRcdFx0T1dlYkZvcm1WYWxpZGF0b3IuYWRkRmllbGRWYWxpZGF0b3Ioa2V5LCBmbik7XG5cdFx0fSk7XG5cdH1cbn07Il19