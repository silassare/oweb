import { forEach, isArray, isFunction, isNotEmpty, isString, logger, toArray, } from './utils';
import OWebFormError from './OWebFormError';
const formValidators = {};
export default class OWebFormValidator {
    /**
     * @param appContext The app context.
     * @param form The form element.
     * @param required The required fields.
     * @param excluded The fields to exclude from validation.
     * @param checkAll When true all fields will be validated.
     */
    constructor(appContext, form, required = [], excluded = [], checkAll = false) {
        this.appContext = appContext;
        this.form = form;
        this.required = required;
        this.excluded = excluded;
        this.checkAll = checkAll;
        this.validatorsMap = {};
        this.errorMap = {};
        if (!form || form.nodeName !== 'FORM') {
            throw new Error('[OWebFormValidator] a valid form element is required.');
        }
        const m = this;
        this.form = form;
        this.formData = new FormData(this.form);
        const fo = this.form.querySelectorAll('[data-oweb-form-v]'); // returns NodeList not Array of node (ex: in Firefox)
        (isArray(fo) ? fo : toArray(fo)).forEach((field) => {
            const name = field.getAttribute('name'), validatorName = field.getAttribute('data-oweb-form-v');
            if (name) {
                if (!formValidators[validatorName]) {
                    throw new Error(`[OWebFormValidator] validator "${validatorName}" is explicitly set for field "${name}" but is not defined.`);
                }
                m.validatorsMap[name] = validatorName;
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
        return this.appContext;
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
            const formData = new FormData();
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                const values = this.getAllFields(field); // for checkboxes and others
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
        const field = this.form.querySelector(`[name='${name}']`);
        let description = name;
        if (field) {
            const id = field.getAttribute('id');
            let label, placeholder, title;
            if (id &&
                // tslint:disable-next-line: no-conditional-assignment
                (label = this.form.querySelector(`label[for='${id}']`))) {
                description = label.textContent;
            }
            else if (
            // tslint:disable-next-line: no-conditional-assignment
            (placeholder = field.getAttribute('placeholder')) &&
                placeholder.trim().length) {
                description = placeholder;
            }
            else if (
            // tslint:disable-next-line: no-conditional-assignment
            (title = field.getAttribute('title')) &&
                title.trim().length) {
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
        const context = this, fieldNames = [];
        let c = -1, name;
        // empty error list
        context.errorMap = {};
        toArray(context.form.elements).forEach(function (i) {
            if (i.name !== undefined && fieldNames.indexOf(i.name) < 0) {
                fieldNames.push(i.name);
            }
        });
        // tslint:disable-next-line: no-conditional-assignment
        while ((name = fieldNames[++c])) {
            try {
                if (context.excluded.indexOf(name) < 0) {
                    const value = context.getField(name), validatorName = context.validatorsMap[name] || name, fn = formValidators[validatorName];
                    if (isNotEmpty(value)) {
                        if (isFunction(fn)) {
                            fn(value, name, context);
                        }
                        else {
                            logger.warn(`[OWebFormValidator] validator '${validatorName}' is not defined, field '${name}' is then considered as safe.`);
                        }
                    }
                    else if (~context.required.indexOf(name)) {
                        this.assert(false, 'OZ_FORM_CONTAINS_EMPTY_FIELD', {
                            label: context.getFieldDescription(name),
                        });
                    }
                }
            }
            catch (e) {
                if (e._owebFormError) {
                    if (!this.errorMap[name]) {
                        this.errorMap[name] = [];
                    }
                    this.errorMap[name].push(e);
                    if (!this.checkAll) {
                        this.getAppContext().view.dialog({
                            type: 'error',
                            text: e.message,
                            data: e.data,
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
        if (!isString(name)) {
            throw new TypeError('[OWebFormValidator] field name should be a valid string.');
        }
        if (!isFunction(validator)) {
            throw new TypeError('[OWebFormValidator] field validator should be a valid function.');
        }
        if (name in validator) {
            logger.warn(`[OWebFormValidator] field "${name}" validator will be overwritten.`);
        }
        formValidators[name] = validator;
    }
    /**
     * Adds fields validators.
     *
     * @param map The map of fields validators.
     */
    static addFieldValidators(map) {
        forEach(map, (fn, key) => {
            OWebFormValidator.addFieldValidator(key, fn);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm1WYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm1WYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUNOLE9BQU8sRUFDUCxPQUFPLEVBQ1AsVUFBVSxFQUNWLFVBQVUsRUFDVixRQUFRLEVBQ1IsTUFBTSxFQUNOLE9BQU8sR0FDUCxNQUFNLFNBQVMsQ0FBQztBQUNqQixPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQVM1QyxNQUFNLGNBQWMsR0FBc0MsRUFBRSxDQUFDO0FBRTdELE1BQU0sQ0FBQyxPQUFPLE9BQU8saUJBQWlCO0lBS3JDOzs7Ozs7T0FNRztJQUNILFlBQ2tCLFVBQW1CLEVBQ25CLElBQXFCLEVBQ3JCLFdBQXFCLEVBQUUsRUFDdkIsV0FBcUIsRUFBRSxFQUN2QixXQUFvQixLQUFLO1FBSnpCLGVBQVUsR0FBVixVQUFVLENBQVM7UUFDbkIsU0FBSSxHQUFKLElBQUksQ0FBaUI7UUFDckIsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUN2QixhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ3ZCLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBZm5DLGtCQUFhLEdBQThCLEVBQUUsQ0FBQztRQUM5QyxhQUFRLEdBQWtCLEVBQUUsQ0FBQztRQWdCcEMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRTtZQUN0QyxNQUFNLElBQUksS0FBSyxDQUNkLHVEQUF1RCxDQUN2RCxDQUFDO1NBQ0Y7UUFFRCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFv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LENBQUMsSUFBSSxDQUNWLDhCQUE4QixJQUFJLGtDQUFrQyxDQUNwRSxDQUFDO1NBQ0Y7UUFFRCxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEdBQXNDO1FBQy9ELE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFrQixFQUFFLEdBQVcsRUFBRSxFQUFFO1lBQ2hELGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XG5pbXBvcnQge1xuXHRmb3JFYWNoLFxuXHRpc0FycmF5LFxuXHRpc0Z1bmN0aW9uLFxuXHRpc05vdEVtcHR5LFxuXHRpc1N0cmluZyxcblx0bG9nZ2VyLFxuXHR0b0FycmF5LFxufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBPV2ViRm9ybUVycm9yIGZyb20gJy4vT1dlYkZvcm1FcnJvcic7XG5cbnR5cGUgdEZvcm1FcnJvck1hcCA9IHsgW2tleTogc3RyaW5nXTogT1dlYkZvcm1FcnJvcltdIH07XG5leHBvcnQgdHlwZSB0Rm9ybVZhbGlkYXRvciA9IChcblx0dmFsdWU6IGFueSxcblx0bmFtZTogc3RyaW5nLFxuXHRjb250ZXh0OiBPV2ViRm9ybVZhbGlkYXRvcixcbikgPT4gdm9pZDtcblxuY29uc3QgZm9ybVZhbGlkYXRvcnM6IHsgW2tleTogc3RyaW5nXTogdEZvcm1WYWxpZGF0b3IgfSA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRm9ybVZhbGlkYXRvciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgZm9ybURhdGE6IEZvcm1EYXRhO1xuXHRwcml2YXRlIHZhbGlkYXRvcnNNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcblx0cHJpdmF0ZSBlcnJvck1hcDogdEZvcm1FcnJvck1hcCA9IHt9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBmb3JtIFRoZSBmb3JtIGVsZW1lbnQuXG5cdCAqIEBwYXJhbSByZXF1aXJlZCBUaGUgcmVxdWlyZWQgZmllbGRzLlxuXHQgKiBAcGFyYW0gZXhjbHVkZWQgVGhlIGZpZWxkcyB0byBleGNsdWRlIGZyb20gdmFsaWRhdGlvbi5cblx0ICogQHBhcmFtIGNoZWNrQWxsIFdoZW4gdHJ1ZSBhbGwgZmllbGRzIHdpbGwgYmUgdmFsaWRhdGVkLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBhcHBDb250ZXh0OiBPV2ViQXBwLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZm9ybTogSFRNTEZvcm1FbGVtZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcmVxdWlyZWQ6IHN0cmluZ1tdID0gW10sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBleGNsdWRlZDogc3RyaW5nW10gPSBbXSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNoZWNrQWxsOiBib29sZWFuID0gZmFsc2UsXG5cdCkge1xuXHRcdGlmICghZm9ybSB8fCBmb3JtLm5vZGVOYW1lICE9PSAnRk9STScpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0J1tPV2ViRm9ybVZhbGlkYXRvcl0gYSB2YWxpZCBmb3JtIGVsZW1lbnQgaXMgcmVxdWlyZWQuJyxcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbSA9IHRoaXM7XG5cdFx0dGhpcy5mb3JtID0gZm9ybTtcblx0XHR0aGlzLmZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKHRoaXMuZm9ybSk7XG5cdFx0Y29uc3QgZm8gPSB0aGlzLmZvcm0ucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtb3dlYi1mb3JtLXZdJyk7IC8vIHJldHVybnMgTm9kZUxpc3Qgbm90IEFycmF5IG9mIG5vZGUgKGV4OiBpbiBGaXJlZm94KVxuXG5cdFx0KGlzQXJyYXkoZm8pID8gZm8gOiB0b0FycmF5KGZvKSkuZm9yRWFjaCgoZmllbGQpID0+IHtcblx0XHRcdGNvbnN0IG5hbWUgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcblx0XHRcdFx0dmFsaWRhdG9yTmFtZSA9IGZpZWxkLmdldEF0dHJpYnV0ZSgnZGF0YS1vd2ViLWZvcm0tdicpO1xuXG5cdFx0XHRpZiAobmFtZSkge1xuXHRcdFx0XHRpZiAoIWZvcm1WYWxpZGF0b3JzW3ZhbGlkYXRvck5hbWVdKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0YFtPV2ViRm9ybVZhbGlkYXRvcl0gdmFsaWRhdG9yIFwiJHt2YWxpZGF0b3JOYW1lfVwiIGlzIGV4cGxpY2l0bHkgc2V0IGZvciBmaWVsZCBcIiR7bmFtZX1cIiBidXQgaXMgbm90IGRlZmluZWQuYCxcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bS52YWxpZGF0b3JzTWFwW25hbWVdID0gdmFsaWRhdG9yTmFtZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmb3JtIGVsZW1lbnQuXG5cdCAqL1xuXHRnZXRGb3JtKCk6IEhUTUxGb3JtRWxlbWVudCB7XG5cdFx0cmV0dXJuIHRoaXMuZm9ybTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhcHAgY29udGV4dC5cblx0ICovXG5cdGdldEFwcENvbnRleHQoKTogT1dlYkFwcCB7XG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFwcCBjb25maWcuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXlcblx0ICovXG5cdGdldENvbmZpZyhrZXk6IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXBwQ29udGV4dCgpLmNvbmZpZ3MuZ2V0KGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIEZvcm1EYXRhIGNvbnRhaW5pbmcgdGhlIHZhbGlkYXRlZCBmb3JtIGZpZWxkcy5cblx0ICpcblx0ICogQHBhcmFtIGZpZWxkcyBUaGUgZmllbGRzIG5hbWUgbGlzdC4gV2hlbiBlbXB0eSBhbGwgZmllbGQgd2lsbCBiZSBhZGRlZCB0byB0aGUgRm9ybURhdGEuXG5cdCAqL1xuXHRnZXRGb3JtRGF0YShmaWVsZHM6IHN0cmluZ1tdID0gW10pOiBGb3JtRGF0YSB7XG5cdFx0aWYgKGZpZWxkcy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBmaWVsZCA9IGZpZWxkc1tpXTtcblx0XHRcdFx0Y29uc3QgdmFsdWVzID0gdGhpcy5nZXRBbGxGaWVsZHMoZmllbGQpOyAvLyBmb3IgY2hlY2tib3hlcyBhbmQgb3RoZXJzXG5cdFx0XHRcdHZhbHVlcy5mb3JFYWNoKCh2YWx1ZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGZpZWxkLCB2YWx1ZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZm9ybURhdGE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuZm9ybURhdGE7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIGdpdmVuIGZpZWxkIG5hbWUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRGaWVsZChuYW1lOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhLmdldChuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGEgZ2l2ZW4gZmllbGQgdmFsdWUuXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqIEBwYXJhbSB2YWx1ZVxuXHQgKi9cblx0c2V0RmllbGQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XG5cdFx0dGhpcy5mb3JtRGF0YS5zZXQobmFtZSwgdmFsdWUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgY2hlY2tib3hlcyBsaWtlIGZpZWxkcyB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIG5hbWVcblx0ICovXG5cdGdldEFsbEZpZWxkcyhuYW1lOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhLmdldEFsbChuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZWFyY2ggZm9yIGZpZWxkIGRlc2NyaXB0aW9uLlxuXHQgKlxuXHQgKiBXZSBzZWFyY2ggdGhlIGZpZWxkIGxhYmVsLCBwbGFjZWhvbGRlciBvciB0aXRsZS5cblx0ICpcblx0ICogQHBhcmFtIG5hbWVcblx0ICovXG5cdGdldEZpZWxkRGVzY3JpcHRpb24obmFtZTogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRjb25zdCBmaWVsZCA9IHRoaXMuZm9ybS5xdWVyeVNlbGVjdG9yKGBbbmFtZT0nJHtuYW1lfSddYCk7XG5cdFx0bGV0IGRlc2NyaXB0aW9uOiBhbnkgPSBuYW1lO1xuXG5cdFx0aWYgKGZpZWxkKSB7XG5cdFx0XHRjb25zdCBpZCA9IGZpZWxkLmdldEF0dHJpYnV0ZSgnaWQnKTtcblx0XHRcdGxldCBsYWJlbCwgcGxhY2Vob2xkZXIsIHRpdGxlO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRpZCAmJlxuXHRcdFx0XHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcblx0XHRcdFx0KGxhYmVsID0gdGhpcy5mb3JtLnF1ZXJ5U2VsZWN0b3IoYGxhYmVsW2Zvcj0nJHtpZH0nXWApKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uID0gbGFiZWwudGV4dENvbnRlbnQ7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcblx0XHRcdFx0KHBsYWNlaG9sZGVyID0gZmllbGQuZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpKSAmJlxuXHRcdFx0XHRwbGFjZWhvbGRlci50cmltKCkubGVuZ3RoXG5cdFx0XHQpIHtcblx0XHRcdFx0ZGVzY3JpcHRpb24gPSBwbGFjZWhvbGRlcjtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uZGl0aW9uYWwtYXNzaWdubWVudFxuXHRcdFx0XHQodGl0bGUgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykpICYmXG5cdFx0XHRcdHRpdGxlLnRyaW0oKS5sZW5ndGhcblx0XHRcdCkge1xuXHRcdFx0XHRkZXNjcmlwdGlvbiA9IHRpdGxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBkZXNjcmlwdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVycm9yIG1hcC5cblx0ICovXG5cdGdldEVycm9ycygpOiB0Rm9ybUVycm9yTWFwIHtcblx0XHRyZXR1cm4gdGhpcy5lcnJvck1hcDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGZvcm0gdmFsaWRhdGlvbi5cblx0ICovXG5cdHZhbGlkYXRlKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGNvbnRleHQgPSB0aGlzLFxuXHRcdFx0ZmllbGROYW1lczogc3RyaW5nW10gPSBbXTtcblx0XHRsZXQgYyA9IC0xLFxuXHRcdFx0bmFtZTtcblxuXHRcdC8vIGVtcHR5IGVycm9yIGxpc3Rcblx0XHRjb250ZXh0LmVycm9yTWFwID0ge307XG5cblx0XHR0b0FycmF5KGNvbnRleHQuZm9ybS5lbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuXHRcdFx0aWYgKGkubmFtZSAhPT0gdW5kZWZpbmVkICYmIGZpZWxkTmFtZXMuaW5kZXhPZihpLm5hbWUpIDwgMCkge1xuXHRcdFx0XHRmaWVsZE5hbWVzLnB1c2goaS5uYW1lKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uZGl0aW9uYWwtYXNzaWdubWVudFxuXHRcdHdoaWxlICgobmFtZSA9IGZpZWxkTmFtZXNbKytjXSkpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChjb250ZXh0LmV4Y2x1ZGVkLmluZGV4T2YobmFtZSkgPCAwKSB7XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBjb250ZXh0LmdldEZpZWxkKG5hbWUpLFxuXHRcdFx0XHRcdFx0dmFsaWRhdG9yTmFtZSA9IGNvbnRleHQudmFsaWRhdG9yc01hcFtuYW1lXSB8fCBuYW1lLFxuXHRcdFx0XHRcdFx0Zm4gPSBmb3JtVmFsaWRhdG9yc1t2YWxpZGF0b3JOYW1lXTtcblxuXHRcdFx0XHRcdGlmIChpc05vdEVtcHR5KHZhbHVlKSkge1xuXHRcdFx0XHRcdFx0aWYgKGlzRnVuY3Rpb24oZm4pKSB7XG5cdFx0XHRcdFx0XHRcdGZuKHZhbHVlLCBuYW1lLCBjb250ZXh0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGxvZ2dlci53YXJuKFxuXHRcdFx0XHRcdFx0XHRcdGBbT1dlYkZvcm1WYWxpZGF0b3JdIHZhbGlkYXRvciAnJHt2YWxpZGF0b3JOYW1lfScgaXMgbm90IGRlZmluZWQsIGZpZWxkICcke25hbWV9JyBpcyB0aGVuIGNvbnNpZGVyZWQgYXMgc2FmZS5gLFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAofmNvbnRleHQucmVxdWlyZWQuaW5kZXhPZihuYW1lKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5hc3NlcnQoZmFsc2UsICdPWl9GT1JNX0NPTlRBSU5TX0VNUFRZX0ZJRUxEJywge1xuXHRcdFx0XHRcdFx0XHRsYWJlbDogY29udGV4dC5nZXRGaWVsZERlc2NyaXB0aW9uKG5hbWUpLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGlmIChlLl9vd2ViRm9ybUVycm9yKSB7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLmVycm9yTWFwW25hbWVdKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVycm9yTWFwW25hbWVdID0gW107XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGhpcy5lcnJvck1hcFtuYW1lXS5wdXNoKGUpO1xuXG5cdFx0XHRcdFx0aWYgKCF0aGlzLmNoZWNrQWxsKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmdldEFwcENvbnRleHQoKS52aWV3LmRpYWxvZyh7XG5cdFx0XHRcdFx0XHRcdHR5cGU6ICdlcnJvcicsXG5cdFx0XHRcdFx0XHRcdHRleHQ6IGUubWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0ZGF0YTogZS5kYXRhLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmVycm9yTWFwKS5sZW5ndGggPT09IDA7XG5cdH1cblxuXHQvKipcblx0ICogTWFrZSBhbiBhc3NlcnRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJlZGljYXRlIFRoZSBhc3NlcnRpb24gcHJlZGljYXRlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZSB3aGVuIHRoZSBwcmVkaWNhdGUgaXMgZmFsc2UuXG5cdCAqIEBwYXJhbSBkYXRhIFRoZSBlcnJvciBkYXRhLlxuXHQgKi9cblx0YXNzZXJ0KHByZWRpY2F0ZTogYW55LCBtZXNzYWdlOiBzdHJpbmcsIGRhdGE/OiB7fSk6IHRoaXMge1xuXHRcdGlmICghcHJlZGljYXRlKSB7XG5cdFx0XHR0aHJvdyBuZXcgT1dlYkZvcm1FcnJvcihtZXNzYWdlLCBkYXRhKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgbmV3IHZhbGlkYXRvci5cblx0ICpcblx0ICogQHBhcmFtIG5hbWUgVGhlIHZhbGlkYXRvciBuYW1lLlxuXHQgKiBAcGFyYW0gdmFsaWRhdG9yIFRoZSB2YWxpZGF0b3IgZnVuY3Rpb24uXG5cdCAqL1xuXHRzdGF0aWMgYWRkRmllbGRWYWxpZGF0b3IobmFtZTogc3RyaW5nLCB2YWxpZGF0b3I6IHRGb3JtVmFsaWRhdG9yKTogdm9pZCB7XG5cdFx0aWYgKCFpc1N0cmluZyhuYW1lKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdFx0J1tPV2ViRm9ybVZhbGlkYXRvcl0gZmllbGQgbmFtZSBzaG91bGQgYmUgYSB2YWxpZCBzdHJpbmcuJyxcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKCFpc0Z1bmN0aW9uKHZhbGlkYXRvcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdCdbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIHZhbGlkYXRvciBzaG91bGQgYmUgYSB2YWxpZCBmdW5jdGlvbi4nLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRpZiAobmFtZSBpbiB2YWxpZGF0b3IpIHtcblx0XHRcdGxvZ2dlci53YXJuKFxuXHRcdFx0XHRgW09XZWJGb3JtVmFsaWRhdG9yXSBmaWVsZCBcIiR7bmFtZX1cIiB2YWxpZGF0b3Igd2lsbCBiZSBvdmVyd3JpdHRlbi5gLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRmb3JtVmFsaWRhdG9yc1tuYW1lXSA9IHZhbGlkYXRvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGZpZWxkcyB2YWxpZGF0b3JzLlxuXHQgKlxuXHQgKiBAcGFyYW0gbWFwIFRoZSBtYXAgb2YgZmllbGRzIHZhbGlkYXRvcnMuXG5cdCAqL1xuXHRzdGF0aWMgYWRkRmllbGRWYWxpZGF0b3JzKG1hcDogeyBba2V5OiBzdHJpbmddOiB0Rm9ybVZhbGlkYXRvciB9KTogdm9pZCB7XG5cdFx0Zm9yRWFjaChtYXAsIChmbjogdEZvcm1WYWxpZGF0b3IsIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRPV2ViRm9ybVZhbGlkYXRvci5hZGRGaWVsZFZhbGlkYXRvcihrZXksIGZuKTtcblx0XHR9KTtcblx0fVxufVxuIl19