import { forEach, isArray, isFunction, isNotEmpty, isString, toArray, } from './utils/Utils';
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
                            console.warn(`[OWebFormValidator] validator '${validatorName}' is not defined, field '${name}' is then considered as safe.`);
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
                if (e.$owebFormError) {
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
        forEach(map, (fn, key) => {
            OWebFormValidator.addFieldValidator(key, fn);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm1WYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYkZvcm1WYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUNOLE9BQU8sRUFDUCxPQUFPLEVBQ1AsVUFBVSxFQUNWLFVBQVUsRUFDVixRQUFRLEVBQ1IsT0FBTyxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBUzVDLE1BQU0sY0FBYyxHQUFzQyxFQUFFLENBQUM7QUFFN0QsTUFBTSxDQUFDLE9BQU8sT0FBTyxpQkFBaUI7SUFLckM7Ozs7OztPQU1HO0lBQ0gsWUFDa0IsVUFBbUIsRUFDbkIsSUFBcUIsRUFDckIsV0FBcUIsRUFBRSxFQUN2QixXQUFxQixFQUFFLEVBQ3ZCLFdBQW9CLEtBQUs7UUFKekIsZUFBVSxHQUFWLFVBQVUsQ0FBUztRQUNuQixTQUFJLEdBQUosSUFBSSxDQUFpQjtRQUNyQixhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ3ZCLGFBQVEsR0FBUixRQUFRLENBQWU7UUFDdkIsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7UUFmbkMsa0JBQWEsR0FBOEIsRUFBRSxDQUFDO1FBQzlDLGFBQVEsR0FBa0IsRUFBRSxDQUFDO1FBZ0JwQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssTUFBTSxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQ2QsdURBQXVELENBQ3ZELENBQUM7U0FDRjtRQUVELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLHNEQUFzRDtRQUVuSCxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNsRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUN0QyxhQUFhLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRXhELElBQUksSUFBSSxFQUFFO2dCQUNULElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLEVBQUU7b0JBQ25DLE1BQU0sSUFBSSxLQUFLLENBQ2Qsa0NBQWtDLGFBQWEsa0NBQWtDLElBQUksdUJBQXVCLENBQzVHLENBQUM7aUJBQ0Y7Z0JBRUQsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxhQUFhLENBQUM7YUFDdEM7UUFDRixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsYUFBYTtRQUNaLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsQ0FBQyxHQUFXO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxXQUFXLENBQUMsU0FBbUIsRUFBRTtRQUNoQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDbEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdkMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsNEJBQTRCO2dCQUNyRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUU7b0JBQzdCLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMvQixDQUFDLENBQUMsQ0FBQzthQUNIO1lBRUQsT0FBTyxRQUFRLENBQUM7U0FDaEI7UUFFRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsSUFBWTtRQUNwQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLElBQVksRUFBRSxLQUFVO1FBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvQixPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWSxDQUFDLElBQVk7UUFDeEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsbUJBQW1CLENBQUMsSUFBWTtRQUMvQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLENBQUM7UUFDMUQsSUFBSSxXQUFXLEdBQVEsSUFBSSxDQUFDO1FBRTVCLElBQUksS0FBSyxFQUFFO1lBQ1YsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxJQUFJLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDO1lBQzlCLElBQ0MsRUFBRTtnQkFDRixzREFBc0Q7Z0JBQ3RELENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUN0RDtnQkFDRCxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzthQUNoQztpQkFBTTtZQUNOLHNEQUFzRDtZQUN0RCxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNqRCxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUN4QjtnQkFDRCxXQUFXLEdBQUcsV0FBVyxDQUFDO2FBQzFCO2lCQUFNO1lBQ04sc0RBQXNEO1lBQ3RELENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQ2xCO2dCQUNELFdBQVcsR0FBRyxLQUFLLENBQUM7YUFDcEI7U0FDRDtRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3BCLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDUixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNQLE1BQU0sT0FBTyxHQUFHLElBQUksRUFDbkIsVUFBVSxHQUFhLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDVCxJQUFJLENBQUM7UUFFTixtQkFBbUI7UUFDbkIsT0FBTyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUNqRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDM0QsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDeEI7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILHNEQUFzRDtRQUN0RCxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDaEMsSUFBSTtnQkFDSCxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDdkMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFDbkMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUNuRCxFQUFFLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUVwQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDdEIsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7NEJBQ25CLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO3lCQUN6Qjs2QkFBTTs0QkFDTixPQUFPLENBQUMsSUFBSSxDQUNYLGtDQUFrQyxhQUFhLDRCQUE0QixJQUFJLCtCQUErQixDQUM5RyxDQUFDO3lCQUNGO3FCQUNEO3lCQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsOEJBQThCLEVBQUU7NEJBQ2xELEtBQUssRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDO3lCQUN4QyxDQUFDLENBQUM7cUJBQ0g7aUJBQ0Q7YUFDRDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNYLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRTtvQkFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO3FCQUN6QjtvQkFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7d0JBQ25CLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDOzRCQUNoQyxJQUFJLEVBQUUsT0FBTzs0QkFDYixJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU87NEJBQ2YsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO3lCQUNaLENBQUMsQ0FBQzt3QkFDSCxNQUFNO3FCQUNOO2lCQUNEO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxDQUFDO2lCQUNSO2FBQ0Q7U0FDRDtRQUVELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsTUFBTSxDQUFDLFNBQWMsRUFBRSxPQUFlLEVBQUUsSUFBUztRQUNoRCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2YsTUFBTSxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdkM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsU0FBeUI7UUFDL0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNwQixNQUFNLElBQUksU0FBUyxDQUNsQiwwREFBMEQsQ0FDMUQsQ0FBQztTQUNGO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMzQixNQUFNLElBQUksU0FBUyxDQUNsQixpRUFBaUUsQ0FDakUsQ0FBQztTQUNGO1FBRUQsSUFBSSxJQUFJLElBQUksU0FBUyxFQUFFO1lBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQ1gsOEJBQThCLElBQUksa0NBQWtDLENBQ3BFLENBQUM7U0FDRjtRQUVELGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDbEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBc0M7UUFDL0QsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQWtCLEVBQUUsR0FBVyxFQUFFLEVBQUU7WUFDaEQsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCB7XG5cdGZvckVhY2gsXG5cdGlzQXJyYXksXG5cdGlzRnVuY3Rpb24sXG5cdGlzTm90RW1wdHksXG5cdGlzU3RyaW5nLFxuXHR0b0FycmF5LFxufSBmcm9tICcuL3V0aWxzL1V0aWxzJztcbmltcG9ydCBPV2ViRm9ybUVycm9yIGZyb20gJy4vT1dlYkZvcm1FcnJvcic7XG5cbnR5cGUgdEZvcm1FcnJvck1hcCA9IHsgW2tleTogc3RyaW5nXTogT1dlYkZvcm1FcnJvcltdIH07XG5leHBvcnQgdHlwZSB0Rm9ybVZhbGlkYXRvciA9IChcblx0dmFsdWU6IGFueSxcblx0bmFtZTogc3RyaW5nLFxuXHRjb250ZXh0OiBPV2ViRm9ybVZhbGlkYXRvcixcbikgPT4gdm9pZDtcblxuY29uc3QgZm9ybVZhbGlkYXRvcnM6IHsgW2tleTogc3RyaW5nXTogdEZvcm1WYWxpZGF0b3IgfSA9IHt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViRm9ybVZhbGlkYXRvciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgZm9ybURhdGE6IEZvcm1EYXRhO1xuXHRwcml2YXRlIHZhbGlkYXRvcnNNYXA6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcblx0cHJpdmF0ZSBlcnJvck1hcDogdEZvcm1FcnJvck1hcCA9IHt9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBmb3JtIFRoZSBmb3JtIGVsZW1lbnQuXG5cdCAqIEBwYXJhbSByZXF1aXJlZCBUaGUgcmVxdWlyZWQgZmllbGRzLlxuXHQgKiBAcGFyYW0gZXhjbHVkZWQgVGhlIGZpZWxkcyB0byBleGNsdWRlIGZyb20gdmFsaWRhdGlvbi5cblx0ICogQHBhcmFtIGNoZWNrQWxsIFdoZW4gdHJ1ZSBhbGwgZmllbGRzIHdpbGwgYmUgdmFsaWRhdGVkLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBhcHBDb250ZXh0OiBPV2ViQXBwLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZm9ybTogSFRNTEZvcm1FbGVtZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcmVxdWlyZWQ6IHN0cmluZ1tdID0gW10sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBleGNsdWRlZDogc3RyaW5nW10gPSBbXSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNoZWNrQWxsOiBib29sZWFuID0gZmFsc2UsXG5cdCkge1xuXHRcdGlmICghZm9ybSB8fCBmb3JtLm5vZGVOYW1lICE9PSAnRk9STScpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0J1tPV2ViRm9ybVZhbGlkYXRvcl0gYSB2YWxpZCBmb3JtIGVsZW1lbnQgaXMgcmVxdWlyZWQuJyxcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbSA9IHRoaXM7XG5cdFx0dGhpcy5mb3JtID0gZm9ybTtcblx0XHR0aGlzLmZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKHRoaXMuZm9ybSk7XG5cdFx0Y29uc3QgZm8gPSB0aGlzLmZvcm0ucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtb3dlYi1mb3JtLXZdJyk7IC8vIHJldHVybnMgTm9kZUxpc3Qgbm90IEFycmF5IG9mIG5vZGUgKGV4OiBpbiBGaXJlZm94KVxuXG5cdFx0KGlzQXJyYXkoZm8pID8gZm8gOiB0b0FycmF5KGZvKSkuZm9yRWFjaCgoZmllbGQpID0+IHtcblx0XHRcdGNvbnN0IG5hbWUgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoJ25hbWUnKSxcblx0XHRcdFx0dmFsaWRhdG9yTmFtZSA9IGZpZWxkLmdldEF0dHJpYnV0ZSgnZGF0YS1vd2ViLWZvcm0tdicpO1xuXG5cdFx0XHRpZiAobmFtZSkge1xuXHRcdFx0XHRpZiAoIWZvcm1WYWxpZGF0b3JzW3ZhbGlkYXRvck5hbWVdKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0YFtPV2ViRm9ybVZhbGlkYXRvcl0gdmFsaWRhdG9yIFwiJHt2YWxpZGF0b3JOYW1lfVwiIGlzIGV4cGxpY2l0bHkgc2V0IGZvciBmaWVsZCBcIiR7bmFtZX1cIiBidXQgaXMgbm90IGRlZmluZWQuYCxcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bS52YWxpZGF0b3JzTWFwW25hbWVdID0gdmFsaWRhdG9yTmFtZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmb3JtIGVsZW1lbnQuXG5cdCAqL1xuXHRnZXRGb3JtKCk6IEhUTUxGb3JtRWxlbWVudCB7XG5cdFx0cmV0dXJuIHRoaXMuZm9ybTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhcHAgY29udGV4dC5cblx0ICovXG5cdGdldEFwcENvbnRleHQoKTogT1dlYkFwcCB7XG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFwcCBjb25maWcuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXlcblx0ICovXG5cdGdldENvbmZpZyhrZXk6IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXBwQ29udGV4dCgpLmNvbmZpZ3MuZ2V0KGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIEZvcm1EYXRhIGNvbnRhaW5pbmcgdGhlIHZhbGlkYXRlZCBmb3JtIGZpZWxkcy5cblx0ICpcblx0ICogQHBhcmFtIGZpZWxkcyBUaGUgZmllbGRzIG5hbWUgbGlzdC4gV2hlbiBlbXB0eSBhbGwgZmllbGQgd2lsbCBiZSBhZGRlZCB0byB0aGUgRm9ybURhdGEuXG5cdCAqL1xuXHRnZXRGb3JtRGF0YShmaWVsZHM6IHN0cmluZ1tdID0gW10pOiBGb3JtRGF0YSB7XG5cdFx0aWYgKGZpZWxkcy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGZpZWxkcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBmaWVsZCA9IGZpZWxkc1tpXTtcblx0XHRcdFx0Y29uc3QgdmFsdWVzID0gdGhpcy5nZXRBbGxGaWVsZHMoZmllbGQpOyAvLyBmb3IgY2hlY2tib3hlcyBhbmQgb3RoZXJzXG5cdFx0XHRcdHZhbHVlcy5mb3JFYWNoKCh2YWx1ZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKGZpZWxkLCB2YWx1ZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZm9ybURhdGE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuZm9ybURhdGE7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIGdpdmVuIGZpZWxkIG5hbWUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRGaWVsZChuYW1lOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhLmdldChuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGEgZ2l2ZW4gZmllbGQgdmFsdWUuXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqIEBwYXJhbSB2YWx1ZVxuXHQgKi9cblx0c2V0RmllbGQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdGhpcyB7XG5cdFx0dGhpcy5mb3JtRGF0YS5zZXQobmFtZSwgdmFsdWUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgY2hlY2tib3hlcyBsaWtlIGZpZWxkcyB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIG5hbWVcblx0ICovXG5cdGdldEFsbEZpZWxkcyhuYW1lOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLmZvcm1EYXRhLmdldEFsbChuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZWFyY2ggZm9yIGZpZWxkIGRlc2NyaXB0aW9uLlxuXHQgKlxuXHQgKiBXZSBzZWFyY2ggdGhlIGZpZWxkIGxhYmVsLCBwbGFjZWhvbGRlciBvciB0aXRsZS5cblx0ICpcblx0ICogQHBhcmFtIG5hbWVcblx0ICovXG5cdGdldEZpZWxkRGVzY3JpcHRpb24obmFtZTogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRjb25zdCBmaWVsZCA9IHRoaXMuZm9ybS5xdWVyeVNlbGVjdG9yKGBbbmFtZT0nJHtuYW1lfSddYCk7XG5cdFx0bGV0IGRlc2NyaXB0aW9uOiBhbnkgPSBuYW1lO1xuXG5cdFx0aWYgKGZpZWxkKSB7XG5cdFx0XHRjb25zdCBpZCA9IGZpZWxkLmdldEF0dHJpYnV0ZSgnaWQnKTtcblx0XHRcdGxldCBsYWJlbCwgcGxhY2Vob2xkZXIsIHRpdGxlO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRpZCAmJlxuXHRcdFx0XHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcblx0XHRcdFx0KGxhYmVsID0gdGhpcy5mb3JtLnF1ZXJ5U2VsZWN0b3IoYGxhYmVsW2Zvcj0nJHtpZH0nXWApKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGRlc2NyaXB0aW9uID0gbGFiZWwudGV4dENvbnRlbnQ7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcblx0XHRcdFx0KHBsYWNlaG9sZGVyID0gZmllbGQuZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpKSAmJlxuXHRcdFx0XHRwbGFjZWhvbGRlci50cmltKCkubGVuZ3RoXG5cdFx0XHQpIHtcblx0XHRcdFx0ZGVzY3JpcHRpb24gPSBwbGFjZWhvbGRlcjtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uZGl0aW9uYWwtYXNzaWdubWVudFxuXHRcdFx0XHQodGl0bGUgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykpICYmXG5cdFx0XHRcdHRpdGxlLnRyaW0oKS5sZW5ndGhcblx0XHRcdCkge1xuXHRcdFx0XHRkZXNjcmlwdGlvbiA9IHRpdGxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBkZXNjcmlwdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVycm9yIG1hcC5cblx0ICovXG5cdGdldEVycm9ycygpOiB0Rm9ybUVycm9yTWFwIHtcblx0XHRyZXR1cm4gdGhpcy5lcnJvck1hcDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGZvcm0gdmFsaWRhdGlvbi5cblx0ICovXG5cdHZhbGlkYXRlKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGNvbnRleHQgPSB0aGlzLFxuXHRcdFx0ZmllbGROYW1lczogc3RyaW5nW10gPSBbXTtcblx0XHRsZXQgYyA9IC0xLFxuXHRcdFx0bmFtZTtcblxuXHRcdC8vIGVtcHR5IGVycm9yIGxpc3Rcblx0XHRjb250ZXh0LmVycm9yTWFwID0ge307XG5cblx0XHR0b0FycmF5KGNvbnRleHQuZm9ybS5lbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuXHRcdFx0aWYgKGkubmFtZSAhPT0gdW5kZWZpbmVkICYmIGZpZWxkTmFtZXMuaW5kZXhPZihpLm5hbWUpIDwgMCkge1xuXHRcdFx0XHRmaWVsZE5hbWVzLnB1c2goaS5uYW1lKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uZGl0aW9uYWwtYXNzaWdubWVudFxuXHRcdHdoaWxlICgobmFtZSA9IGZpZWxkTmFtZXNbKytjXSkpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChjb250ZXh0LmV4Y2x1ZGVkLmluZGV4T2YobmFtZSkgPCAwKSB7XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBjb250ZXh0LmdldEZpZWxkKG5hbWUpLFxuXHRcdFx0XHRcdFx0dmFsaWRhdG9yTmFtZSA9IGNvbnRleHQudmFsaWRhdG9yc01hcFtuYW1lXSB8fCBuYW1lLFxuXHRcdFx0XHRcdFx0Zm4gPSBmb3JtVmFsaWRhdG9yc1t2YWxpZGF0b3JOYW1lXTtcblxuXHRcdFx0XHRcdGlmIChpc05vdEVtcHR5KHZhbHVlKSkge1xuXHRcdFx0XHRcdFx0aWYgKGlzRnVuY3Rpb24oZm4pKSB7XG5cdFx0XHRcdFx0XHRcdGZuKHZhbHVlLCBuYW1lLCBjb250ZXh0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0XHRcdFx0XHRgW09XZWJGb3JtVmFsaWRhdG9yXSB2YWxpZGF0b3IgJyR7dmFsaWRhdG9yTmFtZX0nIGlzIG5vdCBkZWZpbmVkLCBmaWVsZCAnJHtuYW1lfScgaXMgdGhlbiBjb25zaWRlcmVkIGFzIHNhZmUuYCxcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKH5jb250ZXh0LnJlcXVpcmVkLmluZGV4T2YobmFtZSkpIHtcblx0XHRcdFx0XHRcdHRoaXMuYXNzZXJ0KGZhbHNlLCAnT1pfRk9STV9DT05UQUlOU19FTVBUWV9GSUVMRCcsIHtcblx0XHRcdFx0XHRcdFx0bGFiZWw6IGNvbnRleHQuZ2V0RmllbGREZXNjcmlwdGlvbihuYW1lKSxcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRpZiAoZS4kb3dlYkZvcm1FcnJvcikge1xuXHRcdFx0XHRcdGlmICghdGhpcy5lcnJvck1hcFtuYW1lXSkge1xuXHRcdFx0XHRcdFx0dGhpcy5lcnJvck1hcFtuYW1lXSA9IFtdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRoaXMuZXJyb3JNYXBbbmFtZV0ucHVzaChlKTtcblxuXHRcdFx0XHRcdGlmICghdGhpcy5jaGVja0FsbCkge1xuXHRcdFx0XHRcdFx0dGhpcy5nZXRBcHBDb250ZXh0KCkudmlldy5kaWFsb2coe1xuXHRcdFx0XHRcdFx0XHR0eXBlOiAnZXJyb3InLFxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBlLm1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdGRhdGE6IGUuZGF0YSxcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IGU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5lcnJvck1hcCkubGVuZ3RoID09PSAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ha2UgYW4gYXNzZXJ0aW9ucy5cblx0ICpcblx0ICogQHBhcmFtIHByZWRpY2F0ZSBUaGUgYXNzZXJ0aW9uIHByZWRpY2F0ZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2Ugd2hlbiB0aGUgcHJlZGljYXRlIGlzIGZhbHNlLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgZXJyb3IgZGF0YS5cblx0ICovXG5cdGFzc2VydChwcmVkaWNhdGU6IGFueSwgbWVzc2FnZTogc3RyaW5nLCBkYXRhPzoge30pOiB0aGlzIHtcblx0XHRpZiAoIXByZWRpY2F0ZSkge1xuXHRcdFx0dGhyb3cgbmV3IE9XZWJGb3JtRXJyb3IobWVzc2FnZSwgZGF0YSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIG5ldyB2YWxpZGF0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lIFRoZSB2YWxpZGF0b3IgbmFtZS5cblx0ICogQHBhcmFtIHZhbGlkYXRvciBUaGUgdmFsaWRhdG9yIGZ1bmN0aW9uLlxuXHQgKi9cblx0c3RhdGljIGFkZEZpZWxkVmFsaWRhdG9yKG5hbWU6IHN0cmluZywgdmFsaWRhdG9yOiB0Rm9ybVZhbGlkYXRvcik6IHZvaWQge1xuXHRcdGlmICghaXNTdHJpbmcobmFtZSkpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdCdbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIG5hbWUgc2hvdWxkIGJlIGEgdmFsaWQgc3RyaW5nLicsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmICghaXNGdW5jdGlvbih2YWxpZGF0b3IpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFxuXHRcdFx0XHQnW09XZWJGb3JtVmFsaWRhdG9yXSBmaWVsZCB2YWxpZGF0b3Igc2hvdWxkIGJlIGEgdmFsaWQgZnVuY3Rpb24uJyxcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKG5hbWUgaW4gdmFsaWRhdG9yKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdGBbT1dlYkZvcm1WYWxpZGF0b3JdIGZpZWxkIFwiJHtuYW1lfVwiIHZhbGlkYXRvciB3aWxsIGJlIG92ZXJ3cml0dGVuLmAsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGZvcm1WYWxpZGF0b3JzW25hbWVdID0gdmFsaWRhdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgZmllbGRzIHZhbGlkYXRvcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBtYXAgVGhlIG1hcCBvZiBmaWVsZHMgdmFsaWRhdG9ycy5cblx0ICovXG5cdHN0YXRpYyBhZGRGaWVsZFZhbGlkYXRvcnMobWFwOiB7IFtrZXk6IHN0cmluZ106IHRGb3JtVmFsaWRhdG9yIH0pOiB2b2lkIHtcblx0XHRmb3JFYWNoKG1hcCwgKGZuOiB0Rm9ybVZhbGlkYXRvciwga2V5OiBzdHJpbmcpID0+IHtcblx0XHRcdE9XZWJGb3JtVmFsaWRhdG9yLmFkZEZpZWxkVmFsaWRhdG9yKGtleSwgZm4pO1xuXHRcdH0pO1xuXHR9XG59XG4iXX0=