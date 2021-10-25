import { extractFieldLabelText, isPlainObject } from './utils';
import { forEach, isArray, isFunction, isNotEmpty, isString, logger, toArray, } from './utils';
import OWebFormError from './OWebFormError';
const FORM_VALIDATORS = Object.create({});
class OFormDOMFormAdapter {
    form;
    validatorsMap = Object.create({});
    descriptionsMap = Object.create({});
    formData;
    constructor(form) {
        this.form = form;
        if (!form || form.nodeName !== 'FORM') {
            throw new Error('[OWebFormValidator][DOMFormAdapter] a valid form element is required.');
        }
        const m = this;
        this.form = form;
        this.formData = new FormData(this.form);
        const fo = this.form.querySelectorAll('[data-oweb-form-v]'); // returns NodeList not Array of node (ex: in Firefox)
        (isArray(fo) ? fo : toArray(fo)).forEach((field) => {
            const name = field.getAttribute('name'), validatorName = field.getAttribute('data-oweb-form-v');
            if (name && validatorName) {
                m.setFieldValidator(name, validatorName);
            }
        });
    }
    toFormData(fields = []) {
        const fd = new FormData();
        this.formData.forEach(function (value, name) {
            if (!fields.length || fields.indexOf(name) >= 0) {
                fd.append(name, value);
            }
        });
        return fd;
    }
    getValidatorsMap() {
        return this.validatorsMap;
    }
    setFieldValidator(fieldName, validatorName) {
        if (!FORM_VALIDATORS[validatorName]) {
            throw new Error(`[OWebFormValidator][DOMFormAdapter] validator "${validatorName}" is not defined can't set for field "${fieldName}".`);
        }
        this.validatorsMap[fieldName] = validatorName;
        return this;
    }
    getField(name) {
        return this.formData.get(name);
    }
    setField(name, value) {
        this.formData.set(name, value);
        return this;
    }
    getFieldsList() {
        const fieldNames = [];
        toArray(this.form.elements).forEach(function formElementsIterator(el) {
            const entry = el;
            if (entry.name !== undefined && fieldNames.indexOf(entry.name) < 0) {
                fieldNames.push(entry.name);
            }
        });
        return fieldNames;
    }
    getFieldDescription(name) {
        if (!this.descriptionsMap[name]) {
            this.descriptionsMap[name] = extractFieldLabelText(this.form, name);
        }
        return this.descriptionsMap[name];
    }
}
class OFormObjectAdapter {
    validatorsMap = Object.create({});
    descriptionsMap = Object.create({});
    formObj = Object.create({});
    constructor(form) {
        if (!isPlainObject(form)) {
            throw new Error('[OWebFormValidator][ObjectFormAdapter] a valid form plain object is required.');
        }
        forEach(form, (field, fieldName) => {
            this.formObj[fieldName] = field.value;
            if (field.validator) {
                this.setFieldValidator(fieldName, field.validator);
            }
            if (field.label) {
                this.descriptionsMap[fieldName] = field.label;
            }
        });
    }
    toFormData(fields = []) {
        const fd = new FormData();
        forEach(this.formObj, function (value, name) {
            if (!fields.length || fields.indexOf(name) >= 0) {
                if (isArray(value) || value instanceof FileList) {
                    forEach(value, function (val) {
                        fd.append(name, val);
                    });
                }
                else {
                    fd.append(name, value);
                }
            }
        });
        return fd;
    }
    getValidatorsMap() {
        return this.validatorsMap;
    }
    setFieldValidator(fieldName, validatorName) {
        if (!FORM_VALIDATORS[validatorName]) {
            throw new Error(`[OWebFormValidator][DOMFormAdapter] validator "${validatorName}" is not defined can't set for field "${fieldName}".`);
        }
        this.validatorsMap[fieldName] = validatorName;
        return this;
    }
    getField(name) {
        return this.formObj[name];
    }
    setField(name, value) {
        this.formObj[name] = value;
        return this;
    }
    getFieldsList() {
        return Object.keys(this.formObj);
    }
    getFieldDescription(name) {
        if (this.descriptionsMap[name]) {
            return this.descriptionsMap[name];
        }
        return name;
    }
}
export default class OWebFormValidator {
    _appContext;
    required;
    excluded;
    checkAll;
    verbose;
    adapter;
    validatorsMap = {};
    errorMap = {};
    /**
     * @param _appContext The app context.
     * @param form The form.
     * @param required The required fields.
     * @param excluded The fields to exclude from validation.
     * @param checkAll When true all fields will be validated.
     * @param verbose Log warning.
     */
    constructor(_appContext, form, required = [], excluded = [], checkAll = false, verbose = false) {
        this._appContext = _appContext;
        this.required = required;
        this.excluded = excluded;
        this.checkAll = checkAll;
        this.verbose = verbose;
        this.adapter =
            form instanceof HTMLFormElement
                ? new OFormDOMFormAdapter(form)
                : new OFormObjectAdapter(form);
    }
    /**
     * Returns the app context.
     */
    getAppContext() {
        return this._appContext;
    }
    /**
     * Returns the form adapter.
     */
    getFormAdapter() {
        return this.adapter;
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
        return this.adapter.toFormData(fields);
    }
    /**
     * Gets a given field name value.
     *
     * @param name
     */
    getField(name) {
        return this.adapter.getField(name);
    }
    /**
     * Sets a given field value.
     * @param name
     * @param value
     */
    setField(name, value) {
        this.adapter.setField(name, value);
        return this;
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
    validate(showDialog = true) {
        const fieldNames = this.adapter.getFieldsList();
        let c = -1, name;
        // empty error list
        this.errorMap = {};
        while ((name = fieldNames[++c])) {
            if (this.excluded.indexOf(name) < 0) {
                try {
                    const value = this.getField(name), validatorName = this.validatorsMap[name] || name, fn = FORM_VALIDATORS[validatorName];
                    if (isNotEmpty(value)) {
                        if (isFunction(fn)) {
                            fn(value, name, this);
                        }
                        else if (this.verbose) {
                            logger.warn(`[OWebFormValidator] validator '${validatorName}' is not defined, field '${name}' is then considered as safe.`);
                        }
                    }
                    else if (~this.required.indexOf(name)) {
                        this.assert(false, 'OZ_FORM_CONTAINS_EMPTY_FIELD', {
                            label: this.adapter.getFieldDescription(name),
                        });
                    }
                }
                catch (e) {
                    if (e.isFormError) {
                        if (!this.errorMap[name]) {
                            this.errorMap[name] = [];
                        }
                        this.errorMap[name].push(e);
                        if (!this.checkAll && showDialog) {
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
        FORM_VALIDATORS[name] = validator;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm1WYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm1WYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHFCQUFxQixFQUFFLGFBQWEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUUvRCxPQUFPLEVBQ04sT0FBTyxFQUNQLE9BQU8sRUFDUCxVQUFVLEVBQ1YsVUFBVSxFQUNWLFFBQVEsRUFDUixNQUFNLEVBQ04sT0FBTyxHQUNQLE1BQU0sU0FBUyxDQUFDO0FBQ2pCLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBcUI1QyxNQUFNLGVBQWUsR0FBc0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQWtEN0UsTUFBTSxtQkFBbUI7SUFLSztJQUpyQixhQUFhLEdBQThCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0QsZUFBZSxHQUE4QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELFFBQVEsQ0FBVztJQUVwQyxZQUE2QixJQUFxQjtRQUFyQixTQUFJLEdBQUosSUFBSSxDQUFpQjtRQUNqRCxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssTUFBTSxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQ2QsdUVBQXVFLENBQ3ZFLENBQUM7U0FDRjtRQUVELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLHNEQUFzRDtRQUVuSCxDQUFDLE9BQU8sQ0FBQyxFQUFF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SSxhQUFhLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3ZDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBWSxFQUFFLFNBQXlCO1FBQy9ELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDcEIsTUFBTSxJQUFJLFNBQVMsQ0FDbEIsMERBQTBELENBQzFELENBQUM7U0FDRjtRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0IsTUFBTSxJQUFJLFNBQVMsQ0FDbEIsaUVBQWlFLENBQ2pFLENBQUM7U0FDRjtRQUVELElBQUksSUFBSSxJQUFJLFNBQVMsRUFBRTtZQUN0QixNQUFNLENBQUMsSUFBSSxDQUNWLDhCQUE4QixJQUFJLGtDQUFrQyxDQUNwRSxDQUFDO1NBQ0Y7UUFFRCxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ25DLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEdBQXNDO1FBQy9ELE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFrQixFQUFFLEdBQVcsRUFBRSxFQUFFO1lBQ2hELGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4dHJhY3RGaWVsZExhYmVsVGV4dCwgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCB7XG5cdGZvckVhY2gsXG5cdGlzQXJyYXksXG5cdGlzRnVuY3Rpb24sXG5cdGlzTm90RW1wdHksXG5cdGlzU3RyaW5nLFxuXHRsb2dnZXIsXG5cdHRvQXJyYXksXG59IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IE9XZWJGb3JtRXJyb3IgZnJvbSAnLi9PV2ViRm9ybUVycm9yJztcblxuZXhwb3J0IHR5cGUgT0ZpZWxkVmFsdWUgPSBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIHwgbnVtYmVyIHwgQmxvYjtcblxuZXhwb3J0IGludGVyZmFjZSBPRmllbGQge1xuXHR2YWx1ZTogT0ZpZWxkVmFsdWU7XG5cdGxhYmVsPzogc3RyaW5nO1xuXHR2YWxpZGF0b3I/OiBzdHJpbmc7XG59XG5leHBvcnQgdHlwZSBPRm9ybURhdGEgPSBGb3JtRGF0YSB8IFJlY29yZDxzdHJpbmcsIE9GaWVsZFZhbHVlPjtcblxuZXhwb3J0IHR5cGUgT0Zvcm1PcHRpb25zID0gUmVjb3JkPHN0cmluZywgT0ZpZWxkPjtcbmV4cG9ydCB0eXBlIE9Gb3JtID0gT0Zvcm1PcHRpb25zIHwgSFRNTEZvcm1FbGVtZW50O1xuXG50eXBlIE9Gb3JtRXJyb3JzID0geyBba2V5OiBzdHJpbmddOiBPV2ViRm9ybUVycm9yW10gfTtcbmV4cG9ydCB0eXBlIE9Gb3JtVmFsaWRhdG9yID0gKFxuXHR2YWx1ZTogYW55LFxuXHRuYW1lOiBzdHJpbmcsXG5cdGNvbnRleHQ6IE9XZWJGb3JtVmFsaWRhdG9yLFxuKSA9PiB2b2lkO1xuXG5jb25zdCBGT1JNX1ZBTElEQVRPUlM6IHsgW2tleTogc3RyaW5nXTogT0Zvcm1WYWxpZGF0b3IgfSA9IE9iamVjdC5jcmVhdGUoe30pO1xuXG5pbnRlcmZhY2UgT1dlYkZvcm1BZGFwdGVyIHtcblx0LyoqXG5cdCAqIFJldHVybnMgZm9ybSBkYXRhLlxuXHQgKiBAcGFyYW0gZmllbGRzIFRoZSBmaWVsZHMgbmFtZSBsaXN0LlxuXHQgKi9cblx0dG9Gb3JtRGF0YShmaWVsZHM6IHN0cmluZ1tdKTogRm9ybURhdGE7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgZmllbGRzIHZhbGlkYXRvcnMgbWFwLlxuXHQgKi9cblx0Z2V0VmFsaWRhdG9yc01hcCgpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gZmllbGROYW1lXG5cdCAqIEBwYXJhbSB2YWxpZGF0b3JOYW1lXG5cdCAqL1xuXHRzZXRGaWVsZFZhbGlkYXRvcihmaWVsZE5hbWU6IHN0cmluZywgdmFsaWRhdG9yTmFtZTogc3RyaW5nKTogdGhpcztcblxuXHQvKipcblx0ICogR2V0cyBhIGdpdmVuIGZpZWxkIG5hbWUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWVsZE5hbWVcblx0ICovXG5cdGdldEZpZWxkKGZpZWxkTmFtZTogc3RyaW5nKTogT0ZpZWxkVmFsdWU7XG5cblx0LyoqXG5cdCAqIFNldHMgYSBnaXZlbiBmaWVsZCB2YWx1ZS5cblx0ICogQHBhcmFtIGZpZWxkTmFtZVxuXHQgKiBAcGFyYW0gdmFsdWVcblx0ICovXG5cdHNldEZpZWxkKGZpZWxkTmFtZTogc3RyaW5nLCB2YWx1ZTogT0ZpZWxkVmFsdWUpOiB0aGlzO1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFsbCBmaWVsZHMgbmFtZXMgbGlzdC5cblx0ICovXG5cdGdldEZpZWxkc0xpc3QoKTogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIFJldHVybnMgZmllbGQgZGVzY3JpcHRpb24uXG5cdCAqXG5cdCAqIFdlIHNlYXJjaCB0aGUgZmllbGQgbGFiZWwsIHBsYWNlaG9sZGVyIG9yIHRpdGxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmllbGROYW1lXG5cdCAqL1xuXHRnZXRGaWVsZERlc2NyaXB0aW9uKGZpZWxkTmFtZTogc3RyaW5nKTogc3RyaW5nO1xufVxuXG5jbGFzcyBPRm9ybURPTUZvcm1BZGFwdGVyIGltcGxlbWVudHMgT1dlYkZvcm1BZGFwdGVyIHtcblx0cHJpdmF0ZSB2YWxpZGF0b3JzTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0gT2JqZWN0LmNyZWF0ZSh7fSk7XG5cdHByaXZhdGUgZGVzY3JpcHRpb25zTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0gT2JqZWN0LmNyZWF0ZSh7fSk7XG5cdHByaXZhdGUgcmVhZG9ubHkgZm9ybURhdGE6IEZvcm1EYXRhO1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZm9ybTogSFRNTEZvcm1FbGVtZW50KSB7XG5cdFx0aWYgKCFmb3JtIHx8IGZvcm0ubm9kZU5hbWUgIT09ICdGT1JNJykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHQnW09XZWJGb3JtVmFsaWRhdG9yXVtET01Gb3JtQWRhcHRlcl0gYSB2YWxpZCBmb3JtIGVsZW1lbnQgaXMgcmVxdWlyZWQuJ1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjb25zdCBtID0gdGhpcztcblx0XHR0aGlzLmZvcm0gPSBmb3JtO1xuXHRcdHRoaXMuZm9ybURhdGEgPSBuZXcgRm9ybURhdGEodGhpcy5mb3JtKTtcblx0XHRjb25zdCBmbyA9IHRoaXMuZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1vd2ViLWZvcm0tdl0nKTsgLy8gcmV0dXJucyBOb2RlTGlzdCBub3QgQXJyYXkgb2Ygbm9kZSAoZXg6IGluIEZpcmVmb3gpXG5cblx0XHQoaXNBcnJheShmbykgPyBmbyA6IHRvQXJyYXkoZm8pKS5mb3JFYWNoKChmaWVsZCkgPT4ge1xuXHRcdFx0Y29uc3QgbmFtZSA9IGZpZWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuXHRcdFx0XHR2YWxpZGF0b3JOYW1lID0gZmllbGQuZ2V0QXR0cmlidXRlKCdkYXRhLW93ZWItZm9ybS12Jyk7XG5cblx0XHRcdGlmIChuYW1lICYmIHZhbGlkYXRvck5hbWUpIHtcblx0XHRcdFx0bS5zZXRGaWVsZFZhbGlkYXRvcihuYW1lLHZhbGlkYXRvck5hbWUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0dG9Gb3JtRGF0YShmaWVsZHM6IHN0cmluZ1tdID0gW10pOiBGb3JtRGF0YSB7XG5cdFx0Y29uc3QgZmQgPSBuZXcgRm9ybURhdGEoKTtcblxuXHRcdHRoaXMuZm9ybURhdGEuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIG5hbWUpIHtcblx0XHRcdGlmICghZmllbGRzLmxlbmd0aCB8fCBmaWVsZHMuaW5kZXhPZihuYW1lKSA+PSAwKSB7XG5cdFx0XHRcdGZkLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZmQ7XG5cdH1cblxuXHRnZXRWYWxpZGF0b3JzTWFwKCkge1xuXHRcdHJldHVybiB0aGlzLnZhbGlkYXRvcnNNYXA7XG5cdH1cblxuXHRzZXRGaWVsZFZhbGlkYXRvcihmaWVsZE5hbWU6IHN0cmluZywgdmFsaWRhdG9yTmFtZTogc3RyaW5nKSB7XG5cdFx0aWYgKCFGT1JNX1ZBTElEQVRPUlNbdmFsaWRhdG9yTmFtZV0pIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0YFtPV2ViRm9ybVZhbGlkYXRvcl1bRE9NRm9ybUFkYXB0ZXJdIHZhbGlkYXRvciBcIiR7dmFsaWRhdG9yTmFtZX1cIiBpcyBub3QgZGVmaW5lZCBjYW4ndCBzZXQgZm9yIGZpZWxkIFwiJHtmaWVsZE5hbWV9XCIuYFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHR0aGlzLnZhbGlkYXRvcnNNYXBbZmllbGROYW1lXSA9IHZhbGlkYXRvck5hbWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGdldEZpZWxkKG5hbWU6IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMuZm9ybURhdGEuZ2V0KG5hbWUpO1xuXHR9XG5cblx0c2V0RmllbGQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XG5cdFx0dGhpcy5mb3JtRGF0YS5zZXQobmFtZSwgdmFsdWUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Z2V0RmllbGRzTGlzdCgpOiBzdHJpbmdbXSB7XG5cdFx0Y29uc3QgZmllbGROYW1lczogc3RyaW5nW10gPSBbXTtcblxuXHRcdHRvQXJyYXkodGhpcy5mb3JtLmVsZW1lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIGZvcm1FbGVtZW50c0l0ZXJhdG9yKGVsKSB7XG5cdFx0XHRjb25zdCBlbnRyeTphbnkgPSBlbCBhcyB1bmtub3duO1xuXHRcdFx0aWYgKGVudHJ5Lm5hbWUgIT09IHVuZGVmaW5lZCAmJiBmaWVsZE5hbWVzLmluZGV4T2YoZW50cnkubmFtZSkgPCAwKSB7XG5cdFx0XHRcdGZpZWxkTmFtZXMucHVzaChlbnRyeS5uYW1lKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBmaWVsZE5hbWVzO1xuXHR9XG5cblx0Z2V0RmllbGREZXNjcmlwdGlvbihuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGlmICghdGhpcy5kZXNjcmlwdGlvbnNNYXBbbmFtZV0pIHtcblx0XHRcdHRoaXMuZGVzY3JpcHRpb25zTWFwW25hbWVdID0gZXh0cmFjdEZpZWxkTGFiZWxUZXh0KHRoaXMuZm9ybSwgbmFtZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuZGVzY3JpcHRpb25zTWFwW25hbWVdO1xuXHR9XG59XG5cbmNsYXNzIE9Gb3JtT2JqZWN0QWRhcHRlciBpbXBsZW1lbnRzIE9XZWJGb3JtQWRhcHRlciB7XG5cdHByaXZhdGUgdmFsaWRhdG9yc01hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IE9iamVjdC5jcmVhdGUoe30pO1xuXHRwcml2YXRlIGRlc2NyaXB0aW9uc01hcDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IE9iamVjdC5jcmVhdGUoe30pO1xuXHRwcml2YXRlIHJlYWRvbmx5IGZvcm1PYmo6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSBPYmplY3QuY3JlYXRlKHt9KTtcblxuXHRjb25zdHJ1Y3Rvcihmb3JtOiBPRm9ybU9wdGlvbnMpIHtcblx0XHRpZiAoIWlzUGxhaW5PYmplY3QoZm9ybSkpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0J1tPV2ViRm9ybVZhbGlkYXRvcl1bT2JqZWN0Rm9ybUFkYXB0ZXJdIGEgdmFsaWQgZm9ybSBwbGFpbiBvYmplY3QgaXMgcmVxdWlyZWQuJ1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRmb3JFYWNoPE9GaWVsZD4oZm9ybSwgKGZpZWxkLCBmaWVsZE5hbWUpID0+IHtcblx0XHRcdHRoaXMuZm9ybU9ialtmaWVsZE5hbWVdID0gZmllbGQudmFsdWU7XG5cblx0XHRcdGlmIChmaWVsZC52YWxpZGF0b3IpIHtcblx0XHRcdFx0dGhpcy5zZXRGaWVsZFZhbGlkYXRvcihmaWVsZE5hbWUsIGZpZWxkLnZhbGlkYXRvcik7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChmaWVsZC5sYWJlbCkge1xuXHRcdFx0XHR0aGlzLmRlc2NyaXB0aW9uc01hcFtmaWVsZE5hbWVdID0gZmllbGQubGFiZWw7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHR0b0Zvcm1EYXRhKGZpZWxkczogc3RyaW5nW10gPSBbXSkge1xuXHRcdGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7XG5cblx0XHRmb3JFYWNoKHRoaXMuZm9ybU9iaiwgZnVuY3Rpb24gKHZhbHVlLCBuYW1lKSB7XG5cdFx0XHRpZiAoIWZpZWxkcy5sZW5ndGggfHwgZmllbGRzLmluZGV4T2YobmFtZSkgPj0gMCkge1xuXHRcdFx0XHRpZiAoaXNBcnJheSh2YWx1ZSkgfHwgdmFsdWUgaW5zdGFuY2VvZiBGaWxlTGlzdCkge1xuXHRcdFx0XHRcdGZvckVhY2godmFsdWUsIGZ1bmN0aW9uICh2YWwpIHtcblx0XHRcdFx0XHRcdGZkLmFwcGVuZChuYW1lLCB2YWwpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZkLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBmZDtcblx0fVxuXG5cdGdldFZhbGlkYXRvcnNNYXAoKSB7XG5cdFx0cmV0dXJuIHRoaXMudmFsaWRhdG9yc01hcDtcblx0fVxuXG5cdHNldEZpZWxkVmFsaWRhdG9yKGZpZWxkTmFtZTogc3RyaW5nLCB2YWxpZGF0b3JOYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoIUZPUk1fVkFMSURBVE9SU1t2YWxpZGF0b3JOYW1lXSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRgW09XZWJGb3JtVmFsaWRhdG9yXVtET01Gb3JtQWRhcHRlcl0gdmFsaWRhdG9yIFwiJHt2YWxpZGF0b3JOYW1lfVwiIGlzIG5vdCBkZWZpbmVkIGNhbid0IHNldCBmb3IgZmllbGQgXCIke2ZpZWxkTmFtZX1cIi5gXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHRoaXMudmFsaWRhdG9yc01hcFtmaWVsZE5hbWVdID0gdmFsaWRhdG9yTmFtZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Z2V0RmllbGQobmFtZTogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5mb3JtT2JqW25hbWVdO1xuXHR9XG5cblx0c2V0RmllbGQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XG5cdFx0dGhpcy5mb3JtT2JqW25hbWVdID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRnZXRGaWVsZHNMaXN0KCk6IHN0cmluZ1tdIHtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5mb3JtT2JqKTtcblx0fVxuXG5cdGdldEZpZWxkRGVzY3JpcHRpb24obmFtZTogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRpZiAodGhpcy5kZXNjcmlwdGlvbnNNYXBbbmFtZV0pIHtcblx0XHRcdHJldHVybiB0aGlzLmRlc2NyaXB0aW9uc01hcFtuYW1lXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmFtZTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRm9ybVZhbGlkYXRvciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgYWRhcHRlcjogT1dlYkZvcm1BZGFwdGVyO1xuXHRwcml2YXRlIHZhbGlkYXRvcnNNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcblx0cHJpdmF0ZSBlcnJvck1hcDogT0Zvcm1FcnJvcnMgICAgICAgICAgICAgICAgICAgID0ge307XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBfYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBmb3JtIFRoZSBmb3JtLlxuXHQgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVkIGZpZWxkcy5cblx0ICogQHBhcmFtIGV4Y2x1ZGVkIFRoZSBmaWVsZHMgdG8gZXhjbHVkZSBmcm9tIHZhbGlkYXRpb24uXG5cdCAqIEBwYXJhbSBjaGVja0FsbCBXaGVuIHRydWUgYWxsIGZpZWxkcyB3aWxsIGJlIHZhbGlkYXRlZC5cblx0ICogQHBhcmFtIHZlcmJvc2UgTG9nIHdhcm5pbmcuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IF9hcHBDb250ZXh0OiBPV2ViQXBwLFxuXHRcdGZvcm06IE9Gb3JtLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcmVxdWlyZWQ6IHN0cmluZ1tdID0gW10sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBleGNsdWRlZDogc3RyaW5nW10gPSBbXSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNoZWNrQWxsOiBib29sZWFuID0gZmFsc2UsXG5cdFx0cHJpdmF0ZSByZWFkb25seSB2ZXJib3NlOiBib29sZWFuID0gZmFsc2Vcblx0KSB7XG5cdFx0dGhpcy5hZGFwdGVyID1cblx0XHRcdGZvcm0gaW5zdGFuY2VvZiBIVE1MRm9ybUVsZW1lbnRcblx0XHRcdFx0PyBuZXcgT0Zvcm1ET01Gb3JtQWRhcHRlcihmb3JtKVxuXHRcdFx0XHQ6IG5ldyBPRm9ybU9iamVjdEFkYXB0ZXIoZm9ybSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYXBwIGNvbnRleHQuXG5cdCAqL1xuXHRnZXRBcHBDb250ZXh0KCk6IE9XZWJBcHAge1xuXHRcdHJldHVybiB0aGlzLl9hcHBDb250ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGZvcm0gYWRhcHRlci5cblx0ICovXG5cdGdldEZvcm1BZGFwdGVyKCk6IE9XZWJGb3JtQWRhcHRlciB7XG5cdFx0cmV0dXJuIHRoaXMuYWRhcHRlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFwcCBjb25maWcuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXlcblx0ICovXG5cdGdldENvbmZpZyhrZXk6IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXBwQ29udGV4dCgpLmNvbmZpZ3MuZ2V0KGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIEZvcm1EYXRhIGNvbnRhaW5pbmcgdGhlIHZhbGlkYXRlZCBmb3JtIGZpZWxkcy5cblx0ICpcblx0ICogQHBhcmFtIGZpZWxkcyBUaGUgZmllbGRzIG5hbWUgbGlzdC4gV2hlbiBlbXB0eSBhbGwgZmllbGQgd2lsbCBiZSBhZGRlZCB0byB0aGUgRm9ybURhdGEuXG5cdCAqL1xuXHRnZXRGb3JtRGF0YShmaWVsZHM6IHN0cmluZ1tdID0gW10pOiBGb3JtRGF0YSB7XG5cdFx0cmV0dXJuIHRoaXMuYWRhcHRlci50b0Zvcm1EYXRhKGZpZWxkcyk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIGdpdmVuIGZpZWxkIG5hbWUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRGaWVsZChuYW1lOiBzdHJpbmcpOiBPRmllbGRWYWx1ZSB7XG5cdFx0cmV0dXJuIHRoaXMuYWRhcHRlci5nZXRGaWVsZChuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGEgZ2l2ZW4gZmllbGQgdmFsdWUuXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqIEBwYXJhbSB2YWx1ZVxuXHQgKi9cblx0c2V0RmllbGQobmFtZTogc3RyaW5nLCB2YWx1ZTogT0ZpZWxkVmFsdWUpOiB0aGlzIHtcblx0XHR0aGlzLmFkYXB0ZXIuc2V0RmllbGQobmFtZSwgdmFsdWUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgZXJyb3IgbWFwLlxuXHQgKi9cblx0Z2V0RXJyb3JzKCk6IE9Gb3JtRXJyb3JzIHtcblx0XHRyZXR1cm4gdGhpcy5lcnJvck1hcDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGZvcm0gdmFsaWRhdGlvbi5cblx0ICovXG5cdHZhbGlkYXRlKHNob3dEaWFsb2cgPSB0cnVlKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgZmllbGROYW1lczogc3RyaW5nW10gPSB0aGlzLmFkYXB0ZXIuZ2V0RmllbGRzTGlzdCgpO1xuXHRcdGxldCBjID0gLTEsXG5cdFx0XHRuYW1lO1xuXG5cdFx0Ly8gZW1wdHkgZXJyb3IgbGlzdFxuXHRcdHRoaXMuZXJyb3JNYXAgPSB7fTtcblxuXHRcdHdoaWxlICgobmFtZSA9IGZpZWxkTmFtZXNbKytjXSkpIHtcblx0XHRcdGlmICh0aGlzLmV4Y2x1ZGVkLmluZGV4T2YobmFtZSkgPCAwKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSB0aGlzLmdldEZpZWxkKG5hbWUpLFxuXHRcdFx0XHRcdFx0dmFsaWRhdG9yTmFtZSA9IHRoaXMudmFsaWRhdG9yc01hcFtuYW1lXSB8fCBuYW1lLFxuXHRcdFx0XHRcdFx0Zm4gPSBGT1JNX1ZBTElEQVRPUlNbdmFsaWRhdG9yTmFtZV07XG5cblx0XHRcdFx0XHRpZiAoaXNOb3RFbXB0eSh2YWx1ZSkpIHtcblx0XHRcdFx0XHRcdGlmIChpc0Z1bmN0aW9uKGZuKSkge1xuXHRcdFx0XHRcdFx0XHRmbih2YWx1ZSwgbmFtZSwgdGhpcyk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMudmVyYm9zZSkge1xuXHRcdFx0XHRcdFx0XHRsb2dnZXIud2Fybihcblx0XHRcdFx0XHRcdFx0XHRgW09XZWJGb3JtVmFsaWRhdG9yXSB2YWxpZGF0b3IgJyR7dmFsaWRhdG9yTmFtZX0nIGlzIG5vdCBkZWZpbmVkLCBmaWVsZCAnJHtuYW1lfScgaXMgdGhlbiBjb25zaWRlcmVkIGFzIHNhZmUuYFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAofnRoaXMucmVxdWlyZWQuaW5kZXhPZihuYW1lKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5hc3NlcnQoZmFsc2UsICdPWl9GT1JNX0NPTlRBSU5TX0VNUFRZX0ZJRUxEJywge1xuXHRcdFx0XHRcdFx0XHRsYWJlbDogdGhpcy5hZGFwdGVyLmdldEZpZWxkRGVzY3JpcHRpb24obmFtZSksXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGU6YW55KSB7XG5cdFx0XHRcdFx0aWYgKGUuaXNGb3JtRXJyb3IpIHtcblx0XHRcdFx0XHRcdGlmICghdGhpcy5lcnJvck1hcFtuYW1lXSkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmVycm9yTWFwW25hbWVdID0gW107XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHRoaXMuZXJyb3JNYXBbbmFtZV0ucHVzaChlKTtcblxuXHRcdFx0XHRcdFx0aWYgKCF0aGlzLmNoZWNrQWxsICYmIHNob3dEaWFsb2cpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5nZXRBcHBDb250ZXh0KCkudmlldy5kaWFsb2coe1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6ICdlcnJvcicsXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogZS5tZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGE6IGUuZGF0YSxcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmVycm9yTWFwKS5sZW5ndGggPT09IDA7XG5cdH1cblxuXHQvKipcblx0ICogTWFrZSBhbiBhc3NlcnRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJlZGljYXRlIFRoZSBhc3NlcnRpb24gcHJlZGljYXRlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZSB3aGVuIHRoZSBwcmVkaWNhdGUgaXMgZmFsc2UuXG5cdCAqIEBwYXJhbSBkYXRhIFRoZSBlcnJvciBkYXRhLlxuXHQgKi9cblx0YXNzZXJ0KHByZWRpY2F0ZTogdW5rbm93biwgbWVzc2FnZTogc3RyaW5nLCBkYXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB0aGlzIHtcblx0XHRpZiAoIXByZWRpY2F0ZSkge1xuXHRcdFx0dGhyb3cgbmV3IE9XZWJGb3JtRXJyb3IobWVzc2FnZSwgZGF0YSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIG5ldyB2YWxpZGF0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lIFRoZSB2YWxpZGF0b3IgbmFtZS5cblx0ICogQHBhcmFtIHZhbGlkYXRvciBUaGUgdmFsaWRhdG9yIGZ1bmN0aW9uLlxuXHQgKi9cblx0c3RhdGljIGFkZEZpZWxkVmFsaWRhdG9yKG5hbWU6IHN0cmluZywgdmFsaWRhdG9yOiBPRm9ybVZhbGlkYXRvcik6IHZvaWQge1xuXHRcdGlmICghaXNTdHJpbmcobmFtZSkpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdCdbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIG5hbWUgc2hvdWxkIGJlIGEgdmFsaWQgc3RyaW5nLidcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKCFpc0Z1bmN0aW9uKHZhbGlkYXRvcikpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdCdbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIHZhbGlkYXRvciBzaG91bGQgYmUgYSB2YWxpZCBmdW5jdGlvbi4nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmIChuYW1lIGluIHZhbGlkYXRvcikge1xuXHRcdFx0bG9nZ2VyLndhcm4oXG5cdFx0XHRcdGBbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIFwiJHtuYW1lfVwiIHZhbGlkYXRvciB3aWxsIGJlIG92ZXJ3cml0dGVuLmBcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Rk9STV9WQUxJREFUT1JTW25hbWVdID0gdmFsaWRhdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgZmllbGRzIHZhbGlkYXRvcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBtYXAgVGhlIG1hcCBvZiBmaWVsZHMgdmFsaWRhdG9ycy5cblx0ICovXG5cdHN0YXRpYyBhZGRGaWVsZFZhbGlkYXRvcnMobWFwOiB7IFtrZXk6IHN0cmluZ106IE9Gb3JtVmFsaWRhdG9yIH0pOiB2b2lkIHtcblx0XHRmb3JFYWNoKG1hcCwgKGZuOiBPRm9ybVZhbGlkYXRvciwga2V5OiBzdHJpbmcpID0+IHtcblx0XHRcdE9XZWJGb3JtVmFsaWRhdG9yLmFkZEZpZWxkVmFsaWRhdG9yKGtleSwgZm4pO1xuXHRcdH0pO1xuXHR9XG59XG4iXX0=