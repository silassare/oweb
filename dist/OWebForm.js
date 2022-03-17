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
    constructor(_appContext, adapter, required = [], excluded = [], checkAll = false, verbose = false) {
        this._appContext = _appContext;
        this.adapter = adapter;
        this.required = required;
        this.excluded = excluded;
        this.checkAll = checkAll;
        this.verbose = verbose;
    }
    getAppContext() {
        return this._appContext;
    }
    getFormAdapter() {
        return this.adapter;
    }
    getConfig(key) {
        return this.getAppContext().configs.get(key);
    }
    getFormData(fields = []) {
        return this.adapter.toFormData(fields);
    }
    getFieldValue(name) {
        return this.adapter.getFieldValue(name);
    }
    setFieldValue(name, value) {
        this.adapter.setFieldValue(name, value);
        return this;
    }
    getErrors() {
        return this.errors;
    }
    validate(showDialog = true) {
        const fieldNames = this.adapter.getFieldsNames();
        let c = -1, name;
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
                            logger.warn(`[OWebFormValidator] no validators defined for field '${name}'.`);
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
    assert(predicate, message, data) {
        if (!predicate) {
            throw new OWebFormError(message, data);
        }
        return this;
    }
    static declareFieldValidator(name, validator) {
        if (name in DECLARED_VALIDATORS) {
            logger.warn(`[OWebFormValidator] field validator "${name}" overwritten.`);
        }
        DECLARED_VALIDATORS[name] = validator;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUM3RCxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUU1QyxPQUFPLFFBQXdCLE1BQU0sb0JBQW9CLENBQUM7QUFrQjFELE1BQU0sbUJBQW1CLEdBQ3hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFbkIsTUFBTSxDQUFDLE9BQU8sT0FBTyxRQUFRO0lBWVY7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBaEJWLE1BQU0sR0FBbUIsRUFBRSxDQUFDO0lBVXBDLFlBQ2tCLFdBQW9CLEVBQ3BCLE9BQXdCLEVBQ3hCLFdBQXFCLEVBQUUsRUFDdkIsV0FBcUIsRUFBRSxFQUN2QixXQUFvQixLQUFLLEVBQ3pCLFVBQW1CLEtBQUs7UUFMeEIsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFDcEIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFDeEIsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUN2QixhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ3ZCLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQ3pCLFlBQU8sR0FBUCxPQUFPLENBQWlCO0lBQ3ZDLENBQUM7SUFLSixhQUFhO1FBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ3pCLENBQUM7SUFLRCxjQUFjO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3JCLENBQUM7SUFPRCxTQUFTLENBQUMsR0FBVztRQUNwQixPQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFPRCxXQUFXLENBQUMsU0FBbUIsRUFBRTtRQUNoQyxPQUFP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aUIsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUM5QyxRQUFRLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ2pELENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCB7IGlzTmlsLCBpc1ZhbGlkQWdlLCBmb3JFYWNoLCBsb2dnZXIgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBPV2ViRm9ybUVycm9yIGZyb20gJy4vT1dlYkZvcm1FcnJvcic7XG5pbXBvcnQgeyBPV2ViRm9ybUFkYXB0ZXIsIE9XZWJGb3JtRGF0YUVudHJ5VmFsdWUgfSBmcm9tICcuL09XZWJGb3JtQWRhcHRlcic7XG5pbXBvcnQgT1dlYkRhdGUsIHsgT0RhdGVWYWx1ZSB9IGZyb20gJy4vcGx1Z2lucy9PV2ViRGF0ZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT1dlYkZvcm1GaWVsZCB7XG5cdFtrZXk6IHN0cmluZ106IHVua25vd247XG5cdHZhbHVlOiBhbnk7XG5cdGxhYmVsPzogc3RyaW5nO1xuXHR2YWxpZGF0b3I/OiBzdHJpbmcgfCBPV2ViRm9ybUZpZWxkVmFsaWRhdG9yO1xufVxuZXhwb3J0IHR5cGUgT1dlYkZvcm1GaWVsZFZhbGlkYXRvcjxUID0gdW5rbm93bj4gPSAoXG5cdHZhbHVlOiBULFxuXHRmaWVsZE5hbWU6IHN0cmluZyxcblx0Y29udGV4dDogT1dlYkZvcm1cbikgPT4gdm9pZDtcblxuZXhwb3J0IHR5cGUgT1dlYkZvcm1EYXRhID0gRm9ybURhdGEgfCBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuZXhwb3J0IHR5cGUgT1dlYkZvcm1PcHRpb25zID0gUmVjb3JkPHN0cmluZywgT1dlYkZvcm1GaWVsZD47XG5leHBvcnQgdHlwZSBPV2ViRm9ybUVycm9ycyA9IHsgW2tleTogc3RyaW5nXTogT1dlYkZvcm1FcnJvcltdIH07XG5cbmNvbnN0IERFQ0xBUkVEX1ZBTElEQVRPUlM6IHsgW2tleTogc3RyaW5nXTogT1dlYkZvcm1GaWVsZFZhbGlkYXRvciB9ID1cblx0T2JqZWN0LmNyZWF0ZSh7fSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJGb3JtIHtcblx0cHJpdmF0ZSBlcnJvcnM6IE9XZWJGb3JtRXJyb3JzID0ge307XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBfYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBhZGFwdGVyIFRoZSBmb3JtLlxuXHQgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVkIGZpZWxkcy5cblx0ICogQHBhcmFtIGV4Y2x1ZGVkIFRoZSBmaWVsZHMgdG8gZXhjbHVkZSBmcm9tIHZhbGlkYXRpb24uXG5cdCAqIEBwYXJhbSBjaGVja0FsbCBXaGVuIHRydWUgYWxsIGZpZWxkcyB3aWxsIGJlIHZhbGlkYXRlZC5cblx0ICogQHBhcmFtIHZlcmJvc2UgTG9nIHdhcm5pbmcuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IF9hcHBDb250ZXh0OiBPV2ViQXBwLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgYWRhcHRlcjogT1dlYkZvcm1BZGFwdGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcmVxdWlyZWQ6IHN0cmluZ1tdID0gW10sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBleGNsdWRlZDogc3RyaW5nW10gPSBbXSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNoZWNrQWxsOiBib29sZWFuID0gZmFsc2UsXG5cdFx0cHJpdmF0ZSByZWFkb25seSB2ZXJib3NlOiBib29sZWFuID0gZmFsc2Vcblx0KSB7fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhcHAgY29udGV4dC5cblx0ICovXG5cdGdldEFwcENvbnRleHQoKTogT1dlYkFwcCB7XG5cdFx0cmV0dXJuIHRoaXMuX2FwcENvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZm9ybSBhZGFwdGVyLlxuXHQgKi9cblx0Z2V0Rm9ybUFkYXB0ZXIoKTogT1dlYkZvcm1BZGFwdGVyIHtcblx0XHRyZXR1cm4gdGhpcy5hZGFwdGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYXBwIGNvbmZpZy5cblx0ICpcblx0ICogQHBhcmFtIGtleVxuXHQgKi9cblx0Z2V0Q29uZmlnKGtleTogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5nZXRBcHBDb250ZXh0KCkuY29uZmlncy5nZXQoa2V5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgRm9ybURhdGEgY29udGFpbmluZyB0aGUgdmFsaWRhdGVkIGZvcm0gZmllbGRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmllbGRzIFRoZSBmaWVsZHMgbmFtZSBsaXN0LiBXaGVuIGVtcHR5IGFsbCBmaWVsZCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBGb3JtRGF0YS5cblx0ICovXG5cdGdldEZvcm1EYXRhKGZpZWxkczogc3RyaW5nW10gPSBbXSk6IEZvcm1EYXRhIHtcblx0XHRyZXR1cm4gdGhpcy5hZGFwdGVyLnRvRm9ybURhdGEoZmllbGRzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgZ2l2ZW4gZmllbGQgbmFtZSB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIG5hbWVcblx0ICovXG5cdGdldEZpZWxkVmFsdWU8VCA9IG51bGwgfCBPV2ViRm9ybURhdGFFbnRyeVZhbHVlPihuYW1lOiBzdHJpbmcpOiBUIHtcblx0XHRyZXR1cm4gdGhpcy5hZGFwdGVyLmdldEZpZWxkVmFsdWU8VD4obmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhIGdpdmVuIGZpZWxkIHZhbHVlLlxuXHQgKiBAcGFyYW0gbmFtZVxuXHQgKiBAcGFyYW0gdmFsdWVcblx0ICovXG5cdHNldEZpZWxkVmFsdWUobmFtZTogc3RyaW5nLCB2YWx1ZTogT1dlYkZvcm1EYXRhRW50cnlWYWx1ZSk6IHRoaXMge1xuXHRcdHRoaXMuYWRhcHRlci5zZXRGaWVsZFZhbHVlKG5hbWUsIHZhbHVlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVycm9yIG1hcC5cblx0ICovXG5cdGdldEVycm9ycygpOiBPV2ViRm9ybUVycm9ycyB7XG5cdFx0cmV0dXJuIHRoaXMuZXJyb3JzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgZm9ybSB2YWxpZGF0aW9uLlxuXHQgKi9cblx0dmFsaWRhdGUoc2hvd0RpYWxvZyA9IHRydWUpOiBib29sZWFuIHtcblx0XHRjb25zdCBmaWVsZE5hbWVzOiBzdHJpbmdbXSA9IHRoaXMuYWRhcHRlci5nZXRGaWVsZHNOYW1lcygpO1xuXHRcdGxldCBjID0gLTEsXG5cdFx0XHRuYW1lO1xuXG5cdFx0Ly8gZW1wdHkgZXJyb3IgbGlzdFxuXHRcdHRoaXMuZXJyb3JzID0ge307XG5cblx0XHR3aGlsZSAoKG5hbWUgPSBmaWVsZE5hbWVzWysrY10pKSB7XG5cdFx0XHRpZiAodGhpcy5leGNsdWRlZC5pbmRleE9mKG5hbWUpIDwgMCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gdGhpcy5nZXRGaWVsZFZhbHVlKG5hbWUpO1xuXG5cdFx0XHRcdFx0aWYgKCFpc05pbCh2YWx1ZSkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHZhbGlkYXRvcnMgPSB0aGlzLmFkYXB0ZXIuZ2V0RmllbGRWYWxpZGF0b3JzKG5hbWUpO1xuXG5cdFx0XHRcdFx0XHRpZiAodmFsaWRhdG9ycy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB2YWxpZGF0b3JzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFsaWRhdG9yc1tpXSh2YWx1ZSwgbmFtZSwgdGhpcyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAodGhpcy52ZXJib3NlKSB7XG5cdFx0XHRcdFx0XHRcdGxvZ2dlci53YXJuKFxuXHRcdFx0XHRcdFx0XHRcdGBbT1dlYkZvcm1WYWxpZGF0b3JdIG5vIHZhbGlkYXRvcnMgZGVmaW5lZCBmb3IgZmllbGQgJyR7bmFtZX0nLmBcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKH50aGlzLnJlcXVpcmVkLmluZGV4T2YobmFtZSkpIHtcblx0XHRcdFx0XHRcdHRoaXMuYXNzZXJ0KGZhbHNlLCAnT1pfRk9STV9DT05UQUlOU19FTVBUWV9GSUVMRCcsIHtcblx0XHRcdFx0XHRcdFx0bGFiZWw6IHRoaXMuYWRhcHRlci5nZXRGaWVsZExhYmVsKG5hbWUpLFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAoZS5pc0Zvcm1FcnJvcikge1xuXHRcdFx0XHRcdFx0aWYgKCF0aGlzLmVycm9yc1tuYW1lXSkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmVycm9yc1tuYW1lXSA9IFtdO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR0aGlzLmVycm9yc1tuYW1lXS5wdXNoKGUpO1xuXG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMuY2hlY2tBbGwgJiYgc2hvd0RpYWxvZykge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmdldEFwcENvbnRleHQoKS52aWV3LmRpYWxvZyh7XG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogJ2Vycm9yJyxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBlLm1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTogZS5kYXRhLFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRocm93IGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuZXJyb3JzKS5sZW5ndGggPT09IDA7XG5cdH1cblxuXHQvKipcblx0ICogTWFrZSBhbiBhc3NlcnRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJlZGljYXRlIFRoZSBhc3NlcnRpb24gcHJlZGljYXRlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZSB3aGVuIHRoZSBwcmVkaWNhdGUgaXMgZmFsc2UuXG5cdCAqIEBwYXJhbSBkYXRhIFRoZSBlcnJvciBkYXRhLlxuXHQgKi9cblx0YXNzZXJ0KFxuXHRcdHByZWRpY2F0ZTogdW5rbm93bixcblx0XHRtZXNzYWdlOiBzdHJpbmcsXG5cdFx0ZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG5cdCk6IHRoaXMge1xuXHRcdGlmICghcHJlZGljYXRlKSB7XG5cdFx0XHR0aHJvdyBuZXcgT1dlYkZvcm1FcnJvcihtZXNzYWdlLCBkYXRhKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWNsYXJlIGEgZmllbGQgdmFsaWRhdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZSBUaGUgdmFsaWRhdG9yIG5hbWUuXG5cdCAqIEBwYXJhbSB2YWxpZGF0b3IgVGhlIHZhbGlkYXRvciBmdW5jdGlvbi5cblx0ICovXG5cdHN0YXRpYyBkZWNsYXJlRmllbGRWYWxpZGF0b3IoXG5cdFx0bmFtZTogc3RyaW5nLFxuXHRcdHZhbGlkYXRvcjogT1dlYkZvcm1GaWVsZFZhbGlkYXRvclxuXHQpOiB2b2lkIHtcblx0XHRpZiAobmFtZSBpbiBERUNMQVJFRF9WQUxJREFUT1JTKSB7XG5cdFx0XHRsb2dnZXIud2FybihgW09XZWJGb3JtVmFsaWRhdG9yXSBmaWVsZCB2YWxpZGF0b3IgXCIke25hbWV9XCIgb3ZlcndyaXR0ZW4uYCk7XG5cdFx0fVxuXG5cdFx0REVDTEFSRURfVkFMSURBVE9SU1tuYW1lXSA9IHZhbGlkYXRvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGZpZWxkIHZhbGlkYXRvci5cblx0ICpcblx0ICogQHBhcmFtIG5hbWUgVGhlIGZpZWxkIHZhbGlkYXRvciBuYW1lLlxuXHQgKi9cblx0c3RhdGljIGdldERlY2xhcmVkVmFsaWRhdG9yKFxuXHRcdG5hbWU6IHN0cmluZ1xuXHQpOiBPV2ViRm9ybUZpZWxkVmFsaWRhdG9yIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gREVDTEFSRURfVkFMSURBVE9SU1tuYW1lXTtcblx0fVxufVxuXG5leHBvcnQgY29uc3QgZGVmYXVsdFZhbGlkYXRvcnMgPSB7XG5cdGNvZGU6ICh2YWx1ZTogdW5rbm93biwgX25hbWU6IHN0cmluZywgZnY6IE9XZWJGb3JtKSA9PiB7XG5cdFx0Y29uc3QgY29kZVJlZyA9IG5ldyBSZWdFeHAoZnYuZ2V0Q29uZmlnKCdPWl9DT0RFX1JFRycpKTtcblx0XHRmdi5hc3NlcnQoXG5cdFx0XHRjb2RlUmVnLnRlc3QoaXNOaWwodmFsdWUpID8gJycgOiBTdHJpbmcodmFsdWUpKSxcblx0XHRcdCdPWl9BVVRIX0NPREVfSU5WQUxJRCdcblx0XHQpO1xuXHR9LFxuXHR1bmFtZTogKHZhbHVlOiB1bmtub3duLCBuYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybSkgPT4ge1xuXHRcdGNvbnN0IHY6IHN0cmluZyA9IChpc05pbCh2YWx1ZSkgPyAnJyA6IFN0cmluZyh2YWx1ZSkpXG5cdFx0XHQucmVwbGFjZSgvXFxzKy9nLCAnICcpXG5cdFx0XHQudHJpbSgpO1xuXG5cdFx0ZnYuYXNzZXJ0KFxuXHRcdFx0di5sZW5ndGggPj0gZnYuZ2V0Q29uZmlnKCdPWl9VU0VSX05BTUVfTUlOX0xFTkdUSCcpLFxuXHRcdFx0J09aX0ZJRUxEX1VTRVJfTkFNRV9UT09fU0hPUlQnXG5cdFx0KVxuXHRcdFx0LmFzc2VydChcblx0XHRcdFx0di5sZW5ndGggPD0gZnYuZ2V0Q29uZmlnKCdPWl9VU0VSX05BTUVfTUFYX0xFTkdUSCcpLFxuXHRcdFx0XHQnT1pfRklFTERfVVNFUl9OQU1FX1RPT19MT05HJ1xuXHRcdFx0KVxuXHRcdFx0LnNldEZpZWxkVmFsdWUobmFtZSwgdik7XG5cdH0sXG5cdGxvZ2luX3Bhc3M6ICh2YWx1ZTogdW5rbm93biwgX25hbWU6IHN0cmluZywgZnY6IE9XZWJGb3JtKSA9PiB7XG5cdFx0Y29uc3QgcGFzcyA9IGlzTmlsKHZhbHVlKSA/ICcnIDogU3RyaW5nKHZhbHVlKSxcblx0XHRcdG1pbiA9IGZ2LmdldENvbmZpZygnT1pfUEFTU19NSU5fTEVOR1RIJyksXG5cdFx0XHRtYXggPSBmdi5nZXRDb25maWcoJ09aX1BBU1NfTUFYX0xFTkdUSCcpO1xuXHRcdGZ2LmFzc2VydChwYXNzLmxlbmd0aCA+PSBtaW4sICdPWl9GSUVMRF9QQVNTX0lOVkFMSUQnKS5hc3NlcnQoXG5cdFx0XHRwYXNzLmxlbmd0aCA8PSBtYXgsXG5cdFx0XHQnT1pfRklFTERfUEFTU19JTlZBTElEJ1xuXHRcdCk7XG5cdH0sXG5cdHBhc3M6ICh2YWx1ZTogdW5rbm93biwgX25hbWU6IHN0cmluZywgZnY6IE9XZWJGb3JtKSA9PiB7XG5cdFx0Y29uc3QgcGFzcyA9IGlzTmlsKHZhbHVlKSA/ICcnIDogU3RyaW5nKHZhbHVlKSxcblx0XHRcdG1pbiA9IGZ2LmdldENvbmZpZygnT1pfUEFTU19NSU5fTEVOR1RIJyksXG5cdFx0XHRtYXggPSBmdi5nZXRDb25maWcoJ09aX1BBU1NfTUFYX0xFTkdUSCcpO1xuXHRcdGZ2LmFzc2VydChwYXNzLmxlbmd0aCA+PSBtaW4sICdPWl9GSUVMRF9QQVNTX1RPT19TSE9SVCcsIHtcblx0XHRcdG1pbixcblx0XHRcdG1heCxcblx0XHR9KS5hc3NlcnQocGFzcy5sZW5ndGggPD0gbWF4LCAnT1pfRklFTERfUEFTU19UT09fTE9ORycsIHtcblx0XHRcdG1pbixcblx0XHRcdG1heCxcblx0XHR9KTtcblx0fSxcblx0cGFzc192ZXJpZnk6ICh2YWx1ZTogdW5rbm93biwgX25hbWU6IHN0cmluZywgZnY6IE9XZWJGb3JtKSA9PiB7XG5cdFx0ZnYuYXNzZXJ0KFxuXHRcdFx0dmFsdWUgPT09IGZ2LmdldEZpZWxkVmFsdWUoJ3Bhc3MnKSxcblx0XHRcdCdPWl9GSUVMRF9QQVNTX0FORF9WUEFTU19OT1RfRVFVQUwnXG5cdFx0KTtcblx0fSxcblx0YmlydGhfZGF0ZTogKHZhbHVlOiB1bmtub3duLCBuYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybSkgPT4ge1xuXHRcdGNvbnN0IG9kID0gbmV3IE9XZWJEYXRlKFxuXHRcdFx0XHRmdi5nZXRBcHBDb250ZXh0KCksXG5cdFx0XHRcdGlzTmlsKHZhbHVlKSA/IHVuZGVmaW5lZCA6ICh2YWx1ZSBhcyBPRGF0ZVZhbHVlKVxuXHRcdFx0KSxcblx0XHRcdGRhdGUgPSBvZC5kZXNjcmliZSgpLFxuXHRcdFx0bWluQWdlID0gZnYuZ2V0Q29uZmlnKCdPWl9VU0VSX01JTl9BR0UnKSxcblx0XHRcdG1heEFnZSA9IGZ2LmdldENvbmZpZygnT1pfVVNFUl9NQVhfQUdFJyksXG5cdFx0XHRpc1ZhbGlkID1cblx0XHRcdFx0ZGF0ZSAmJiBpc1ZhbGlkQWdlKGRhdGUuZCwgcGFyc2VJbnQoZGF0ZS5tbSksIGRhdGUuWSwgbWluQWdlLCBtYXhBZ2UpO1xuXG5cdFx0ZnYuYXNzZXJ0KGlzVmFsaWQsICdPWl9GSUVMRF9CSVJUSF9EQVRFX0lOVkFMSUQnLCB7XG5cdFx0XHRpbnB1dDogdmFsdWUsXG5cdFx0XHRtaW46IG1pbkFnZSxcblx0XHRcdG1heDogbWF4QWdlLFxuXHRcdH0pO1xuXG5cdFx0ZGF0ZSAmJiBmdi5zZXRGaWVsZFZhbHVlKG5hbWUsIGAke2RhdGUuWX0tJHtkYXRlLm1tfS0ke2RhdGUuZH1gKTtcblx0fSxcblx0Z2VuZGVyOiAodmFsdWU6IHVua25vd24sIF9uYW1lOiBzdHJpbmcsIGZ2OiBPV2ViRm9ybSkgPT4ge1xuXHRcdGNvbnN0IGdlbmRlcnMgPSBmdi5nZXRDb25maWcoJ09aX1VTRVJfQUxMT1dFRF9HRU5ERVJTJyk7XG5cdFx0ZnYuYXNzZXJ0KGdlbmRlcnMuaW5kZXhPZih2YWx1ZSkgPj0gMCwgJ09aX0ZJRUxEX0dFTkRFUl9JTlZBTElEJyk7XG5cdH0sXG5cdGVtYWlsOiAodmFsdWU6IHVua25vd24sIG5hbWU6IHN0cmluZywgZnY6IE9XZWJGb3JtKSA9PiB7XG5cdFx0LyoqXG5cdFx0ICogRW1haWwgbWF0Y2hpbmcgcmVnZXhcblx0XHQgKlxuXHRcdCAqIHNvdXJjZTogaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbDUvZm9ybXMuaHRtbCN2YWxpZC1lLW1haWwtYWRkcmVzc1xuXHRcdCAqICAgICAgICAtIFRMRCBub3QgcmVxdWlyZWRcblx0XHQgKiAgICAgICAgICAgIC9eW2EtekEtWjAtOS4hIyQlJicqKy89P15fYHt8fX4tXStAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSokL1xuXHRcdCAqICAgICAgICAtIG11c3QgaGF2ZSBUTERcblx0XHQgKiAgICAgICAgICAgIC9eW2EtekEtWjAtOS4hIyQlJicqKy89P15fYHt8fX4tXStAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSskL1xuXHRcdCAqL1xuXHRcdGNvbnN0IGVtYWlsUmVnID1cblx0XHRcdC9eW2EtekEtWjAtOS4hIyQlJicqKy89P15fYHt8fX4tXStAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSskLztcblx0XHRjb25zdCBlbWFpbCA9IChpc05pbCh2YWx1ZSkgPyAnJyA6IFN0cmluZyh2YWx1ZSkpXG5cdFx0XHQucmVwbGFjZSgvXFxzL2csICcgJylcblx0XHRcdC50cmltKCk7XG5cblx0XHRmdi5hc3NlcnQoZW1haWxSZWcudGVzdChlbWFpbCksICdPWl9GSUVMRF9FTUFJTF9JTlZBTElEJykuc2V0RmllbGRWYWx1ZShcblx0XHRcdG5hbWUsXG5cdFx0XHRlbWFpbFxuXHRcdCk7XG5cdH0sXG59O1xuXG5mb3JFYWNoKGRlZmF1bHRWYWxpZGF0b3JzLCAodmFsaWRhdG9yLCBuYW1lKSA9PiB7XG5cdE9XZWJGb3JtLmRlY2xhcmVGaWVsZFZhbGlkYXRvcihuYW1lLCB2YWxpZGF0b3IpO1xufSk7XG4iXX0=