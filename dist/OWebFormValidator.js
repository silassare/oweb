import { forEach, isArray, isFunction, isNotEmpty, isString, logger, toArray, } from './utils';
import OWebFormError from './OWebFormError';
const formValidators = {};
export default class OWebFormValidator {
    /**
     * @param _appContext The app context.
     * @param form The form element.
     * @param required The required fields.
     * @param excluded The fields to exclude from validation.
     * @param checkAll When true all fields will be validated.
     */
    constructor(_appContext, form, required = [], excluded = [], checkAll = false) {
        this._appContext = _appContext;
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
        return this._appContext;
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
                const values = this.getFieldValues(field); // for checkboxes and others
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
    getFieldValues(name) {
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
                (label = this.form.querySelector(`label[for='${id}']`))) {
                description = label.textContent;
            }
            else if ((placeholder = field.getAttribute('placeholder')) &&
                placeholder.trim().length) {
                description = placeholder;
            }
            else if ((title = field.getAttribute('title')) &&
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
                if (e.isFormError) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm1WYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm1WYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUNOLE9BQU8sRUFDUCxPQUFPLEVBQ1AsVUFBVSxFQUNWLFVBQVUsRUFDVixRQUFRLEVBQ1IsTUFBTSxFQUNOLE9BQU8sR0FDUCxNQUFNLFNBQVMsQ0FBQztBQUNqQixPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQVM1QyxNQUFNLGNBQWMsR0FBc0MsRUFBRSxDQUFDO0FBRTdELE1BQU0sQ0FBQyxPQUFPLE9BQU8saUJBQWlCO0lBS3JDOzs7Ozs7T0FNRztJQUNILFlBQ2tCLFdBQW9CLEVBQ3BCLElBQXFCLEVBQ3JCLFdBQXFCLEVBQUUsRUFDdkIsV0FBcUIsRUFBRSxFQUN2QixXQUFvQixLQUFLO1FBSnpCLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ3BCLFNBQUksR0FBSixJQUFJLENBQWlCO1FBQ3JCLGFBQVEsR0FBUixRQUFRLENBQWU7UUFDdkIsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUN2QixhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQWZuQyxrQkFBYSxHQUE4QixFQUFFLENBQUM7UUFDOUMsYUFBUSxHQUFrQixFQUFFLENBQUM7UUFnQnBDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxNQUFNLEVBQUU7WUFDdEMsTUFBTSxJQUFJLEtBQUssQ0FDZCx1REFBdUQsQ0FDdkQsQ0FBQztTQUNGO1FBRUQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFB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QUVELGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDbEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBc0M7UUFDL0QsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQWtCLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDaEQsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCB7XG5cdGZvckVhY2gsXG5cdGlzQXJyYXksXG5cdGlzRnVuY3Rpb24sXG5cdGlzTm90RW1wdHksXG5cdGlzU3RyaW5nLFxuXHRsb2dnZXIsXG5cdHRvQXJyYXksXG59IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IE9XZWJGb3JtRXJyb3IgZnJvbSAnLi9PV2ViRm9ybUVycm9yJztcblxudHlwZSBPRm9ybUVycm9yTWFwID0geyBba2V5OiBzdHJpbmddOiBPV2ViRm9ybUVycm9yW10gfTtcbmV4cG9ydCB0eXBlIE9Gb3JtVmFsaWRhdG9yID0gKFxuXHR2YWx1ZTogYW55LFxuXHRuYW1lOiBzdHJpbmcsXG5cdGNvbnRleHQ6IE9XZWJGb3JtVmFsaWRhdG9yLFxuKSA9PiB2b2lkO1xuXG5jb25zdCBmb3JtVmFsaWRhdG9yczogeyBba2V5OiBzdHJpbmddOiBPRm9ybVZhbGlkYXRvciB9ID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJGb3JtVmFsaWRhdG9yIHtcblx0cHJpdmF0ZSByZWFkb25seSBmb3JtRGF0YTogRm9ybURhdGE7XG5cdHByaXZhdGUgdmFsaWRhdG9yc01hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuXHRwcml2YXRlIGVycm9yTWFwOiBPRm9ybUVycm9yTWFwID0ge307XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBfYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBmb3JtIFRoZSBmb3JtIGVsZW1lbnQuXG5cdCAqIEBwYXJhbSByZXF1aXJlZCBUaGUgcmVxdWlyZWQgZmllbGRzLlxuXHQgKiBAcGFyYW0gZXhjbHVkZWQgVGhlIGZpZWxkcyB0byBleGNsdWRlIGZyb20gdmFsaWRhdGlvbi5cblx0ICogQHBhcmFtIGNoZWNrQWxsIFdoZW4gdHJ1ZSBhbGwgZmllbGRzIHdpbGwgYmUgdmFsaWRhdGVkLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBfYXBwQ29udGV4dDogT1dlYkFwcCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGZvcm06IEhUTUxGb3JtRWxlbWVudCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IHJlcXVpcmVkOiBzdHJpbmdbXSA9IFtdLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZXhjbHVkZWQ6IHN0cmluZ1tdID0gW10sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjaGVja0FsbDogYm9vbGVhbiA9IGZhbHNlLFxuXHQpIHtcblx0XHRpZiAoIWZvcm0gfHwgZm9ybS5ub2RlTmFtZSAhPT0gJ0ZPUk0nKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdCdbT1dlYkZvcm1WYWxpZGF0b3JdIGEgdmFsaWQgZm9ybSBlbGVtZW50IGlzIHJlcXVpcmVkLicsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG0gPSB0aGlzO1xuXHRcdHRoaXMuZm9ybSA9IGZvcm07XG5cdFx0dGhpcy5mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSh0aGlzLmZvcm0pO1xuXHRcdGNvbnN0IGZvID0gdGhpcy5mb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW93ZWItZm9ybS12XScpOyAvLyByZXR1cm5zIE5vZGVMaXN0IG5vdCBBcnJheSBvZiBub2RlIChleDogaW4gRmlyZWZveClcblxuXHRcdChpc0FycmF5KGZvKSA/IGZvIDogdG9BcnJheShmbykpLmZvckVhY2goKGZpZWxkKSA9PiB7XG5cdFx0XHRjb25zdCBuYW1lID0gZmllbGQuZ2V0QXR0cmlidXRlKCduYW1lJyksXG5cdFx0XHRcdHZhbGlkYXRvck5hbWUgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3dlYi1mb3JtLXYnKTtcblxuXHRcdFx0aWYgKG5hbWUpIHtcblx0XHRcdFx0aWYgKCFmb3JtVmFsaWRhdG9yc1t2YWxpZGF0b3JOYW1lXSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcdGBbT1dlYkZvcm1WYWxpZGF0b3JdIHZhbGlkYXRvciBcIiR7dmFsaWRhdG9yTmFtZX1cIiBpcyBleHBsaWNpdGx5IHNldCBmb3IgZmllbGQgXCIke25hbWV9XCIgYnV0IGlzIG5vdCBkZWZpbmVkLmAsXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG0udmFsaWRhdG9yc01hcFtuYW1lXSA9IHZhbGlkYXRvck5hbWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZm9ybSBlbGVtZW50LlxuXHQgKi9cblx0Z2V0Rm9ybSgpOiBIVE1MRm9ybUVsZW1lbnQge1xuXHRcdHJldHVybiB0aGlzLmZvcm07XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYXBwIGNvbnRleHQuXG5cdCAqL1xuXHRnZXRBcHBDb250ZXh0KCk6IE9XZWJBcHAge1xuXHRcdHJldHVybiB0aGlzLl9hcHBDb250ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYXBwIGNvbmZpZy5cblx0ICpcblx0ICogQHBhcmFtIGtleVxuXHQgKi9cblx0Z2V0Q29uZmlnKGtleTogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5nZXRBcHBDb250ZXh0KCkuY29uZmlncy5nZXQoa2V5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgRm9ybURhdGEgY29udGFpbmluZyB0aGUgdmFsaWRhdGVkIGZvcm0gZmllbGRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmllbGRzIFRoZSBmaWVsZHMgbmFtZSBsaXN0LiBXaGVuIGVtcHR5IGFsbCBmaWVsZCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBGb3JtRGF0YS5cblx0ICovXG5cdGdldEZvcm1EYXRhKGZpZWxkczogc3RyaW5nW10gPSBbXSk6IEZvcm1EYXRhIHtcblx0XHRpZiAoZmllbGRzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZmllbGRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IGZpZWxkID0gZmllbGRzW2ldO1xuXHRcdFx0XHRjb25zdCB2YWx1ZXMgPSB0aGlzLmdldEZpZWxkVmFsdWVzKGZpZWxkKTsgLy8gZm9yIGNoZWNrYm94ZXMgYW5kIG90aGVyc1xuXHRcdFx0XHR2YWx1ZXMuZm9yRWFjaCgodmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGZvcm1EYXRhLmFwcGVuZChmaWVsZCwgdmFsdWUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZvcm1EYXRhO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBnaXZlbiBmaWVsZCBuYW1lIHZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZVxuXHQgKi9cblx0Z2V0RmllbGQobmFtZTogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5mb3JtRGF0YS5nZXQobmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhIGdpdmVuIGZpZWxkIHZhbHVlLlxuXHQgKiBAcGFyYW0gbmFtZVxuXHQgKiBAcGFyYW0gdmFsdWVcblx0ICovXG5cdHNldEZpZWxkKG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHRoaXMge1xuXHRcdHRoaXMuZm9ybURhdGEuc2V0KG5hbWUsIHZhbHVlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGNoZWNrYm94ZXMgbGlrZSBmaWVsZHMgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRGaWVsZFZhbHVlcyhuYW1lOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhLmdldEFsbChuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZWFyY2ggZm9yIGZpZWxkIGRlc2NyaXB0aW9uLlxuXHQgKlxuXHQgKiBXZSBzZWFyY2ggdGhlIGZpZWxkIGxhYmVsLCBwbGFjZWhvbGRlciBvciB0aXRsZS5cblx0ICpcblx0ICogQHBhcmFtIG5hbWVcblx0ICovXG5cdGdldEZpZWxkRGVzY3JpcHRpb24obmFtZTogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRjb25zdCBmaWVsZCA9IHRoaXMuZm9ybS5xdWVyeVNlbGVjdG9yKGBbbmFtZT0nJHtuYW1lfSddYCk7XG5cdFx0bGV0IGRlc2NyaXB0aW9uOiBhbnkgPSBuYW1lO1xuXG5cdFx0aWYgKGZpZWxkKSB7XG5cdFx0XHRjb25zdCBpZCA9IGZpZWxkLmdldEF0dHJpYnV0ZSgnaWQnKTtcblx0XHRcdGxldCBsYWJlbCwgcGxhY2Vob2xkZXIsIHRpdGxlO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRpZCAmJlxuXHRcdFx0XHQobGFiZWwgPSB0aGlzLmZvcm0ucXVlcnlTZWxlY3RvcihgbGFiZWxbZm9yPScke2lkfSddYCkpXG5cdFx0XHQpIHtcblx0XHRcdFx0ZGVzY3JpcHRpb24gPSBsYWJlbC50ZXh0Q29udGVudDtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdChwbGFjZWhvbGRlciA9IGZpZWxkLmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSkgJiZcblx0XHRcdFx0cGxhY2Vob2xkZXIudHJpbSgpLmxlbmd0aFxuXHRcdFx0KSB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uID0gcGxhY2Vob2xkZXI7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHQodGl0bGUgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykpICYmXG5cdFx0XHRcdHRpdGxlLnRyaW0oKS5sZW5ndGhcblx0XHRcdCkge1xuXHRcdFx0XHRkZXNjcmlwdGlvbiA9IHRpdGxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBkZXNjcmlwdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVycm9yIG1hcC5cblx0ICovXG5cdGdldEVycm9ycygpOiBPRm9ybUVycm9yTWFwIHtcblx0XHRyZXR1cm4gdGhpcy5lcnJvck1hcDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGZvcm0gdmFsaWRhdGlvbi5cblx0ICovXG5cdHZhbGlkYXRlKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGNvbnRleHQgPSB0aGlzLFxuXHRcdFx0ZmllbGROYW1lczogc3RyaW5nW10gPSBbXTtcblx0XHRsZXQgYyA9IC0xLFxuXHRcdFx0bmFtZTtcblxuXHRcdC8vIGVtcHR5IGVycm9yIGxpc3Rcblx0XHRjb250ZXh0LmVycm9yTWFwID0ge307XG5cblx0XHR0b0FycmF5KGNvbnRleHQuZm9ybS5lbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuXHRcdFx0aWYgKGkubmFtZSAhPT0gdW5kZWZpbmVkICYmIGZpZWxkTmFtZXMuaW5kZXhPZihpLm5hbWUpIDwgMCkge1xuXHRcdFx0XHRmaWVsZE5hbWVzLnB1c2goaS5uYW1lKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHdoaWxlICgobmFtZSA9IGZpZWxkTmFtZXNbKytjXSkpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChjb250ZXh0LmV4Y2x1ZGVkLmluZGV4T2YobmFtZSkgPCAwKSB7XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBjb250ZXh0LmdldEZpZWxkKG5hbWUpLFxuXHRcdFx0XHRcdFx0dmFsaWRhdG9yTmFtZSA9IGNvbnRleHQudmFsaWRhdG9yc01hcFtuYW1lXSB8fCBuYW1lLFxuXHRcdFx0XHRcdFx0Zm4gPSBmb3JtVmFsaWRhdG9yc1t2YWxpZGF0b3JOYW1lXTtcblxuXHRcdFx0XHRcdGlmIChpc05vdEVtcHR5KHZhbHVlKSkge1xuXHRcdFx0XHRcdFx0aWYgKGlzRnVuY3Rpb24oZm4pKSB7XG5cdFx0XHRcdFx0XHRcdGZuKHZhbHVlLCBuYW1lLCBjb250ZXh0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGxvZ2dlci53YXJuKFxuXHRcdFx0XHRcdFx0XHRcdGBbT1dlYkZvcm1WYWxpZGF0b3JdIHZhbGlkYXRvciAnJHt2YWxpZGF0b3JOYW1lfScgaXMgbm90IGRlZmluZWQsIGZpZWxkICcke25hbWV9JyBpcyB0aGVuIGNvbnNpZGVyZWQgYXMgc2FmZS5gLFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAofmNvbnRleHQucmVxdWlyZWQuaW5kZXhPZihuYW1lKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5hc3NlcnQoZmFsc2UsICdPWl9GT1JNX0NPTlRBSU5TX0VNUFRZX0ZJRUxEJywge1xuXHRcdFx0XHRcdFx0XHRsYWJlbDogY29udGV4dC5nZXRGaWVsZERlc2NyaXB0aW9uKG5hbWUpLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGlmIChlLmlzRm9ybUVycm9yKSB7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLmVycm9yTWFwW25hbWVdKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVycm9yTWFwW25hbWVdID0gW107XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGhpcy5lcnJvck1hcFtuYW1lXS5wdXNoKGUpO1xuXG5cdFx0XHRcdFx0aWYgKCF0aGlzLmNoZWNrQWxsKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmdldEFwcENvbnRleHQoKS52aWV3LmRpYWxvZyh7XG5cdFx0XHRcdFx0XHRcdHR5cGU6ICdlcnJvcicsXG5cdFx0XHRcdFx0XHRcdHRleHQ6IGUubWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0ZGF0YTogZS5kYXRhLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmVycm9yTWFwKS5sZW5ndGggPT09IDA7XG5cdH1cblxuXHQvKipcblx0ICogTWFrZSBhbiBhc3NlcnRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJlZGljYXRlIFRoZSBhc3NlcnRpb24gcHJlZGljYXRlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZSB3aGVuIHRoZSBwcmVkaWNhdGUgaXMgZmFsc2UuXG5cdCAqIEBwYXJhbSBkYXRhIFRoZSBlcnJvciBkYXRhLlxuXHQgKi9cblx0YXNzZXJ0KHByZWRpY2F0ZTogYW55LCBtZXNzYWdlOiBzdHJpbmcsIGRhdGE/OiB7fSk6IHRoaXMge1xuXHRcdGlmICghcHJlZGljYXRlKSB7XG5cdFx0XHR0aHJvdyBuZXcgT1dlYkZvcm1FcnJvcihtZXNzYWdlLCBkYXRhKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgbmV3IHZhbGlkYXRvci5cblx0ICpcblx0ICogQHBhcmFtIG5hbWUgVGhlIHZhbGlkYXRvciBuYW1lLlxuXHQgKiBAcGFyYW0gdmFsaWRhdG9yIFRoZSB2YWxpZGF0b3IgZnVuY3Rpb24uXG5cdCAqL1xuXHRzdGF0aWMgYWRkRmllbGRWYWxpZGF0b3IobmFtZTogc3RyaW5nLCB2YWxpZGF0b3I6IE9Gb3JtVmFsaWRhdG9yKTogdm9pZCB7XG5cdFx0aWYgKCFpc1N0cmluZyhuYW1lKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdFx0J1tPV2ViRm9ybVZhbGlkYXRvcl0gZmllbGQgbmFtZSBzaG91bGQgYmUgYSB2YWxpZCBzdHJpbmcuJyxcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKCFpc0Z1bmN0aW9uKHZhbGlkYXRvcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdCdbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIHZhbGlkYXRvciBzaG91bGQgYmUgYSB2YWxpZCBmdW5jdGlvbi4nLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRpZiAobmFtZSBpbiB2YWxpZGF0b3IpIHtcblx0XHRcdGxvZ2dlci53YXJuKFxuXHRcdFx0XHRgW09XZWJGb3JtVmFsaWRhdG9yXSBmaWVsZCBcIiR7bmFtZX1cIiB2YWxpZGF0b3Igd2lsbCBiZSBvdmVyd3JpdHRlbi5gLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRmb3JtVmFsaWRhdG9yc1tuYW1lXSA9IHZhbGlkYXRvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGZpZWxkcyB2YWxpZGF0b3JzLlxuXHQgKlxuXHQgKiBAcGFyYW0gbWFwIFRoZSBtYXAgb2YgZmllbGRzIHZhbGlkYXRvcnMuXG5cdCAqL1xuXHRzdGF0aWMgYWRkRmllbGRWYWxpZGF0b3JzKG1hcDogeyBba2V5OiBzdHJpbmddOiBPRm9ybVZhbGlkYXRvciB9KTogdm9pZCB7XG5cdFx0Zm9yRWFjaChtYXAsIChmbjogT0Zvcm1WYWxpZGF0b3IsIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRPV2ViRm9ybVZhbGlkYXRvci5hZGRGaWVsZFZhbGlkYXRvcihrZXksIGZuKTtcblx0XHR9KTtcblx0fVxufVxuIl19