import { isNil, isValidAge, forEach, logger } from './utils';
import OWebFormError from './OWebFormError';
import OWebDate from './plugins/OWebDate';
const DECLARED_VALIDATORS = Object.create({});
export default class OWebForm {
    _appContext;
    adapter;
    required;
    excluded;
    checkAll;
    verbose;
    errors = {};
    /**
     * @param _appContext The app context.
     * @param adapter The form.
     * @param required The required fields.
     * @param excluded The fields to exclude from validation.
     * @param checkAll When true all fields will be validated.
     * @param verbose Log warning.
     */
    constructor(_appContext, adapter, required = [], excluded = [], checkAll = false, verbose = false) {
        this._appContext = _appContext;
        this.adapter = adapter;
        this.required = required;
        this.excluded = excluded;
        this.checkAll = checkAll;
        this.verbose = verbose;
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
    getFieldValue(name) {
        return this.adapter.getFieldValue(name);
    }
    /**
     * Sets a given field value.
     * @param name
     * @param value
     */
    setFieldValue(name, value) {
        this.adapter.setFieldValue(name, value);
        return this;
    }
    /**
     * Returns error map.
     */
    getErrors() {
        return this.errors;
    }
    /**
     * Runs form validation.
     */
    validate(showDialog = true) {
        const fieldNames = this.adapter.getFieldsNames();
        let c = -1, name;
        // empty error list
        this.errors = {};
        while ((name = fieldNames[++c])) {
            if (this.excluded.indexOf(name) < 0) {
                try {
                    const value = this.getFieldValue(name);
                    if (!isNil(value)) {
                        const validators = this.adapter.getFieldValidators(name);
                        if (validators.length) {
                            for (let i = 0; i < validators.length; i++) {
                                validators[i](value, name, this);
                            }
                        }
                        else if (this.verbose) {
                            logger.warn(`[OWebForm] no validators defined for field '${name}'.`);
                        }
                    }
                    else if (~this.required.indexOf(name)) {
                        this.assert(false, 'OZ_FORM_CONTAINS_EMPTY_FIELD', {
                            label: this.adapter.getFieldLabel(name),
                        });
                    }
                }
                catch (e) {
                    if (e.isFormError) {
                        if (!this.errors[name]) {
                            this.errors[name] = [];
                        }
                        this.errors[name].push(e);
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
        return Object.keys(this.errors).length === 0;
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
     * Declare a field validator.
     *
     * @param name The validator name.
     * @param validator The validator function.
     */
    static declareFieldValidator(name, validator) {
        if (name in DECLARED_VALIDATORS) {
            logger.warn(`[OWebForm] field validator "${name}" overwritten.`);
        }
        DECLARED_VALIDATORS[name] = validator;
    }
    /**
     * Gets field validator.
     *
     * @param name The field validator name.
     */
    static getDeclaredValidator(name) {
        return DECLARED_VALIDATORS[name];
    }
}
export const defaultValidators = {
    code: (value, _name, fv) => {
        const codeReg = new RegExp(fv.getConfig('OZ_CODE_REG'));
        fv.assert(codeReg.test(isNil(value) ? '' : String(value)), 'OZ_AUTH_CODE_INVALID');
    },
    uname: (value, name, fv) => {
        const v = (isNil(value) ? '' : String(value))
            .replace(/\s+/g, ' ')
            .trim();
        fv.assert(v.length >= fv.getConfig('OZ_USER_NAME_MIN_LENGTH'), 'OZ_FIELD_USER_NAME_TOO_SHORT')
            .assert(v.length <= fv.getConfig('OZ_USER_NAME_MAX_LENGTH'), 'OZ_FIELD_USER_NAME_TOO_LONG')
            .setFieldValue(name, v);
    },
    login_pass: (value, _name, fv) => {
        const pass = isNil(value) ? '' : String(value), min = fv.getConfig('OZ_PASS_MIN_LENGTH'), max = fv.getConfig('OZ_PASS_MAX_LENGTH');
        fv.assert(pass.length >= min, 'OZ_FIELD_PASS_INVALID').assert(pass.length <= max, 'OZ_FIELD_PASS_INVALID');
    },
    pass: (value, _name, fv) => {
        const pass = isNil(value) ? '' : String(value), min = fv.getConfig('OZ_PASS_MIN_LENGTH'), max = fv.getConfig('OZ_PASS_MAX_LENGTH');
        fv.assert(pass.length >= min, 'OZ_FIELD_PASS_TOO_SHORT', {
            min,
            max,
        }).assert(pass.length <= max, 'OZ_FIELD_PASS_TOO_LONG', {
            min,
            max,
        });
    },
    pass_verify: (value, _name, fv) => {
        fv.assert(value === fv.getFieldValue('pass'), 'OZ_FIELD_PASS_AND_VPASS_NOT_EQUAL');
    },
    birth_date: (value, name, fv) => {
        const od = new OWebDate(fv.getAppContext(), isNil(value) ? undefined : value), date = od.describe(), minAge = fv.getConfig('OZ_USER_MIN_AGE'), maxAge = fv.getConfig('OZ_USER_MAX_AGE'), isValid = date && isValidAge(date.d, parseInt(date.mm), date.Y, minAge, maxAge);
        fv.assert(isValid, 'OZ_FIELD_BIRTH_DATE_INVALID', {
            input: value,
            min: minAge,
            max: maxAge,
        });
        date && fv.setFieldValue(name, `${date.Y}-${date.mm}-${date.d}`);
    },
    gender: (value, _name, fv) => {
        const genders = fv.getConfig('OZ_USER_ALLOWED_GENDERS');
        fv.assert(genders.indexOf(value) >= 0, 'OZ_FIELD_GENDER_INVALID');
    },
    email: (value, name, fv) => {
        /**
         * Email matching regex
         *
         * source: http://www.w3.org/TR/html5/forms.html#valid-e-mail-address
         *        - TLD not required
         *            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
         *        - must have TLD
         *            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
         */
        const emailReg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        const email = (isNil(value) ? '' : String(value))
            .replace(/\s/g, ' ')
            .trim();
        fv.assert(emailReg.test(email), 'OZ_FIELD_EMAIL_INVALID').setFieldValue(name, email);
    },
};
forEach(defaultValidators, (validator, name) => {
    OWebForm.declareFieldValidator(name, validator);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUM3RCxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUU1QyxPQUFPLFFBQXdCLE1BQU0sb0JBQW9CLENBQUM7QUFrQjFELE1BQU0sbUJBQW1CLEdBQ3hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFbkIsTUFBTSxDQUFDLE9BQU8sT0FBTyxRQUFRO0lBWVY7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBaEJWLE1BQU0sR0FBbUIsRUFBRSxDQUFDO0lBRXBDOzs7Ozs7O09BT0c7SUFDSCxZQUNrQixXQUFvQixFQUNwQixPQUF3QixFQUN4QixXQUFxQixFQUFFLEVBQ3ZCLFdBQXFCLEVBQUUsRUFDdkIsV0FBb0IsS0FBSyxFQUN6QixVQUFtQixLQUFLO1FBTHhCLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ3BCLFlBQU8sR0FBUCxPQUFPLENBQWlCO1FBQ3hCLGFBQVEsR0FBUixRQUFRLENBQWU7UUFDdkIsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUN2QixhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUN6QixZQUFPLEdBQVAsT0FBTyxDQUFpQjtJQUN2QyxDQUFDO0lBRUo7O09BRUc7SUFDSCxhQUFhO1FBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWM7UUFDYixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLENBQUMsR0FBVztRQUNwQixPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxD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LEdBQUcsQ0FBQzthQUNuQixJQUFJLEVBQUUsQ0FBQztRQUVULEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLGFBQWEsQ0FDdEUsSUFBSSxFQUNKLEtBQUssQ0FDTCxDQUFDO0lBQ0gsQ0FBQztDQUNELENBQUM7QUFFRixPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDOUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNqRCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XG5pbXBvcnQgeyBpc05pbCwgaXNWYWxpZEFnZSwgZm9yRWFjaCwgbG9nZ2VyIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgT1dlYkZvcm1FcnJvciBmcm9tICcuL09XZWJGb3JtRXJyb3InO1xuaW1wb3J0IHsgT1dlYkZvcm1BZGFwdGVyLCBPV2ViRm9ybURhdGFFbnRyeVZhbHVlIH0gZnJvbSAnLi9PV2ViRm9ybUFkYXB0ZXInO1xuaW1wb3J0IE9XZWJEYXRlLCB7IE9EYXRlVmFsdWUgfSBmcm9tICcuL3BsdWdpbnMvT1dlYkRhdGUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9XZWJGb3JtRmllbGQge1xuXHRba2V5OiBzdHJpbmddOiB1bmtub3duO1xuXHR2YWx1ZTogYW55O1xuXHRsYWJlbD86IHN0cmluZztcblx0dmFsaWRhdG9yPzogc3RyaW5nIHwgT1dlYkZvcm1GaWVsZFZhbGlkYXRvcjtcbn1cbmV4cG9ydCB0eXBlIE9XZWJGb3JtRmllbGRWYWxpZGF0b3I8VCA9IHVua25vd24+ID0gKFxuXHR2YWx1ZTogVCxcblx0ZmllbGROYW1lOiBzdHJpbmcsXG5cdGNvbnRleHQ6IE9XZWJGb3JtXG4pID0+IHZvaWQ7XG5cbmV4cG9ydCB0eXBlIE9XZWJGb3JtRGF0YSA9IEZvcm1EYXRhIHwgUmVjb3JkPHN0cmluZywgYW55PjtcbmV4cG9ydCB0eXBlIE9XZWJGb3JtRGVmaW5pdGlvbiA9IFJlY29yZDxzdHJpbmcsIE9XZWJGb3JtRmllbGQ+O1xuZXhwb3J0IHR5cGUgT1dlYkZvcm1FcnJvcnMgPSB7IFtrZXk6IHN0cmluZ106IE9XZWJGb3JtRXJyb3JbXSB9O1xuXG5jb25zdCBERUNMQVJFRF9WQUxJREFUT1JTOiB7IFtrZXk6IHN0cmluZ106IE9XZWJGb3JtRmllbGRWYWxpZGF0b3IgfSA9XG5cdE9iamVjdC5jcmVhdGUoe30pO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRm9ybSB7XG5cdHByaXZhdGUgZXJyb3JzOiBPV2ViRm9ybUVycm9ycyA9IHt9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gX2FwcENvbnRleHQgVGhlIGFwcCBjb250ZXh0LlxuXHQgKiBAcGFyYW0gYWRhcHRlciBUaGUgZm9ybS5cblx0ICogQHBhcmFtIHJlcXVpcmVkIFRoZSByZXF1aXJlZCBmaWVsZHMuXG5cdCAqIEBwYXJhbSBleGNsdWRlZCBUaGUgZmllbGRzIHRvIGV4Y2x1ZGUgZnJvbSB2YWxpZGF0aW9uLlxuXHQgKiBAcGFyYW0gY2hlY2tBbGwgV2hlbiB0cnVlIGFsbCBmaWVsZHMgd2lsbCBiZSB2YWxpZGF0ZWQuXG5cdCAqIEBwYXJhbSB2ZXJib3NlIExvZyB3YXJuaW5nLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBfYXBwQ29udGV4dDogT1dlYkFwcCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGFkYXB0ZXI6IE9XZWJGb3JtQWRhcHRlcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IHJlcXVpcmVkOiBzdHJpbmdbXSA9IFtdLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZXhjbHVkZWQ6IHN0cmluZ1tdID0gW10sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjaGVja0FsbDogYm9vbGVhbiA9IGZhbHNlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgdmVyYm9zZTogYm9vbGVhbiA9IGZhbHNlXG5cdCkge31cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYXBwIGNvbnRleHQuXG5cdCAqL1xuXHRnZXRBcHBDb250ZXh0KCk6IE9XZWJBcHAge1xuXHRcdHJldHVybiB0aGlzLl9hcHBDb250ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGZvcm0gYWRhcHRlci5cblx0ICovXG5cdGdldEZvcm1BZGFwdGVyKCk6IE9XZWJGb3JtQWRhcHRlciB7XG5cdFx0cmV0dXJuIHRoaXMuYWRhcHRlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFwcCBjb25maWcuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXlcblx0ICovXG5cdGdldENvbmZpZyhrZXk6IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXBwQ29udGV4dCgpLmNvbmZpZ3MuZ2V0KGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIEZvcm1EYXRhIGNvbnRhaW5pbmcgdGhlIHZhbGlkYXRlZCBmb3JtIGZpZWxkcy5cblx0ICpcblx0ICogQHBhcmFtIGZpZWxkcyBUaGUgZmllbGRzIG5hbWUgbGlzdC4gV2hlbiBlbXB0eSBhbGwgZmllbGQgd2lsbCBiZSBhZGRlZCB0byB0aGUgRm9ybURhdGEuXG5cdCAqL1xuXHRnZXRGb3JtRGF0YShmaWVsZHM6IHN0cmluZ1tdID0gW10pOiBGb3JtRGF0YSB7XG5cdFx0cmV0dXJuIHRoaXMuYWRhcHRlci50b0Zvcm1EYXRhKGZpZWxkcyk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIGdpdmVuIGZpZWxkIG5hbWUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRGaWVsZFZhbHVlPFQgPSBudWxsIHwgT1dlYkZvcm1EYXRhRW50cnlWYWx1ZT4obmFtZTogc3RyaW5nKTogVCB7XG5cdFx0cmV0dXJuIHRoaXMuYWRhcHRlci5nZXRGaWVsZFZhbHVlPFQ+KG5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgYSBnaXZlbiBmaWVsZCB2YWx1ZS5cblx0ICogQHBhcmFtIG5hbWVcblx0ICogQHBhcmFtIHZhbHVlXG5cdCAqL1xuXHRzZXRGaWVsZFZhbHVlKG5hbWU6IHN0cmluZywgdmFsdWU6IE9XZWJGb3JtRGF0YUVudHJ5VmFsdWUpOiB0aGlzIHtcblx0XHR0aGlzLmFkYXB0ZXIuc2V0RmllbGRWYWx1ZShuYW1lLCB2YWx1ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBlcnJvciBtYXAuXG5cdCAqL1xuXHRnZXRFcnJvcnMoKTogT1dlYkZvcm1FcnJvcnMge1xuXHRcdHJldHVybiB0aGlzLmVycm9ycztcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGZvcm0gdmFsaWRhdGlvbi5cblx0ICovXG5cdHZhbGlkYXRlKHNob3dEaWFsb2cgPSB0cnVlKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgZmllbGROYW1lczogc3RyaW5nW10gPSB0aGlzLmFkYXB0ZXIuZ2V0RmllbGRzTmFtZXMoKTtcblx0XHRsZXQgYyA9IC0xLFxuXHRcdFx0bmFtZTtcblxuXHRcdC8vIGVtcHR5IGVycm9yIGxpc3Rcblx0XHR0aGlzLmVycm9ycyA9IHt9O1xuXG5cdFx0d2hpbGUgKChuYW1lID0gZmllbGROYW1lc1srK2NdKSkge1xuXHRcdFx0aWYgKHRoaXMuZXhjbHVkZWQuaW5kZXhPZihuYW1lKSA8IDApIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0RmllbGRWYWx1ZShuYW1lKTtcblxuXHRcdFx0XHRcdGlmICghaXNOaWwodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB2YWxpZGF0b3JzID0gdGhpcy5hZGFwdGVyLmdldEZpZWxkVmFsaWRhdG9ycyhuYW1lKTtcblxuXHRcdFx0XHRcdFx0aWYgKHZhbGlkYXRvcnMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdmFsaWRhdG9ycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdHZhbGlkYXRvcnNbaV0odmFsdWUsIG5hbWUsIHRoaXMpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMudmVyYm9zZSkge1xuXHRcdFx0XHRcdFx0XHRsb2dnZXIud2Fybihcblx0XHRcdFx0XHRcdFx0XHRgW09XZWJGb3JtXSBubyB2YWxpZGF0b3JzIGRlZmluZWQgZm9yIGZpZWxkICcke25hbWV9Jy5gXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh+dGhpcy5yZXF1aXJlZC5pbmRleE9mKG5hbWUpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmFzc2VydChmYWxzZSwgJ09aX0ZPUk1fQ09OVEFJTlNfRU1QVFlfRklFTEQnLCB7XG5cdFx0XHRcdFx0XHRcdGxhYmVsOiB0aGlzLmFkYXB0ZXIuZ2V0RmllbGRMYWJlbChuYW1lKSxcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZTogYW55KSB7XG5cdFx0XHRcdFx0aWYgKGUuaXNGb3JtRXJyb3IpIHtcblx0XHRcdFx0XHRcdGlmICghdGhpcy5lcnJvcnNbbmFtZV0pIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5lcnJvcnNbbmFtZV0gPSBbXTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dGhpcy5lcnJvcnNbbmFtZV0ucHVzaChlKTtcblxuXHRcdFx0XHRcdFx0aWYgKCF0aGlzLmNoZWNrQWxsICYmIHNob3dEaWFsb2cpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5nZXRBcHBDb250ZXh0KCkudmlldy5kaWFsb2coe1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6ICdlcnJvcicsXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogZS5tZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGE6IGUuZGF0YSxcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmVycm9ycykubGVuZ3RoID09PSAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ha2UgYW4gYXNzZXJ0aW9ucy5cblx0ICpcblx0ICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgYXNzZXJ0aW9uIHByZWRpY2F0ZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2Ugd2hlbiB0aGUgcHJlZGljYXRlIGlzIGZhbHNlLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgZXJyb3IgZGF0YS5cblx0ICovXG5cdGFzc2VydChcblx0XHRwcmVkaWNhdGU6IHVua25vd24sXG5cdFx0bWVzc2FnZTogc3RyaW5nLFxuXHRcdGRhdGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuXHQpOiB0aGlzIHtcblx0XHRpZiAoIXByZWRpY2F0ZSkge1xuXHRcdFx0dGhyb3cgbmV3IE9XZWJGb3JtRXJyb3IobWVzc2FnZSwgZGF0YSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogRGVjbGFyZSBhIGZpZWxkIHZhbGlkYXRvci5cblx0ICpcblx0ICogQHBhcmFtIG5hbWUgVGhlIHZhbGlkYXRvciBuYW1lLlxuXHQgKiBAcGFyYW0gdmFsaWRhdG9yIFRoZSB2YWxpZGF0b3IgZnVuY3Rpb24uXG5cdCAqL1xuXHRzdGF0aWMgZGVjbGFyZUZpZWxkVmFsaWRhdG9yKFxuXHRcdG5hbWU6IHN0cmluZyxcblx0XHR2YWxpZGF0b3I6IE9XZWJGb3JtRmllbGRWYWxpZGF0b3Jcblx0KTogdm9pZCB7XG5cdFx0aWYgKG5hbWUgaW4gREVDTEFSRURfVkFMSURBVE9SUykge1xuXHRcdFx0bG9nZ2VyLndhcm4oYFtPV2ViRm9ybV0gZmllbGQgdmFsaWRhdG9yIFwiJHtuYW1lfVwiIG92ZXJ3cml0dGVuLmApO1xuXHRcdH1cblxuXHRcdERFQ0xBUkVEX1ZBTElEQVRPUlNbbmFtZV0gPSB2YWxpZGF0b3I7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBmaWVsZCB2YWxpZGF0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lIFRoZSBmaWVsZCB2YWxpZGF0b3IgbmFtZS5cblx0ICovXG5cdHN0YXRpYyBnZXREZWNsYXJlZFZhbGlkYXRvcihcblx0XHRuYW1lOiBzdHJpbmdcblx0KTogT1dlYkZvcm1GaWVsZFZhbGlkYXRvciB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIERFQ0xBUkVEX1ZBTElEQVRPUlNbbmFtZV07XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRWYWxpZGF0b3JzID0ge1xuXHRjb2RlOiAodmFsdWU6IHVua25vd24sIF9uYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybSkgPT4ge1xuXHRcdGNvbnN0IGNvZGVSZWcgPSBuZXcgUmVnRXhwKGZ2LmdldENvbmZpZygnT1pfQ09ERV9SRUcnKSk7XG5cdFx0ZnYuYXNzZXJ0KFxuXHRcdFx0Y29kZVJlZy50ZXN0KGlzTmlsKHZhbHVlKSA/ICcnIDogU3RyaW5nKHZhbHVlKSksXG5cdFx0XHQnT1pfQVVUSF9DT0RFX0lOVkFMSUQnXG5cdFx0KTtcblx0fSxcblx0dW5hbWU6ICh2YWx1ZTogdW5rbm93biwgbmFtZTogc3RyaW5nLCBmdjogT1dlYkZvcm0pID0+IHtcblx0XHRjb25zdCB2OiBzdHJpbmcgPSAoaXNOaWwodmFsdWUpID8gJycgOiBTdHJpbmcodmFsdWUpKVxuXHRcdFx0LnJlcGxhY2UoL1xccysvZywgJyAnKVxuXHRcdFx0LnRyaW0oKTtcblxuXHRcdGZ2LmFzc2VydChcblx0XHRcdHYubGVuZ3RoID49IGZ2LmdldENvbmZpZygnT1pfVVNFUl9OQU1FX01JTl9MRU5HVEgnKSxcblx0XHRcdCdPWl9GSUVMRF9VU0VSX05BTUVfVE9PX1NIT1JUJ1xuXHRcdClcblx0XHRcdC5hc3NlcnQoXG5cdFx0XHRcdHYubGVuZ3RoIDw9IGZ2LmdldENvbmZpZygnT1pfVVNFUl9OQU1FX01BWF9MRU5HVEgnKSxcblx0XHRcdFx0J09aX0ZJRUxEX1VTRVJfTkFNRV9UT09fTE9ORydcblx0XHRcdClcblx0XHRcdC5zZXRGaWVsZFZhbHVlKG5hbWUsIHYpO1xuXHR9LFxuXHRsb2dpbl9wYXNzOiAodmFsdWU6IHVua25vd24sIF9uYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybSkgPT4ge1xuXHRcdGNvbnN0IHBhc3MgPSBpc05pbCh2YWx1ZSkgPyAnJyA6IFN0cmluZyh2YWx1ZSksXG5cdFx0XHRtaW4gPSBmdi5nZXRDb25maWcoJ09aX1BBU1NfTUlOX0xFTkdUSCcpLFxuXHRcdFx0bWF4ID0gZnYuZ2V0Q29uZmlnKCdPWl9QQVNTX01BWF9MRU5HVEgnKTtcblx0XHRmdi5hc3NlcnQocGFzcy5sZW5ndGggPj0gbWluLCAnT1pfRklFTERfUEFTU19JTlZBTElEJykuYXNzZXJ0KFxuXHRcdFx0cGFzcy5sZW5ndGggPD0gbWF4LFxuXHRcdFx0J09aX0ZJRUxEX1BBU1NfSU5WQUxJRCdcblx0XHQpO1xuXHR9LFxuXHRwYXNzOiAodmFsdWU6IHVua25vd24sIF9uYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybSkgPT4ge1xuXHRcdGNvbnN0IHBhc3MgPSBpc05pbCh2YWx1ZSkgPyAnJyA6IFN0cmluZyh2YWx1ZSksXG5cdFx0XHRtaW4gPSBmdi5nZXRDb25maWcoJ09aX1BBU1NfTUlOX0xFTkdUSCcpLFxuXHRcdFx0bWF4ID0gZnYuZ2V0Q29uZmlnKCdPWl9QQVNTX01BWF9MRU5HVEgnKTtcblx0XHRmdi5hc3NlcnQocGFzcy5sZW5ndGggPj0gbWluLCAnT1pfRklFTERfUEFTU19UT09fU0hPUlQnLCB7XG5cdFx0XHRtaW4sXG5cdFx0XHRtYXgsXG5cdFx0fSkuYXNzZXJ0KHBhc3MubGVuZ3RoIDw9IG1heCwgJ09aX0ZJRUxEX1BBU1NfVE9PX0xPTkcnLCB7XG5cdFx0XHRtaW4sXG5cdFx0XHRtYXgsXG5cdFx0fSk7XG5cdH0sXG5cdHBhc3NfdmVyaWZ5OiAodmFsdWU6IHVua25vd24sIF9uYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybSkgPT4ge1xuXHRcdGZ2LmFzc2VydChcblx0XHRcdHZhbHVlID09PSBmdi5nZXRGaWVsZFZhbHVlKCdwYXNzJyksXG5cdFx0XHQnT1pfRklFTERfUEFTU19BTkRfVlBBU1NfTk9UX0VRVUFMJ1xuXHRcdCk7XG5cdH0sXG5cdGJpcnRoX2RhdGU6ICh2YWx1ZTogdW5rbm93biwgbmFtZTogc3RyaW5nLCBmdjogT1dlYkZvcm0pID0+IHtcblx0XHRjb25zdCBvZCA9IG5ldyBPV2ViRGF0ZShcblx0XHRcdFx0ZnYuZ2V0QXBwQ29udGV4dCgpLFxuXHRcdFx0XHRpc05pbCh2YWx1ZSkgPyB1bmRlZmluZWQgOiAodmFsdWUgYXMgT0RhdGVWYWx1ZSlcblx0XHRcdCksXG5cdFx0XHRkYXRlID0gb2QuZGVzY3JpYmUoKSxcblx0XHRcdG1pbkFnZSA9IGZ2LmdldENvbmZpZygnT1pfVVNFUl9NSU5fQUdFJyksXG5cdFx0XHRtYXhBZ2UgPSBmdi5nZXRDb25maWcoJ09aX1VTRVJfTUFYX0FHRScpLFxuXHRcdFx0aXNWYWxpZCA9XG5cdFx0XHRcdGRhdGUgJiYgaXNWYWxpZEFnZShkYXRlLmQsIHBhcnNlSW50KGRhdGUubW0pLCBkYXRlLlksIG1pbkFnZSwgbWF4QWdlKTtcblxuXHRcdGZ2LmFzc2VydChpc1ZhbGlkLCAnT1pfRklFTERfQklSVEhfREFURV9JTlZBTElEJywge1xuXHRcdFx0aW5wdXQ6IHZhbHVlLFxuXHRcdFx0bWluOiBtaW5BZ2UsXG5cdFx0XHRtYXg6IG1heEFnZSxcblx0XHR9KTtcblxuXHRcdGRhdGUgJiYgZnYuc2V0RmllbGRWYWx1ZShuYW1lLCBgJHtkYXRlLll9LSR7ZGF0ZS5tbX0tJHtkYXRlLmR9YCk7XG5cdH0sXG5cdGdlbmRlcjogKHZhbHVlOiB1bmtub3duLCBfbmFtZTogc3RyaW5nLCBmdjogT1dlYkZvcm0pID0+IHtcblx0XHRjb25zdCBnZW5kZXJzID0gZnYuZ2V0Q29uZmlnKCdPWl9VU0VSX0FMTE9XRURfR0VOREVSUycpO1xuXHRcdGZ2LmFzc2VydChnZW5kZXJzLmluZGV4T2YodmFsdWUpID49IDAsICdPWl9GSUVMRF9HRU5ERVJfSU5WQUxJRCcpO1xuXHR9LFxuXHRlbWFpbDogKHZhbHVlOiB1bmtub3duLCBuYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybSkgPT4ge1xuXHRcdC8qKlxuXHRcdCAqIEVtYWlsIG1hdGNoaW5nIHJlZ2V4XG5cdFx0ICpcblx0XHQgKiBzb3VyY2U6IGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw1L2Zvcm1zLmh0bWwjdmFsaWQtZS1tYWlsLWFkZHJlc3Ncblx0XHQgKiAgICAgICAgLSBUTEQgbm90IHJlcXVpcmVkXG5cdFx0ICogICAgICAgICAgICAvXlthLXpBLVowLTkuISMkJSYnKisvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykqJC9cblx0XHQgKiAgICAgICAgLSBtdXN0IGhhdmUgVExEXG5cdFx0ICogICAgICAgICAgICAvXlthLXpBLVowLTkuISMkJSYnKisvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykrJC9cblx0XHQgKi9cblx0XHRjb25zdCBlbWFpbFJlZyA9XG5cdFx0XHQvXlthLXpBLVowLTkuISMkJSYnKisvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykrJC87XG5cdFx0Y29uc3QgZW1haWwgPSAoaXNOaWwodmFsdWUpID8gJycgOiBTdHJpbmcodmFsdWUpKVxuXHRcdFx0LnJlcGxhY2UoL1xccy9nLCAnICcpXG5cdFx0XHQudHJpbSgpO1xuXG5cdFx0ZnYuYXNzZXJ0KGVtYWlsUmVnLnRlc3QoZW1haWwpLCAnT1pfRklFTERfRU1BSUxfSU5WQUxJRCcpLnNldEZpZWxkVmFsdWUoXG5cdFx0XHRuYW1lLFxuXHRcdFx0ZW1haWxcblx0XHQpO1xuXHR9LFxufTtcblxuZm9yRWFjaChkZWZhdWx0VmFsaWRhdG9ycywgKHZhbGlkYXRvciwgbmFtZSkgPT4ge1xuXHRPV2ViRm9ybS5kZWNsYXJlRmllbGRWYWxpZGF0b3IobmFtZSwgdmFsaWRhdG9yKTtcbn0pO1xuIl19