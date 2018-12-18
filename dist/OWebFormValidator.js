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
    getForm() {
        return this.form;
    }
    getAppContext() {
        return this.app_context;
    }
    getConfig(key) {
        return this.getAppContext().configs.get(key);
    }
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
    getErrors() {
        return this.errorMap;
    }
    validate() {
        let context = this, c = -1, field_names = [], name;
        // empty error list
        context.errorMap = {};
        Utils.toArray(context.form.elements).forEach(function (i) {
            if (i.name !== undefined && field_names.indexOf(i.name) < 0) {
                field_names.push(i.name);
            }
        });
        while (name = field_names[++c]) {
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
    assert(assertion, message, data) {
        if (!assertion) {
            throw new OWebFormError(message, data);
        }
        return this;
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
        Utils.forEach(map, (fn, key) => {
            OWebFormValidator.addFieldValidator(key, fn);
        });
    }
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm1WYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm1WYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxlQUFlLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBS2xDLElBQUksY0FBYyxHQUFzQyxFQUFFLENBQUM7QUFFM0QsTUFBTSxvQkFBcUIsU0FBUSxlQUFlO0lBQWxEOztRQUNVLHNCQUFpQixHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDO0NBQUE7QUFFRCxNQUFNLENBQUMsT0FBTztJQUtiLFlBQTZCLFdBQW9CLEVBQW1CLElBQXFCLEVBQW1CLFdBQTBCLEVBQUUsRUFBbUIsV0FBMEIsRUFBRSxFQUFtQixXQUFvQixLQUFLO1FBQXRNLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQW1CLFNBQUksR0FBSixJQUFJLENBQWlCO1FBQW1CLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBQW1CLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBQW1CLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBSDNOLGtCQUFhLEdBQThCLEVBQUUsQ0FBQztRQUM5QyxhQUFRLEdBQW1DLEVBQUUsQ0FBQztRQUdyRCxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssTUFBTSxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQztTQUN6RTtRQUVELElBQUksQ0FBQyxHQUFXLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFPLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxJQUFJLEVBQUUsR0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQSxx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LENBQUMsRUFBa0IsRUFBRSxHQUFXLEVBQUUsRUFBRTtZQUN0RCxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0Q7QUFBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSBcIi4vT1dlYkFwcFwiO1xuaW1wb3J0IE9XZWJDdXN0b21FcnJvciBmcm9tIFwiLi9PV2ViQ3VzdG9tRXJyb3JcIjtcbmltcG9ydCBVdGlscyBmcm9tIFwiLi91dGlscy9VdGlsc1wiO1xuXG50eXBlIHRGb3JtRXJyb3JNYXAgPSB7IFtrZXk6IHN0cmluZ106IE9XZWJGb3JtRXJyb3JbXSB9O1xuZXhwb3J0IHR5cGUgdEZvcm1WYWxpZGF0b3IgPSAodmFsdWU6IGFueSwgbmFtZTogc3RyaW5nLCBjb250ZXh0OiBPV2ViRm9ybVZhbGlkYXRvcikgPT4gdm9pZDtcblxubGV0IGZvcm1WYWxpZGF0b3JzOiB7IFtrZXk6IHN0cmluZ106IHRGb3JtVmFsaWRhdG9yIH0gPSB7fTtcblxuZXhwb3J0IGNsYXNzIE9XZWJGb3JtRXJyb3IgZXh0ZW5kcyBPV2ViQ3VzdG9tRXJyb3Ige1xuXHRyZWFkb25seSBfX293ZWJfZm9ybV9lcnJvciA9IHRydWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJGb3JtVmFsaWRhdG9yIHtcblx0cHJpdmF0ZSByZWFkb25seSBmb3JtRGF0YTogRm9ybURhdGE7XG5cdHByaXZhdGUgdmFsaWRhdG9yc01hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuXHRwcml2YXRlIGVycm9yTWFwOiB0Rm9ybUVycm9yTWFwICAgICAgICAgICAgICAgICAgPSB7fTtcblxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGFwcF9jb250ZXh0OiBPV2ViQXBwLCBwcml2YXRlIHJlYWRvbmx5IGZvcm06IEhUTUxGb3JtRWxlbWVudCwgcHJpdmF0ZSByZWFkb25seSByZXF1aXJlZDogQXJyYXk8c3RyaW5nPiA9IFtdLCBwcml2YXRlIHJlYWRvbmx5IGV4Y2x1ZGVkOiBBcnJheTxzdHJpbmc+ID0gW10sIHByaXZhdGUgcmVhZG9ubHkgY2hlY2tBbGw6IGJvb2xlYW4gPSBmYWxzZSkge1xuXHRcdGlmICghZm9ybSB8fCBmb3JtLm5vZGVOYW1lICE9PSBcIkZPUk1cIikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiW09XZWJGb3JtVmFsaWRhdG9yXSBhIHZhbGlkIGZvcm0gZWxlbWVudCBpcyByZXF1aXJlZC5cIik7XG5cdFx0fVxuXG5cdFx0bGV0IG0gICAgICAgICA9IHRoaXM7XG5cdFx0dGhpcy5mb3JtICAgICA9IGZvcm07XG5cdFx0dGhpcy5mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSh0aGlzLmZvcm0pO1xuXHRcdGxldCBmbyAgICAgICAgPSB0aGlzLmZvcm0ucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLW93ZWItZm9ybS12XVwiKTsvLyByZXR1cm4gTm9kZUxpc3Qgbm90IEFycmF5IG9mIG5vZGUgKGV4OiBpbiBGaXJlZm94KVxuXG5cdFx0KFV0aWxzLmlzQXJyYXkoZm8pID8gZm8gOiBVdGlscy50b0FycmF5KGZvKSkuZm9yRWFjaCgoZmllbGQpID0+IHtcblx0XHRcdGxldCBuYW1lICAgICAgICAgICA9IGZpZWxkLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG5cdFx0XHRcdHZhbGlkYXRvcl9uYW1lID0gZmllbGQuZ2V0QXR0cmlidXRlKFwiZGF0YS1vd2ViLWZvcm0tdlwiKTtcblxuXHRcdFx0aWYgKG5hbWUpIHtcblx0XHRcdFx0aWYgKCFmb3JtVmFsaWRhdG9yc1t2YWxpZGF0b3JfbmFtZV0pIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFtPV2ViRm9ybVZhbGlkYXRvcl0gdmFsaWRhdG9yIFwiJHt2YWxpZGF0b3JfbmFtZX1cIiBpcyBleHBsaWNpdGx5IHNldCBmb3IgZmllbGQgXCIke25hbWV9XCIgYnV0IGlzIG5vdCBkZWZpbmVkLmApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bS52YWxpZGF0b3JzTWFwW25hbWVdID0gdmFsaWRhdG9yX25hbWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRnZXRGb3JtKCk6IEhUTUxGb3JtRWxlbWVudCB7XG5cdFx0cmV0dXJuIHRoaXMuZm9ybTtcblx0fVxuXG5cdGdldEFwcENvbnRleHQoKTogT1dlYkFwcCB7XG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQ7XG5cdH1cblxuXHRnZXRDb25maWcoa2V5OiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLmdldEFwcENvbnRleHQoKS5jb25maWdzLmdldChrZXkpO1xuXHR9XG5cblx0Z2V0Rm9ybURhdGEoZmllbGRzOiBBcnJheTxzdHJpbmc+ID0gW10pOiBGb3JtRGF0YSB7XG5cblx0XHRpZiAoZmllbGRzLmxlbmd0aCkge1xuXHRcdFx0bGV0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRsZXQgZmllbGQgID0gZmllbGRzW2ldO1xuXHRcdFx0XHRsZXQgdmFsdWVzID0gdGhpcy5nZXRBbGxGaWVsZHMoZmllbGQpOy8vZm9yIGNoZWNrYm94ZXMgYW5kIG90aGVyc1xuXHRcdFx0XHR2YWx1ZXMuZm9yRWFjaCgodmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChmaWVsZCwgdmFsdWUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZvcm1EYXRhO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhO1xuXHR9XG5cblx0Z2V0RmllbGQobmFtZTogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5mb3JtRGF0YS5nZXQobmFtZSk7XG5cdH1cblxuXHRzZXRGaWVsZChuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB0aGlzIHtcblx0XHR0aGlzLmZvcm1EYXRhLnNldChuYW1lLCB2YWx1ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvLyBmb3IgY2hlY2tib3hlcyBhbmQgb3RoZXJzXG5cdGdldEFsbEZpZWxkcyhuYW1lOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhLmdldEFsbChuYW1lKTtcblx0fVxuXG5cdGdldEZpZWxkRGVzY3JpcHRpb24obmFtZTogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRsZXQgZmllbGQgICAgICAgICAgICA9IHRoaXMuZm9ybS5xdWVyeVNlbGVjdG9yKFwiW25hbWU9J1wiICsgbmFtZSArIFwiJ11cIiksXG5cdFx0XHRkZXNjcmlwdGlvbjogYW55ID0gbmFtZTtcblxuXHRcdGlmIChmaWVsZCkge1xuXHRcdFx0bGV0IGlkID0gZmllbGQuZ2V0QXR0cmlidXRlKFwiaWRcIiksIGxhYmVsLCBwbGFjZWhvbGRlciwgdGl0bGU7XG5cdFx0XHRpZiAoaWQgJiYgKGxhYmVsID0gdGhpcy5mb3JtLnF1ZXJ5U2VsZWN0b3IoXCJsYWJlbFtmb3I9J1wiICsgaWQgKyBcIiddXCIpKSkge1xuXHRcdFx0XHRkZXNjcmlwdGlvbiA9IGxhYmVsLnRleHRDb250ZW50O1xuXHRcdFx0fSBlbHNlIGlmICgocGxhY2Vob2xkZXIgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoXCJwbGFjZWhvbGRlclwiKSkgJiYgcGxhY2Vob2xkZXIudHJpbSgpLmxlbmd0aCkge1xuXHRcdFx0XHRkZXNjcmlwdGlvbiA9IHBsYWNlaG9sZGVyO1xuXHRcdFx0fSBlbHNlIGlmICgodGl0bGUgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiKSkgJiYgdGl0bGUudHJpbSgpLmxlbmd0aCkge1xuXHRcdFx0XHRkZXNjcmlwdGlvbiA9IHRpdGxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBkZXNjcmlwdGlvbjtcblx0fVxuXG5cdGdldEVycm9ycygpOiB0Rm9ybUVycm9yTWFwIHtcblx0XHRyZXR1cm4gdGhpcy5lcnJvck1hcDtcblx0fVxuXG5cdHZhbGlkYXRlKCk6IGJvb2xlYW4ge1xuXHRcdGxldCBjb250ZXh0ICAgICAgICAgICAgICAgICAgICA9IHRoaXMsXG5cdFx0XHRjICAgICAgICAgICAgICAgICAgICAgICAgICA9IC0xLFxuXHRcdFx0ZmllbGRfbmFtZXM6IEFycmF5PHN0cmluZz4gPSBbXSxcblx0XHRcdG5hbWU7XG5cblx0XHQvLyBlbXB0eSBlcnJvciBsaXN0XG5cdFx0Y29udGV4dC5lcnJvck1hcCA9IHt9O1xuXG5cdFx0VXRpbHMudG9BcnJheShjb250ZXh0LmZvcm0uZWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGkpIHtcblx0XHRcdGlmIChpLm5hbWUgIT09IHVuZGVmaW5lZCAmJiBmaWVsZF9uYW1lcy5pbmRleE9mKGkubmFtZSkgPCAwKSB7XG5cdFx0XHRcdGZpZWxkX25hbWVzLnB1c2goaS5uYW1lKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHdoaWxlIChuYW1lID0gZmllbGRfbmFtZXNbKytjXSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKGNvbnRleHQuZXhjbHVkZWQuaW5kZXhPZihuYW1lKSA8IDApIHtcblx0XHRcdFx0XHRsZXQgdmFsdWUgICAgICAgICAgPSBjb250ZXh0LmdldEZpZWxkKG5hbWUpLFxuXHRcdFx0XHRcdFx0dmFsaWRhdG9yX25hbWUgPSBjb250ZXh0LnZhbGlkYXRvcnNNYXBbbmFtZV0gfHwgbmFtZSxcblx0XHRcdFx0XHRcdGZuICAgICAgICAgICAgID0gZm9ybVZhbGlkYXRvcnNbdmFsaWRhdG9yX25hbWVdO1xuXG5cdFx0XHRcdFx0aWYgKFV0aWxzLmlzTm90RW1wdHkodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRpZiAoVXRpbHMuaXNGdW5jdGlvbihmbikpIHtcblx0XHRcdFx0XHRcdFx0Zm4odmFsdWUsIG5hbWUsIGNvbnRleHQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS53YXJuKFwiW09XZWJGb3JtVmFsaWRhdG9yXSB2YWxpZGF0b3IgJyVzJyBpcyBub3QgZGVmaW5lZCwgZmllbGQgJyVzJyBpcyB0aGVuIGNvbnNpZGVyZWQgYXMgc2FmZS5cIiwgdmFsaWRhdG9yX25hbWUsIG5hbWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAofmNvbnRleHQucmVxdWlyZWQuaW5kZXhPZihuYW1lKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5hc3NlcnQoZmFsc2UsIFwiT1pfRk9STV9DT05UQUlOU19FTVBUWV9GSUVMRFwiLCB7XCJsYWJlbFwiOiBjb250ZXh0LmdldEZpZWxkRGVzY3JpcHRpb24obmFtZSl9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0aWYgKGUuX19vd2ViX2Zvcm1fZXJyb3IpIHtcblxuXHRcdFx0XHRcdGlmICghdGhpcy5lcnJvck1hcFtuYW1lXSkge1xuXHRcdFx0XHRcdFx0dGhpcy5lcnJvck1hcFtuYW1lXSA9IFtdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRoaXMuZXJyb3JNYXBbbmFtZV0ucHVzaChlKTtcblxuXHRcdFx0XHRcdGlmICghdGhpcy5jaGVja0FsbCkge1xuXHRcdFx0XHRcdFx0dGhpcy5nZXRBcHBDb250ZXh0KCkudmlldy5kaWFsb2coe1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdFx0XHRcdHRleHQ6IGUubWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0ZGF0YTogZS5kYXRhXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IGVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmVycm9yTWFwKS5sZW5ndGggPT09IDA7XG5cdH1cblxuXHRhc3NlcnQoYXNzZXJ0aW9uOiBhbnksIG1lc3NhZ2U6IHN0cmluZywgZGF0YT86IHt9KTogdGhpcyB7XG5cdFx0aWYgKCFhc3NlcnRpb24pIHtcblx0XHRcdHRocm93IG5ldyBPV2ViRm9ybUVycm9yKG1lc3NhZ2UsIGRhdGEpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0c3RhdGljIGFkZEZpZWxkVmFsaWRhdG9yKG5hbWU6IHN0cmluZywgdmFsaWRhdG9yOiB0Rm9ybVZhbGlkYXRvcik6IHZvaWQge1xuXG5cdFx0aWYgKCFVdGlscy5pc1N0cmluZyhuYW1lKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcIltPV2ViRm9ybVZhbGlkYXRvcl0gZmllbGQgbmFtZSBzaG91bGQgYmUgYSB2YWxpZCBzdHJpbmcuXCIpO1xuXHRcdH1cblxuXHRcdGlmICghVXRpbHMuaXNGdW5jdGlvbih2YWxpZGF0b3IpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiW09XZWJGb3JtVmFsaWRhdG9yXSBmaWVsZCB2YWxpZGF0b3Igc2hvdWxkIGJlIGEgdmFsaWQgZnVuY3Rpb24uXCIpO1xuXHRcdH1cblxuXHRcdGlmIChuYW1lIGluIHZhbGlkYXRvcikge1xuXHRcdFx0Y29uc29sZS53YXJuKGBbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIFwiJHtuYW1lfVwiIHZhbGlkYXRvciB3aWxsIGJlIG92ZXJ3cml0dGVuLmApO1xuXHRcdH1cblxuXHRcdGZvcm1WYWxpZGF0b3JzW25hbWVdID0gdmFsaWRhdG9yO1xuXHR9XG5cblx0c3RhdGljIGFkZEZpZWxkVmFsaWRhdG9ycyhtYXA6IHsgW2tleTogc3RyaW5nXTogdEZvcm1WYWxpZGF0b3IgfSk6IHZvaWQge1xuXHRcdFV0aWxzLmZvckVhY2gobWFwLCAoZm46IHRGb3JtVmFsaWRhdG9yLCBrZXk6IHN0cmluZykgPT4ge1xuXHRcdFx0T1dlYkZvcm1WYWxpZGF0b3IuYWRkRmllbGRWYWxpZGF0b3Ioa2V5LCBmbik7XG5cdFx0fSk7XG5cdH1cbn07Il19