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
     * Run form validation.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm1WYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm1WYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxlQUFlLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBS2xDLElBQUksY0FBYyxHQUFzQyxFQUFFLENBQUM7QUFFM0QsTUFBTSxvQkFBcUIsU0FBUSxlQUFlO0lBQWxEOztRQUNVLHNCQUFpQixHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDO0NBQUE7QUFFRCxNQUFNLENBQUMsT0FBTztJQUtiOzs7Ozs7T0FNRztJQUNILFlBQTZCLFdBQW9CLEVBQW1CLElBQXFCLEVBQW1CLFdBQTBCLEVBQUUsRUFBbUIsV0FBMEIsRUFBRSxFQUFtQixXQUFvQixLQUFLO1FBQXRNLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQW1CLFNBQUksR0FBSixJQUFJLENBQWlCO1FBQW1CLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBQW1CLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBQW1CLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBVjNOLGtCQUFhLEdBQThCLEVBQUUsQ0FBQztRQUM5QyxhQUFRLEdBQW1DLEVBQUUsQ0FBQztRQVVyRCxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssTUFBTSxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQztTQUN6RTtRQUVELElBQUksQ0FBQyxHQUFXLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFPLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxJQUFJLEVBQUUsR0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixD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LElBQUksQ0FBQyw4QkFBOEIsSUFBSSxrQ0FBa0MsQ0FBQyxDQUFDO1NBQ25GO1FBRUQsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFzQztRQUMvRCxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQWtCLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDdEQsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gXCIuL09XZWJBcHBcIjtcbmltcG9ydCBPV2ViQ3VzdG9tRXJyb3IgZnJvbSBcIi4vT1dlYkN1c3RvbUVycm9yXCI7XG5pbXBvcnQgVXRpbHMgZnJvbSBcIi4vdXRpbHMvVXRpbHNcIjtcblxudHlwZSB0Rm9ybUVycm9yTWFwID0geyBba2V5OiBzdHJpbmddOiBPV2ViRm9ybUVycm9yW10gfTtcbmV4cG9ydCB0eXBlIHRGb3JtVmFsaWRhdG9yID0gKHZhbHVlOiBhbnksIG5hbWU6IHN0cmluZywgY29udGV4dDogT1dlYkZvcm1WYWxpZGF0b3IpID0+IHZvaWQ7XG5cbmxldCBmb3JtVmFsaWRhdG9yczogeyBba2V5OiBzdHJpbmddOiB0Rm9ybVZhbGlkYXRvciB9ID0ge307XG5cbmV4cG9ydCBjbGFzcyBPV2ViRm9ybUVycm9yIGV4dGVuZHMgT1dlYkN1c3RvbUVycm9yIHtcblx0cmVhZG9ubHkgX19vd2ViX2Zvcm1fZXJyb3IgPSB0cnVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRm9ybVZhbGlkYXRvciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgZm9ybURhdGE6IEZvcm1EYXRhO1xuXHRwcml2YXRlIHZhbGlkYXRvcnNNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcblx0cHJpdmF0ZSBlcnJvck1hcDogdEZvcm1FcnJvck1hcCAgICAgICAgICAgICAgICAgID0ge307XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBhcHBfY29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBmb3JtIFRoZSBmb3JtIGVsZW1lbnQuXG5cdCAqIEBwYXJhbSByZXF1aXJlZCBUaGUgcmVxdWlyZWQgZmllbGRzLlxuXHQgKiBAcGFyYW0gZXhjbHVkZWQgVGhlIGZpZWxkcyB0byBleGNsdWRlIGZyb20gdmFsaWRhdGlvbi5cblx0ICogQHBhcmFtIGNoZWNrQWxsIFdoZW4gdHJ1ZSBhbGwgZmllbGRzIHdpbGwgYmUgdmFsaWRhdGVkLlxuXHQgKi9cblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCwgcHJpdmF0ZSByZWFkb25seSBmb3JtOiBIVE1MRm9ybUVsZW1lbnQsIHByaXZhdGUgcmVhZG9ubHkgcmVxdWlyZWQ6IEFycmF5PHN0cmluZz4gPSBbXSwgcHJpdmF0ZSByZWFkb25seSBleGNsdWRlZDogQXJyYXk8c3RyaW5nPiA9IFtdLCBwcml2YXRlIHJlYWRvbmx5IGNoZWNrQWxsOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHRpZiAoIWZvcm0gfHwgZm9ybS5ub2RlTmFtZSAhPT0gXCJGT1JNXCIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIltPV2ViRm9ybVZhbGlkYXRvcl0gYSB2YWxpZCBmb3JtIGVsZW1lbnQgaXMgcmVxdWlyZWQuXCIpO1xuXHRcdH1cblxuXHRcdGxldCBtICAgICAgICAgPSB0aGlzO1xuXHRcdHRoaXMuZm9ybSAgICAgPSBmb3JtO1xuXHRcdHRoaXMuZm9ybURhdGEgPSBuZXcgRm9ybURhdGEodGhpcy5mb3JtKTtcblx0XHRsZXQgZm8gICAgICAgID0gdGhpcy5mb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1vd2ViLWZvcm0tdl1cIik7Ly8gcmV0dXJuIE5vZGVMaXN0IG5vdCBBcnJheSBvZiBub2RlIChleDogaW4gRmlyZWZveClcblxuXHRcdChVdGlscy5pc0FycmF5KGZvKSA/IGZvIDogVXRpbHMudG9BcnJheShmbykpLmZvckVhY2goKGZpZWxkKSA9PiB7XG5cdFx0XHRsZXQgbmFtZSAgICAgICAgICAgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpLFxuXHRcdFx0XHR2YWxpZGF0b3JfbmFtZSA9IGZpZWxkLmdldEF0dHJpYnV0ZShcImRhdGEtb3dlYi1mb3JtLXZcIik7XG5cblx0XHRcdGlmIChuYW1lKSB7XG5cdFx0XHRcdGlmICghZm9ybVZhbGlkYXRvcnNbdmFsaWRhdG9yX25hbWVdKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBbT1dlYkZvcm1WYWxpZGF0b3JdIHZhbGlkYXRvciBcIiR7dmFsaWRhdG9yX25hbWV9XCIgaXMgZXhwbGljaXRseSBzZXQgZm9yIGZpZWxkIFwiJHtuYW1lfVwiIGJ1dCBpcyBub3QgZGVmaW5lZC5gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG0udmFsaWRhdG9yc01hcFtuYW1lXSA9IHZhbGlkYXRvcl9uYW1lO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGZvcm0gZWxlbWVudC5cblx0ICovXG5cdGdldEZvcm0oKTogSFRNTEZvcm1FbGVtZW50IHtcblx0XHRyZXR1cm4gdGhpcy5mb3JtO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFwcCBjb250ZXh0LlxuXHQgKi9cblx0Z2V0QXBwQ29udGV4dCgpOiBPV2ViQXBwIHtcblx0XHRyZXR1cm4gdGhpcy5hcHBfY29udGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFwcCBjb25maWcuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXlcblx0ICovXG5cdGdldENvbmZpZyhrZXk6IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXBwQ29udGV4dCgpLmNvbmZpZ3MuZ2V0KGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIEZvcm1EYXRhIGNvbnRhaW5pbmcgdGhlIHZhbGlkYXRlZCBmb3JtIGZpZWxkcy5cblx0ICpcblx0ICogQHBhcmFtIGZpZWxkcyBUaGUgZmllbGRzIG5hbWUgbGlzdC4gV2hlbiBlbXB0eSBhbGwgZmllbGQgd2lsbCBiZSBhZGRlZCB0byB0aGUgRm9ybURhdGEuXG5cdCAqL1xuXHRnZXRGb3JtRGF0YShmaWVsZHM6IEFycmF5PHN0cmluZz4gPSBbXSk6IEZvcm1EYXRhIHtcblxuXHRcdGlmIChmaWVsZHMubGVuZ3RoKSB7XG5cdFx0XHRsZXQgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZmllbGRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGxldCBmaWVsZCAgPSBmaWVsZHNbaV07XG5cdFx0XHRcdGxldCB2YWx1ZXMgPSB0aGlzLmdldEFsbEZpZWxkcyhmaWVsZCk7Ly9mb3IgY2hlY2tib3hlcyBhbmQgb3RoZXJzXG5cdFx0XHRcdHZhbHVlcy5mb3JFYWNoKCh2YWx1ZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGZpZWxkLCB2YWx1ZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZm9ybURhdGE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuZm9ybURhdGE7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIGdpdmVuIGZpZWxkIG5hbWUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRGaWVsZChuYW1lOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhLmdldChuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGEgZ2l2ZW4gZmllbGQgdmFsdWUuXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqIEBwYXJhbSB2YWx1ZVxuXHQgKi9cblx0c2V0RmllbGQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XG5cdFx0dGhpcy5mb3JtRGF0YS5zZXQobmFtZSwgdmFsdWUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgY2hlY2tib3hlcyBsaWtlIGZpZWxkcyB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIG5hbWVcblx0ICovXG5cdGdldEFsbEZpZWxkcyhuYW1lOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhLmdldEFsbChuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZWFyY2ggZm9yIGZpZWxkIGRlc2NyaXB0aW9uLlxuXHQgKlxuXHQgKiBXZSBzZWFyY2ggdGhlIGZpZWxkIGxhYmVsLCBwbGFjZWhvbGRlciBvciB0aXRsZS5cblx0ICpcblx0ICogQHBhcmFtIG5hbWVcblx0ICovXG5cdGdldEZpZWxkRGVzY3JpcHRpb24obmFtZTogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRsZXQgZmllbGQgICAgICAgICAgICA9IHRoaXMuZm9ybS5xdWVyeVNlbGVjdG9yKFwiW25hbWU9J1wiICsgbmFtZSArIFwiJ11cIiksXG5cdFx0XHRkZXNjcmlwdGlvbjogYW55ID0gbmFtZTtcblxuXHRcdGlmIChmaWVsZCkge1xuXHRcdFx0bGV0IGlkID0gZmllbGQuZ2V0QXR0cmlidXRlKFwiaWRcIiksIGxhYmVsLCBwbGFjZWhvbGRlciwgdGl0bGU7XG5cdFx0XHRpZiAoaWQgJiYgKGxhYmVsID0gdGhpcy5mb3JtLnF1ZXJ5U2VsZWN0b3IoXCJsYWJlbFtmb3I9J1wiICsgaWQgKyBcIiddXCIpKSkge1xuXHRcdFx0XHRkZXNjcmlwdGlvbiA9IGxhYmVsLnRleHRDb250ZW50O1xuXHRcdFx0fSBlbHNlIGlmICgocGxhY2Vob2xkZXIgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoXCJwbGFjZWhvbGRlclwiKSkgJiYgcGxhY2Vob2xkZXIudHJpbSgpLmxlbmd0aCkge1xuXHRcdFx0XHRkZXNjcmlwdGlvbiA9IHBsYWNlaG9sZGVyO1xuXHRcdFx0fSBlbHNlIGlmICgodGl0bGUgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiKSkgJiYgdGl0bGUudHJpbSgpLmxlbmd0aCkge1xuXHRcdFx0XHRkZXNjcmlwdGlvbiA9IHRpdGxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBkZXNjcmlwdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVycm9yIG1hcC5cblx0ICovXG5cdGdldEVycm9ycygpOiB0Rm9ybUVycm9yTWFwIHtcblx0XHRyZXR1cm4gdGhpcy5lcnJvck1hcDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW4gZm9ybSB2YWxpZGF0aW9uLlxuXHQgKi9cblx0dmFsaWRhdGUoKTogYm9vbGVhbiB7XG5cdFx0bGV0IGNvbnRleHQgICAgICAgICAgICAgICAgICAgID0gdGhpcyxcblx0XHRcdGMgICAgICAgICAgICAgICAgICAgICAgICAgID0gLTEsXG5cdFx0XHRmaWVsZF9uYW1lczogQXJyYXk8c3RyaW5nPiA9IFtdLFxuXHRcdFx0bmFtZTtcblxuXHRcdC8vIGVtcHR5IGVycm9yIGxpc3Rcblx0XHRjb250ZXh0LmVycm9yTWFwID0ge307XG5cblx0XHRVdGlscy50b0FycmF5KGNvbnRleHQuZm9ybS5lbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuXHRcdFx0aWYgKGkubmFtZSAhPT0gdW5kZWZpbmVkICYmIGZpZWxkX25hbWVzLmluZGV4T2YoaS5uYW1lKSA8IDApIHtcblx0XHRcdFx0ZmllbGRfbmFtZXMucHVzaChpLm5hbWUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0d2hpbGUgKChuYW1lID0gZmllbGRfbmFtZXNbKytjXSkpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChjb250ZXh0LmV4Y2x1ZGVkLmluZGV4T2YobmFtZSkgPCAwKSB7XG5cdFx0XHRcdFx0bGV0IHZhbHVlICAgICAgICAgID0gY29udGV4dC5nZXRGaWVsZChuYW1lKSxcblx0XHRcdFx0XHRcdHZhbGlkYXRvcl9uYW1lID0gY29udGV4dC52YWxpZGF0b3JzTWFwW25hbWVdIHx8IG5hbWUsXG5cdFx0XHRcdFx0XHRmbiAgICAgICAgICAgICA9IGZvcm1WYWxpZGF0b3JzW3ZhbGlkYXRvcl9uYW1lXTtcblxuXHRcdFx0XHRcdGlmIChVdGlscy5pc05vdEVtcHR5KHZhbHVlKSkge1xuXHRcdFx0XHRcdFx0aWYgKFV0aWxzLmlzRnVuY3Rpb24oZm4pKSB7XG5cdFx0XHRcdFx0XHRcdGZuKHZhbHVlLCBuYW1lLCBjb250ZXh0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihcIltPV2ViRm9ybVZhbGlkYXRvcl0gdmFsaWRhdG9yICclcycgaXMgbm90IGRlZmluZWQsIGZpZWxkICclcycgaXMgdGhlbiBjb25zaWRlcmVkIGFzIHNhZmUuXCIsIHZhbGlkYXRvcl9uYW1lLCBuYW1lKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKH5jb250ZXh0LnJlcXVpcmVkLmluZGV4T2YobmFtZSkpIHtcblx0XHRcdFx0XHRcdHRoaXMuYXNzZXJ0KGZhbHNlLCBcIk9aX0ZPUk1fQ09OVEFJTlNfRU1QVFlfRklFTERcIiwge1wibGFiZWxcIjogY29udGV4dC5nZXRGaWVsZERlc2NyaXB0aW9uKG5hbWUpfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGlmIChlLl9fb3dlYl9mb3JtX2Vycm9yKSB7XG5cblx0XHRcdFx0XHRpZiAoIXRoaXMuZXJyb3JNYXBbbmFtZV0pIHtcblx0XHRcdFx0XHRcdHRoaXMuZXJyb3JNYXBbbmFtZV0gPSBbXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR0aGlzLmVycm9yTWFwW25hbWVdLnB1c2goZSk7XG5cblx0XHRcdFx0XHRpZiAoIXRoaXMuY2hlY2tBbGwpIHtcblx0XHRcdFx0XHRcdHRoaXMuZ2V0QXBwQ29udGV4dCgpLnZpZXcuZGlhbG9nKHtcblx0XHRcdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBlLm1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdGRhdGE6IGUuZGF0YVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5lcnJvck1hcCkubGVuZ3RoID09PSAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ha2UgYW4gYXNzZXJ0aW9ucy5cblx0ICpcblx0ICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgYXNzZXJ0aW9uIHByZWRpY2F0ZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2Ugd2hlbiB0aGUgcHJlZGljYXRlIGlzIGZhbHNlLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgZXJyb3IgZGF0YS5cblx0ICovXG5cdGFzc2VydChwcmVkaWNhdGU6IGFueSwgbWVzc2FnZTogc3RyaW5nLCBkYXRhPzoge30pOiB0aGlzIHtcblx0XHRpZiAoIXByZWRpY2F0ZSkge1xuXHRcdFx0dGhyb3cgbmV3IE9XZWJGb3JtRXJyb3IobWVzc2FnZSwgZGF0YSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIG5ldyB2YWxpZGF0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lIFRoZSB2YWxpZGF0b3IgbmFtZS5cblx0ICogQHBhcmFtIHZhbGlkYXRvciBUaGUgdmFsaWRhdG9yIGZ1bmN0aW9uLlxuXHQgKi9cblx0c3RhdGljIGFkZEZpZWxkVmFsaWRhdG9yKG5hbWU6IHN0cmluZywgdmFsaWRhdG9yOiB0Rm9ybVZhbGlkYXRvcik6IHZvaWQge1xuXG5cdFx0aWYgKCFVdGlscy5pc1N0cmluZyhuYW1lKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcIltPV2ViRm9ybVZhbGlkYXRvcl0gZmllbGQgbmFtZSBzaG91bGQgYmUgYSB2YWxpZCBzdHJpbmcuXCIpO1xuXHRcdH1cblxuXHRcdGlmICghVXRpbHMuaXNGdW5jdGlvbih2YWxpZGF0b3IpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiW09XZWJGb3JtVmFsaWRhdG9yXSBmaWVsZCB2YWxpZGF0b3Igc2hvdWxkIGJlIGEgdmFsaWQgZnVuY3Rpb24uXCIpO1xuXHRcdH1cblxuXHRcdGlmIChuYW1lIGluIHZhbGlkYXRvcikge1xuXHRcdFx0Y29uc29sZS53YXJuKGBbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIFwiJHtuYW1lfVwiIHZhbGlkYXRvciB3aWxsIGJlIG92ZXJ3cml0dGVuLmApO1xuXHRcdH1cblxuXHRcdGZvcm1WYWxpZGF0b3JzW25hbWVdID0gdmFsaWRhdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgZmllbGRzIHZhbGlkYXRvcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBtYXAgVGhlIG1hcCBvZiBmaWVsZHMgdmFsaWRhdG9ycy5cblx0ICovXG5cdHN0YXRpYyBhZGRGaWVsZFZhbGlkYXRvcnMobWFwOiB7IFtrZXk6IHN0cmluZ106IHRGb3JtVmFsaWRhdG9yIH0pOiB2b2lkIHtcblx0XHRVdGlscy5mb3JFYWNoKG1hcCwgKGZuOiB0Rm9ybVZhbGlkYXRvciwga2V5OiBzdHJpbmcpID0+IHtcblx0XHRcdE9XZWJGb3JtVmFsaWRhdG9yLmFkZEZpZWxkVmFsaWRhdG9yKGtleSwgZm4pO1xuXHRcdH0pO1xuXHR9XG59OyJdfQ==