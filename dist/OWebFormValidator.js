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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm1WYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm1WYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxlQUFlLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBS2xDLElBQUksY0FBYyxHQUFzQyxFQUFFLENBQUM7QUFFM0QsTUFBTSxPQUFPLGFBQWMsU0FBUSxlQUFlO0lBQWxEOztRQUNVLHNCQUFpQixHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDO0NBQUE7QUFFRCxNQUFNLENBQUMsT0FBTyxPQUFPLGlCQUFpQjtJQUtyQzs7Ozs7O09BTUc7SUFDSCxZQUE2QixXQUFvQixFQUFtQixJQUFxQixFQUFtQixXQUEwQixFQUFFLEVBQW1CLFdBQTBCLEVBQUUsRUFBbUIsV0FBb0IsS0FBSztRQUF0TSxnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUFtQixTQUFJLEdBQUosSUFBSSxDQUFpQjtRQUFtQixhQUFRLEdBQVIsUUFBUSxDQUFvQjtRQUFtQixhQUFRLEdBQVIsUUFBUSxDQUFvQjtRQUFtQixhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQVYzTixrQkFBYSxHQUE4QixFQUFFLENBQUM7UUFDOUMsYUFBUSxHQUFtQyxFQUFFLENBQUM7UUFVckQsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRTtZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7U0FDekU7UUFFRCxJQUFJLENBQUMsR0FBVyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBTyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsSUFBSSxFQUFFLEdBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFB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O1lBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLElBQUksa0NBQWtDLENBQUMsQ0FBQztTQUNuRjtRQUVELGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDbEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBc0M7UUFDL0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFrQixFQUFFLEdBQVcsRUFBRSxFQUFFO1lBQ3RELGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRDtBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tIFwiLi9PV2ViQXBwXCI7XG5pbXBvcnQgT1dlYkN1c3RvbUVycm9yIGZyb20gXCIuL09XZWJDdXN0b21FcnJvclwiO1xuaW1wb3J0IFV0aWxzIGZyb20gXCIuL3V0aWxzL1V0aWxzXCI7XG5cbnR5cGUgdEZvcm1FcnJvck1hcCA9IHsgW2tleTogc3RyaW5nXTogT1dlYkZvcm1FcnJvcltdIH07XG5leHBvcnQgdHlwZSB0Rm9ybVZhbGlkYXRvciA9ICh2YWx1ZTogYW55LCBuYW1lOiBzdHJpbmcsIGNvbnRleHQ6IE9XZWJGb3JtVmFsaWRhdG9yKSA9PiB2b2lkO1xuXG5sZXQgZm9ybVZhbGlkYXRvcnM6IHsgW2tleTogc3RyaW5nXTogdEZvcm1WYWxpZGF0b3IgfSA9IHt9O1xuXG5leHBvcnQgY2xhc3MgT1dlYkZvcm1FcnJvciBleHRlbmRzIE9XZWJDdXN0b21FcnJvciB7XG5cdHJlYWRvbmx5IF9fb3dlYl9mb3JtX2Vycm9yID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkZvcm1WYWxpZGF0b3Ige1xuXHRwcml2YXRlIHJlYWRvbmx5IGZvcm1EYXRhOiBGb3JtRGF0YTtcblx0cHJpdmF0ZSB2YWxpZGF0b3JzTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG5cdHByaXZhdGUgZXJyb3JNYXA6IHRGb3JtRXJyb3JNYXAgICAgICAgICAgICAgICAgICA9IHt9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYXBwX2NvbnRleHQgVGhlIGFwcCBjb250ZXh0LlxuXHQgKiBAcGFyYW0gZm9ybSBUaGUgZm9ybSBlbGVtZW50LlxuXHQgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVkIGZpZWxkcy5cblx0ICogQHBhcmFtIGV4Y2x1ZGVkIFRoZSBmaWVsZHMgdG8gZXhjbHVkZSBmcm9tIHZhbGlkYXRpb24uXG5cdCAqIEBwYXJhbSBjaGVja0FsbCBXaGVuIHRydWUgYWxsIGZpZWxkcyB3aWxsIGJlIHZhbGlkYXRlZC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYXBwX2NvbnRleHQ6IE9XZWJBcHAsIHByaXZhdGUgcmVhZG9ubHkgZm9ybTogSFRNTEZvcm1FbGVtZW50LCBwcml2YXRlIHJlYWRvbmx5IHJlcXVpcmVkOiBBcnJheTxzdHJpbmc+ID0gW10sIHByaXZhdGUgcmVhZG9ubHkgZXhjbHVkZWQ6IEFycmF5PHN0cmluZz4gPSBbXSwgcHJpdmF0ZSByZWFkb25seSBjaGVja0FsbDogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0aWYgKCFmb3JtIHx8IGZvcm0ubm9kZU5hbWUgIT09IFwiRk9STVwiKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJbT1dlYkZvcm1WYWxpZGF0b3JdIGEgdmFsaWQgZm9ybSBlbGVtZW50IGlzIHJlcXVpcmVkLlwiKTtcblx0XHR9XG5cblx0XHRsZXQgbSAgICAgICAgID0gdGhpcztcblx0XHR0aGlzLmZvcm0gICAgID0gZm9ybTtcblx0XHR0aGlzLmZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKHRoaXMuZm9ybSk7XG5cdFx0bGV0IGZvICAgICAgICA9IHRoaXMuZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtb3dlYi1mb3JtLXZdXCIpOy8vIHJldHVybnMgTm9kZUxpc3Qgbm90IEFycmF5IG9mIG5vZGUgKGV4OiBpbiBGaXJlZm94KVxuXG5cdFx0KFV0aWxzLmlzQXJyYXkoZm8pID8gZm8gOiBVdGlscy50b0FycmF5KGZvKSkuZm9yRWFjaCgoZmllbGQpID0+IHtcblx0XHRcdGxldCBuYW1lICAgICAgICAgICA9IGZpZWxkLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG5cdFx0XHRcdHZhbGlkYXRvcl9uYW1lID0gZmllbGQuZ2V0QXR0cmlidXRlKFwiZGF0YS1vd2ViLWZvcm0tdlwiKTtcblxuXHRcdFx0aWYgKG5hbWUpIHtcblx0XHRcdFx0aWYgKCFmb3JtVmFsaWRhdG9yc1t2YWxpZGF0b3JfbmFtZV0pIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFtPV2ViRm9ybVZhbGlkYXRvcl0gdmFsaWRhdG9yIFwiJHt2YWxpZGF0b3JfbmFtZX1cIiBpcyBleHBsaWNpdGx5IHNldCBmb3IgZmllbGQgXCIke25hbWV9XCIgYnV0IGlzIG5vdCBkZWZpbmVkLmApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bS52YWxpZGF0b3JzTWFwW25hbWVdID0gdmFsaWRhdG9yX25hbWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZm9ybSBlbGVtZW50LlxuXHQgKi9cblx0Z2V0Rm9ybSgpOiBIVE1MRm9ybUVsZW1lbnQge1xuXHRcdHJldHVybiB0aGlzLmZvcm07XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYXBwIGNvbnRleHQuXG5cdCAqL1xuXHRnZXRBcHBDb250ZXh0KCk6IE9XZWJBcHAge1xuXHRcdHJldHVybiB0aGlzLmFwcF9jb250ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYXBwIGNvbmZpZy5cblx0ICpcblx0ICogQHBhcmFtIGtleVxuXHQgKi9cblx0Z2V0Q29uZmlnKGtleTogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5nZXRBcHBDb250ZXh0KCkuY29uZmlncy5nZXQoa2V5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgRm9ybURhdGEgY29udGFpbmluZyB0aGUgdmFsaWRhdGVkIGZvcm0gZmllbGRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmllbGRzIFRoZSBmaWVsZHMgbmFtZSBsaXN0LiBXaGVuIGVtcHR5IGFsbCBmaWVsZCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBGb3JtRGF0YS5cblx0ICovXG5cdGdldEZvcm1EYXRhKGZpZWxkczogQXJyYXk8c3RyaW5nPiA9IFtdKTogRm9ybURhdGEge1xuXG5cdFx0aWYgKGZpZWxkcy5sZW5ndGgpIHtcblx0XHRcdGxldCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBmaWVsZHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0bGV0IGZpZWxkICA9IGZpZWxkc1tpXTtcblx0XHRcdFx0bGV0IHZhbHVlcyA9IHRoaXMuZ2V0QWxsRmllbGRzKGZpZWxkKTsvL2ZvciBjaGVja2JveGVzIGFuZCBvdGhlcnNcblx0XHRcdFx0dmFsdWVzLmZvckVhY2goKHZhbHVlOiBhbnkpID0+IHtcblx0XHRcdFx0XHRmb3JtRGF0YS5hcHBlbmQoZmllbGQsIHZhbHVlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmb3JtRGF0YTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5mb3JtRGF0YTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgZ2l2ZW4gZmllbGQgbmFtZSB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIG5hbWVcblx0ICovXG5cdGdldEZpZWxkKG5hbWU6IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMuZm9ybURhdGEuZ2V0KG5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgYSBnaXZlbiBmaWVsZCB2YWx1ZS5cblx0ICogQHBhcmFtIG5hbWVcblx0ICogQHBhcmFtIHZhbHVlXG5cdCAqL1xuXHRzZXRGaWVsZChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB0aGlzIHtcblx0XHR0aGlzLmZvcm1EYXRhLnNldChuYW1lLCB2YWx1ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBjaGVja2JveGVzIGxpa2UgZmllbGRzIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZVxuXHQgKi9cblx0Z2V0QWxsRmllbGRzKG5hbWU6IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMuZm9ybURhdGEuZ2V0QWxsKG5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlYXJjaCBmb3IgZmllbGQgZGVzY3JpcHRpb24uXG5cdCAqXG5cdCAqIFdlIHNlYXJjaCB0aGUgZmllbGQgbGFiZWwsIHBsYWNlaG9sZGVyIG9yIHRpdGxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZVxuXHQgKi9cblx0Z2V0RmllbGREZXNjcmlwdGlvbihuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGxldCBmaWVsZCAgICAgICAgICAgID0gdGhpcy5mb3JtLnF1ZXJ5U2VsZWN0b3IoXCJbbmFtZT0nXCIgKyBuYW1lICsgXCInXVwiKSxcblx0XHRcdGRlc2NyaXB0aW9uOiBhbnkgPSBuYW1lO1xuXG5cdFx0aWYgKGZpZWxkKSB7XG5cdFx0XHRsZXQgaWQgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoXCJpZFwiKSwgbGFiZWwsIHBsYWNlaG9sZGVyLCB0aXRsZTtcblx0XHRcdGlmIChpZCAmJiAobGFiZWwgPSB0aGlzLmZvcm0ucXVlcnlTZWxlY3RvcihcImxhYmVsW2Zvcj0nXCIgKyBpZCArIFwiJ11cIikpKSB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uID0gbGFiZWwudGV4dENvbnRlbnQ7XG5cdFx0XHR9IGVsc2UgaWYgKChwbGFjZWhvbGRlciA9IGZpZWxkLmdldEF0dHJpYnV0ZShcInBsYWNlaG9sZGVyXCIpKSAmJiBwbGFjZWhvbGRlci50cmltKCkubGVuZ3RoKSB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uID0gcGxhY2Vob2xkZXI7XG5cdFx0XHR9IGVsc2UgaWYgKCh0aXRsZSA9IGZpZWxkLmdldEF0dHJpYnV0ZShcInRpdGxlXCIpKSAmJiB0aXRsZS50cmltKCkubGVuZ3RoKSB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uID0gdGl0bGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRlc2NyaXB0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgZXJyb3IgbWFwLlxuXHQgKi9cblx0Z2V0RXJyb3JzKCk6IHRGb3JtRXJyb3JNYXAge1xuXHRcdHJldHVybiB0aGlzLmVycm9yTWFwO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgZm9ybSB2YWxpZGF0aW9uLlxuXHQgKi9cblx0dmFsaWRhdGUoKTogYm9vbGVhbiB7XG5cdFx0bGV0IGNvbnRleHQgICAgICAgICAgICAgICAgICAgID0gdGhpcyxcblx0XHRcdGMgICAgICAgICAgICAgICAgICAgICAgICAgID0gLTEsXG5cdFx0XHRmaWVsZF9uYW1lczogQXJyYXk8c3RyaW5nPiA9IFtdLFxuXHRcdFx0bmFtZTtcblxuXHRcdC8vIGVtcHR5IGVycm9yIGxpc3Rcblx0XHRjb250ZXh0LmVycm9yTWFwID0ge307XG5cblx0XHRVdGlscy50b0FycmF5KGNvbnRleHQuZm9ybS5lbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuXHRcdFx0aWYgKGkubmFtZSAhPT0gdW5kZWZpbmVkICYmIGZpZWxkX25hbWVzLmluZGV4T2YoaS5uYW1lKSA8IDApIHtcblx0XHRcdFx0ZmllbGRfbmFtZXMucHVzaChpLm5hbWUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0d2hpbGUgKChuYW1lID0gZmllbGRfbmFtZXNbKytjXSkpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChjb250ZXh0LmV4Y2x1ZGVkLmluZGV4T2YobmFtZSkgPCAwKSB7XG5cdFx0XHRcdFx0bGV0IHZhbHVlICAgICAgICAgID0gY29udGV4dC5nZXRGaWVsZChuYW1lKSxcblx0XHRcdFx0XHRcdHZhbGlkYXRvcl9uYW1lID0gY29udGV4dC52YWxpZGF0b3JzTWFwW25hbWVdIHx8IG5hbWUsXG5cdFx0XHRcdFx0XHRmbiAgICAgICAgICAgICA9IGZvcm1WYWxpZGF0b3JzW3ZhbGlkYXRvcl9uYW1lXTtcblxuXHRcdFx0XHRcdGlmIChVdGlscy5pc05vdEVtcHR5KHZhbHVlKSkge1xuXHRcdFx0XHRcdFx0aWYgKFV0aWxzLmlzRnVuY3Rpb24oZm4pKSB7XG5cdFx0XHRcdFx0XHRcdGZuKHZhbHVlLCBuYW1lLCBjb250ZXh0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihcIltPV2ViRm9ybVZhbGlkYXRvcl0gdmFsaWRhdG9yICclcycgaXMgbm90IGRlZmluZWQsIGZpZWxkICclcycgaXMgdGhlbiBjb25zaWRlcmVkIGFzIHNhZmUuXCIsIHZhbGlkYXRvcl9uYW1lLCBuYW1lKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKH5jb250ZXh0LnJlcXVpcmVkLmluZGV4T2YobmFtZSkpIHtcblx0XHRcdFx0XHRcdHRoaXMuYXNzZXJ0KGZhbHNlLCBcIk9aX0ZPUk1fQ09OVEFJTlNfRU1QVFlfRklFTERcIiwge1wibGFiZWxcIjogY29udGV4dC5nZXRGaWVsZERlc2NyaXB0aW9uKG5hbWUpfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGlmIChlLl9fb3dlYl9mb3JtX2Vycm9yKSB7XG5cblx0XHRcdFx0XHRpZiAoIXRoaXMuZXJyb3JNYXBbbmFtZV0pIHtcblx0XHRcdFx0XHRcdHRoaXMuZXJyb3JNYXBbbmFtZV0gPSBbXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR0aGlzLmVycm9yTWFwW25hbWVdLnB1c2goZSk7XG5cblx0XHRcdFx0XHRpZiAoIXRoaXMuY2hlY2tBbGwpIHtcblx0XHRcdFx0XHRcdHRoaXMuZ2V0QXBwQ29udGV4dCgpLnZpZXcuZGlhbG9nKHtcblx0XHRcdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBlLm1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdGRhdGE6IGUuZGF0YVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5lcnJvck1hcCkubGVuZ3RoID09PSAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ha2UgYW4gYXNzZXJ0aW9ucy5cblx0ICpcblx0ICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgYXNzZXJ0aW9uIHByZWRpY2F0ZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2Ugd2hlbiB0aGUgcHJlZGljYXRlIGlzIGZhbHNlLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgZXJyb3IgZGF0YS5cblx0ICovXG5cdGFzc2VydChwcmVkaWNhdGU6IGFueSwgbWVzc2FnZTogc3RyaW5nLCBkYXRhPzoge30pOiB0aGlzIHtcblx0XHRpZiAoIXByZWRpY2F0ZSkge1xuXHRcdFx0dGhyb3cgbmV3IE9XZWJGb3JtRXJyb3IobWVzc2FnZSwgZGF0YSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIG5ldyB2YWxpZGF0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lIFRoZSB2YWxpZGF0b3IgbmFtZS5cblx0ICogQHBhcmFtIHZhbGlkYXRvciBUaGUgdmFsaWRhdG9yIGZ1bmN0aW9uLlxuXHQgKi9cblx0c3RhdGljIGFkZEZpZWxkVmFsaWRhdG9yKG5hbWU6IHN0cmluZywgdmFsaWRhdG9yOiB0Rm9ybVZhbGlkYXRvcik6IHZvaWQge1xuXG5cdFx0aWYgKCFVdGlscy5pc1N0cmluZyhuYW1lKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcIltPV2ViRm9ybVZhbGlkYXRvcl0gZmllbGQgbmFtZSBzaG91bGQgYmUgYSB2YWxpZCBzdHJpbmcuXCIpO1xuXHRcdH1cblxuXHRcdGlmICghVXRpbHMuaXNGdW5jdGlvbih2YWxpZGF0b3IpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiW09XZWJGb3JtVmFsaWRhdG9yXSBmaWVsZCB2YWxpZGF0b3Igc2hvdWxkIGJlIGEgdmFsaWQgZnVuY3Rpb24uXCIpO1xuXHRcdH1cblxuXHRcdGlmIChuYW1lIGluIHZhbGlkYXRvcikge1xuXHRcdFx0Y29uc29sZS53YXJuKGBbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIFwiJHtuYW1lfVwiIHZhbGlkYXRvciB3aWxsIGJlIG92ZXJ3cml0dGVuLmApO1xuXHRcdH1cblxuXHRcdGZvcm1WYWxpZGF0b3JzW25hbWVdID0gdmFsaWRhdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgZmllbGRzIHZhbGlkYXRvcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBtYXAgVGhlIG1hcCBvZiBmaWVsZHMgdmFsaWRhdG9ycy5cblx0ICovXG5cdHN0YXRpYyBhZGRGaWVsZFZhbGlkYXRvcnMobWFwOiB7IFtrZXk6IHN0cmluZ106IHRGb3JtVmFsaWRhdG9yIH0pOiB2b2lkIHtcblx0XHRVdGlscy5mb3JFYWNoKG1hcCwgKGZuOiB0Rm9ybVZhbGlkYXRvciwga2V5OiBzdHJpbmcpID0+IHtcblx0XHRcdE9XZWJGb3JtVmFsaWRhdG9yLmFkZEZpZWxkVmFsaWRhdG9yKGtleSwgZm4pO1xuXHRcdH0pO1xuXHR9XG59OyJdfQ==