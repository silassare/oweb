import { extractFieldLabelText, forEach, isArray, isPlainObject, toArray, } from './utils';
import OWebForm from './OWebForm';
export class OWebFormAdapter {
    validators = Object.create({});
    /**
     * Gets validators for the field with the given name.
     */
    getFieldValidators(fieldName) {
        return this.validators[fieldName] || [];
    }
    /**
     * Adds validator for the field with the given name.
     *
     * @param fieldName
     * @param validator
     */
    pushFieldValidator(fieldName, validator) {
        if (typeof validator === 'string') {
            const fn = OWebForm.getDeclaredValidator(validator);
            if (!fn) {
                throw new Error(`[OWebForm][OWebFormAdapter] validator "${validator}" is not defined can't set for field "${fieldName}".`);
            }
            validator = fn;
        }
        if (!this.validators[fieldName]) {
            this.validators[fieldName] = [];
        }
        this.validators[fieldName].push(validator);
        return this;
    }
}
export class OFormDOMFormAdapter extends OWebFormAdapter {
    form;
    labels = Object.create({});
    formData;
    constructor(form) {
        super();
        this.form = form;
        if (!form || form.nodeName !== 'FORM') {
            throw new Error('[OWebForm][DOMFormAdapter] a valid form element is required.');
        }
        this.form = form;
        this.formData = new FormData(this.form);
        const fo = this.form.querySelectorAll('[data-oweb-form-v]'); // returns NodeList not Array of node (ex: in Firefox)
        (isArray(fo) ? fo : toArray(fo)).forEach((field) => {
            const name = field.getAttribute('name'), validator = field.getAttribute('data-oweb-form-v');
            if (name && validator) {
                this.pushFieldValidator(name, validator);
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
    getFieldValue(name) {
        return this.formData.get(name);
    }
    setFieldValue(name, value) {
        this.formData.set(name, value);
        return this;
    }
    getFieldsNames() {
        const fieldNames = [];
        toArray(this.form.elements).forEach(function formElementsIterator(el) {
            const entry = el;
            if (entry.name !== undefined && fieldNames.indexOf(entry.name) < 0) {
                fieldNames.push(entry.name);
            }
        });
        return fieldNames;
    }
    getFieldLabel(name) {
        if (!this.labels[name]) {
            this.labels[name] = extractFieldLabelText(this.form, name);
        }
        return this.labels[name];
    }
}
export class OFormObjectAdapter extends OWebFormAdapter {
    labels = Object.create({});
    formObj = Object.create({});
    constructor(form) {
        super();
        if (!isPlainObject(form)) {
            throw new Error('[OWebForm][ObjectFormAdapter] a valid form plain object is required.');
        }
        forEach(form, (field, fieldName) => {
            this.formObj[fieldName] = field.value;
            if (field.validator) {
                this.pushFieldValidator(fieldName, field.validator);
            }
            if (field.label) {
                this.labels[fieldName] = field.label;
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
    getFieldValue(name) {
        return this.formObj[name];
    }
    setFieldValue(name, value) {
        this.formObj[name] = value;
        return this;
    }
    getFieldsNames() {
        return Object.keys(this.formObj);
    }
    getFieldLabel(name) {
        if (this.labels[name]) {
            return this.labels[name];
        }
        return name;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZvcm1BZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJGb3JtQWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ04scUJBQXFCLEVBQ3JCLE9BQU8sRUFDUCxPQUFPLEVBQ1AsYUFBYSxFQUNiLE9BQU8sR0FDUCxNQUFNLFNBQVMsQ0FBQztBQUNqQixPQUFPLFFBR04sTUFBTSxZQUFZLENBQUM7QUFHcEIsTUFBTSxPQUFnQixlQUFlO0lBQzFCLFVBQVUsR0FDbkIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVuQjs7T0FFRztJQUNILGtCQUFrQixDQUFDLFNBQWlCO1FBQ25DLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsa0JBQWtCLENBQ2pCLFNBQWlCLEVBQ2pCLFNBQW1EO1FBRW5ELElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO1lBQ2xDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUNSLE1BQU0sSUFBSSxLQUFLLENBQ2QsMENBQTBDLFNBQVMseUNBQXlDLFNBQVMsSUFBSSxDQUN6RyxDQUFDO2FBQ0Y7WUFFRCxTQUFTLEdBQUcsRUFBRSxDQUFDO1NBQ2Y7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNoQztRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTNDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQXlDRDtBQUVELE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxlQUFlO0lBSTFCO0lBSHJCLE1BQU0sR0FBOEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QyxRQUFRLENBQVc7SUFFcEMsWUFBNkIsSUFBcUI7UUFDakQsS0FBSyxFQUFFLENBQUM7UUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBaUI7UUFFakQsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRTtZQUN0QyxNQUFNLElBQUksS0FBSyxDQUNkLDhEQUE4RCxDQUM5RCxDQUFDO1NBQ0Y7UUFDRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxzREFBc0Q7UUFFbkgsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbEQsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFDdEMsU0FBUyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUVwRCxJQUFJLElBQUksSUFBSSxTQUFTLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDekM7UUFDRixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxVQUFVLENBQUMsU0FBbUIsRUFBRTtRQUMvQixNQUFNLEVBQUUsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBRTFCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFLElBQUk7WUFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2hELEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3ZCO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFFRCxhQUFhLENBQW9DLElBQVk7UUFDNUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQWlCLENBQUM7SUFDaEQsQ0FBQztJQUVELGFBQWEsQ0FBQyxJQUFZLEVBQUUsS0FBNkI7UUFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9CLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELGNBQWM7UUFDYixNQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7UUFFaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsb0JBQW9CLENBQUMsRUFBRTtZQUNuRSxNQUFNLEtBQUssR0FBUSxFQUFhLENBQUM7WUFDakMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ25FLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVCO1FBQ0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLFVBQVUsQ0FBQztJQUNuQixDQUFDO0lBRUQsYUFBYSxDQUFDLElBQVk7UUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNEO1FBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7Q0FDRDtBQUVELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxlQUFlO0lBQzlDLE1BQU0sR0FBOEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QyxPQUFPLEdBQ3ZCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFbkIsWUFBWSxJQUF3QjtRQUNuQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekIsTUFBTSxJQUFJLEtBQUssQ0FDZCxzRUFBc0UsQ0FDdEUsQ0FBQztTQUNGO1FBRUQsT0FBTyxDQUFxQixJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUU7WUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBRXRDLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDcEQ7WUFFRCxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQzthQUNyQztRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELFVBQVUsQ0FBQyxTQUFtQixFQUFFO1FBQy9CLE1BQU0sRUFBRSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFFMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxLQUFLLEVBQUUsSUFBSTtZQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDaEQsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxZQUFZLFFBQVEsRUFBRTtvQkFDaEQsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLEdBQUc7d0JBQzNCLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN0QixDQUFDLENBQUMsQ0FBQztpQkFDSDtxQkFBTTtvQkFDTixFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDdkI7YUFDRDtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxFQUFFLENBQUM7SUFDWCxDQUFDO0lBRUQsYUFBYSxDQUFvQyxJQUFZO1FBQzVELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQWlCLENBQUM7SUFDM0MsQ0FBQztJQUVELGFBQWEsQ0FBQyxJQUFZLEVBQUUsS0FBNkI7UUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDM0IsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsY0FBYztRQUNiLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELGFBQWEsQ0FBQyxJQUFZO1FBQ3pCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdGV4dHJhY3RGaWVsZExhYmVsVGV4dCxcblx0Zm9yRWFjaCxcblx0aXNBcnJheSxcblx0aXNQbGFpbk9iamVjdCxcblx0dG9BcnJheSxcbn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgT1dlYkZvcm0sIHtcblx0T1dlYkZvcm1GaWVsZFZhbGlkYXRvcixcblx0T1dlYkZvcm1EZWZpbml0aW9uLFxufSBmcm9tICcuL09XZWJGb3JtJztcblxuZXhwb3J0IHR5cGUgT1dlYkZvcm1EYXRhRW50cnlWYWx1ZSA9IEZpbGUgfCBzdHJpbmc7XG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgT1dlYkZvcm1BZGFwdGVyIHtcblx0cHJvdGVjdGVkIHZhbGlkYXRvcnM6IHsgW2tleTogc3RyaW5nXTogT1dlYkZvcm1GaWVsZFZhbGlkYXRvcltdIH0gPVxuXHRcdE9iamVjdC5jcmVhdGUoe30pO1xuXG5cdC8qKlxuXHQgKiBHZXRzIHZhbGlkYXRvcnMgZm9yIHRoZSBmaWVsZCB3aXRoIHRoZSBnaXZlbiBuYW1lLlxuXHQgKi9cblx0Z2V0RmllbGRWYWxpZGF0b3JzKGZpZWxkTmFtZTogc3RyaW5nKTogT1dlYkZvcm1GaWVsZFZhbGlkYXRvcltdIHtcblx0XHRyZXR1cm4gdGhpcy52YWxpZGF0b3JzW2ZpZWxkTmFtZV0gfHwgW107XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyB2YWxpZGF0b3IgZm9yIHRoZSBmaWVsZCB3aXRoIHRoZSBnaXZlbiBuYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmllbGROYW1lXG5cdCAqIEBwYXJhbSB2YWxpZGF0b3Jcblx0ICovXG5cdHB1c2hGaWVsZFZhbGlkYXRvcihcblx0XHRmaWVsZE5hbWU6IHN0cmluZyxcblx0XHR2YWxpZGF0b3I6IHN0cmluZyB8IE9XZWJGb3JtRmllbGRWYWxpZGF0b3I8dW5rbm93bj5cblx0KTogdGhpcyB7XG5cdFx0aWYgKHR5cGVvZiB2YWxpZGF0b3IgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRjb25zdCBmbiA9IE9XZWJGb3JtLmdldERlY2xhcmVkVmFsaWRhdG9yKHZhbGlkYXRvcik7XG5cdFx0XHRpZiAoIWZuKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRgW09XZWJGb3JtXVtPV2ViRm9ybUFkYXB0ZXJdIHZhbGlkYXRvciBcIiR7dmFsaWRhdG9yfVwiIGlzIG5vdCBkZWZpbmVkIGNhbid0IHNldCBmb3IgZmllbGQgXCIke2ZpZWxkTmFtZX1cIi5gXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdHZhbGlkYXRvciA9IGZuO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy52YWxpZGF0b3JzW2ZpZWxkTmFtZV0pIHtcblx0XHRcdHRoaXMudmFsaWRhdG9yc1tmaWVsZE5hbWVdID0gW107XG5cdFx0fVxuXG5cdFx0dGhpcy52YWxpZGF0b3JzW2ZpZWxkTmFtZV0ucHVzaCh2YWxpZGF0b3IpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBmb3JtIGRhdGEuXG5cdCAqIEBwYXJhbSBmaWVsZHMgVGhlIGZpZWxkcyBuYW1lIGxpc3QuXG5cdCAqL1xuXHRhYnN0cmFjdCB0b0Zvcm1EYXRhKGZpZWxkczogc3RyaW5nW10pOiBGb3JtRGF0YTtcblxuXHQvKipcblx0ICogR2V0cyBhIGdpdmVuIGZpZWxkIG5hbWUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWVsZE5hbWVcblx0ICovXG5cdGFic3RyYWN0IGdldEZpZWxkVmFsdWU8VCA9IG51bGwgfCBPV2ViRm9ybURhdGFFbnRyeVZhbHVlPihcblx0XHRmaWVsZE5hbWU6IHN0cmluZ1xuXHQpOiBUO1xuXG5cdC8qKlxuXHQgKiBTZXRzIGEgZ2l2ZW4gZmllbGQgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWVsZE5hbWVcblx0ICogQHBhcmFtIHZhbHVlXG5cdCAqL1xuXHRhYnN0cmFjdCBzZXRGaWVsZFZhbHVlKFxuXHRcdGZpZWxkTmFtZTogc3RyaW5nLFxuXHRcdHZhbHVlOiBPV2ViRm9ybURhdGFFbnRyeVZhbHVlXG5cdCk6IHRoaXM7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYWxsIGZpZWxkcyBuYW1lcyBsaXN0LlxuXHQgKi9cblx0YWJzdHJhY3QgZ2V0RmllbGRzTmFtZXMoKTogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIFJldHVybnMgZmllbGQgbGFiZWwuXG5cdCAqXG5cdCAqIFdlIHNlYXJjaCB0aGUgZmllbGQgbGFiZWwsIHBsYWNlaG9sZGVyIG9yIHRpdGxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmllbGROYW1lXG5cdCAqL1xuXHRhYnN0cmFjdCBnZXRGaWVsZExhYmVsKGZpZWxkTmFtZTogc3RyaW5nKTogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgT0Zvcm1ET01Gb3JtQWRhcHRlciBleHRlbmRzIE9XZWJGb3JtQWRhcHRlciB7XG5cdHByaXZhdGUgbGFiZWxzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0gT2JqZWN0LmNyZWF0ZSh7fSk7XG5cdHByaXZhdGUgcmVhZG9ubHkgZm9ybURhdGE6IEZvcm1EYXRhO1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZm9ybTogSFRNTEZvcm1FbGVtZW50KSB7XG5cdFx0c3VwZXIoKTtcblx0XHRpZiAoIWZvcm0gfHwgZm9ybS5ub2RlTmFtZSAhPT0gJ0ZPUk0nKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdCdbT1dlYkZvcm1dW0RPTUZvcm1BZGFwdGVyXSBhIHZhbGlkIGZvcm0gZWxlbWVudCBpcyByZXF1aXJlZC4nXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR0aGlzLmZvcm0gPSBmb3JtO1xuXHRcdHRoaXMuZm9ybURhdGEgPSBuZXcgRm9ybURhdGEodGhpcy5mb3JtKTtcblx0XHRjb25zdCBmbyA9IHRoaXMuZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1vd2ViLWZvcm0tdl0nKTsgLy8gcmV0dXJucyBOb2RlTGlzdCBub3QgQXJyYXkgb2Ygbm9kZSAoZXg6IGluIEZpcmVmb3gpXG5cblx0XHQoaXNBcnJheShmbykgPyBmbyA6IHRvQXJyYXkoZm8pKS5mb3JFYWNoKChmaWVsZCkgPT4ge1xuXHRcdFx0Y29uc3QgbmFtZSA9IGZpZWxkLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuXHRcdFx0XHR2YWxpZGF0b3IgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoJ2RhdGEtb3dlYi1mb3JtLXYnKTtcblxuXHRcdFx0aWYgKG5hbWUgJiYgdmFsaWRhdG9yKSB7XG5cdFx0XHRcdHRoaXMucHVzaEZpZWxkVmFsaWRhdG9yKG5hbWUsIHZhbGlkYXRvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHR0b0Zvcm1EYXRhKGZpZWxkczogc3RyaW5nW10gPSBbXSk6IEZvcm1EYXRhIHtcblx0XHRjb25zdCBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuXG5cdFx0dGhpcy5mb3JtRGF0YS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgbmFtZSkge1xuXHRcdFx0aWYgKCFmaWVsZHMubGVuZ3RoIHx8IGZpZWxkcy5pbmRleE9mKG5hbWUpID49IDApIHtcblx0XHRcdFx0ZmQuYXBwZW5kKG5hbWUsIHZhbHVlKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBmZDtcblx0fVxuXG5cdGdldEZpZWxkVmFsdWU8VCA9IG51bGwgfCBPV2ViRm9ybURhdGFFbnRyeVZhbHVlPihuYW1lOiBzdHJpbmcpOiBUIHtcblx0XHRyZXR1cm4gdGhpcy5mb3JtRGF0YS5nZXQobmFtZSkgYXMgdW5rbm93biBhcyBUO1xuXHR9XG5cblx0c2V0RmllbGRWYWx1ZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBPV2ViRm9ybURhdGFFbnRyeVZhbHVlKTogdGhpcyB7XG5cdFx0dGhpcy5mb3JtRGF0YS5zZXQobmFtZSwgdmFsdWUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Z2V0RmllbGRzTmFtZXMoKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IGZpZWxkTmFtZXM6IHN0cmluZ1tdID0gW107XG5cblx0XHR0b0FycmF5KHRoaXMuZm9ybS5lbGVtZW50cykuZm9yRWFjaChmdW5jdGlvbiBmb3JtRWxlbWVudHNJdGVyYXRvcihlbCkge1xuXHRcdFx0Y29uc3QgZW50cnk6IGFueSA9IGVsIGFzIHVua25vd247XG5cdFx0XHRpZiAoZW50cnkubmFtZSAhPT0gdW5kZWZpbmVkICYmIGZpZWxkTmFtZXMuaW5kZXhPZihlbnRyeS5uYW1lKSA8IDApIHtcblx0XHRcdFx0ZmllbGROYW1lcy5wdXNoKGVudHJ5Lm5hbWUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGZpZWxkTmFtZXM7XG5cdH1cblxuXHRnZXRGaWVsZExhYmVsKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0aWYgKCF0aGlzLmxhYmVsc1tuYW1lXSkge1xuXHRcdFx0dGhpcy5sYWJlbHNbbmFtZV0gPSBleHRyYWN0RmllbGRMYWJlbFRleHQodGhpcy5mb3JtLCBuYW1lKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5sYWJlbHNbbmFtZV07XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIE9Gb3JtT2JqZWN0QWRhcHRlciBleHRlbmRzIE9XZWJGb3JtQWRhcHRlciB7XG5cdHByaXZhdGUgbGFiZWxzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0gT2JqZWN0LmNyZWF0ZSh7fSk7XG5cdHByaXZhdGUgcmVhZG9ubHkgZm9ybU9iajogeyBba2V5OiBzdHJpbmddOiBPV2ViRm9ybURhdGFFbnRyeVZhbHVlIH0gPVxuXHRcdE9iamVjdC5jcmVhdGUoe30pO1xuXG5cdGNvbnN0cnVjdG9yKGZvcm06IE9XZWJGb3JtRGVmaW5pdGlvbikge1xuXHRcdHN1cGVyKCk7XG5cdFx0aWYgKCFpc1BsYWluT2JqZWN0KGZvcm0pKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdCdbT1dlYkZvcm1dW09iamVjdEZvcm1BZGFwdGVyXSBhIHZhbGlkIGZvcm0gcGxhaW4gb2JqZWN0IGlzIHJlcXVpcmVkLidcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Zm9yRWFjaDxPV2ViRm9ybURlZmluaXRpb24+KGZvcm0sIChmaWVsZCwgZmllbGROYW1lKSA9PiB7XG5cdFx0XHR0aGlzLmZvcm1PYmpbZmllbGROYW1lXSA9IGZpZWxkLnZhbHVlO1xuXG5cdFx0XHRpZiAoZmllbGQudmFsaWRhdG9yKSB7XG5cdFx0XHRcdHRoaXMucHVzaEZpZWxkVmFsaWRhdG9yKGZpZWxkTmFtZSwgZmllbGQudmFsaWRhdG9yKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGZpZWxkLmxhYmVsKSB7XG5cdFx0XHRcdHRoaXMubGFiZWxzW2ZpZWxkTmFtZV0gPSBmaWVsZC5sYWJlbDtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHRvRm9ybURhdGEoZmllbGRzOiBzdHJpbmdbXSA9IFtdKTogRm9ybURhdGEge1xuXHRcdGNvbnN0IGZkID0gbmV3IEZvcm1EYXRhKCk7XG5cblx0XHRmb3JFYWNoKHRoaXMuZm9ybU9iaiwgZnVuY3Rpb24gKHZhbHVlLCBuYW1lKSB7XG5cdFx0XHRpZiAoIWZpZWxkcy5sZW5ndGggfHwgZmllbGRzLmluZGV4T2YobmFtZSkgPj0gMCkge1xuXHRcdFx0XHRpZiAoaXNBcnJheSh2YWx1ZSkgfHwgdmFsdWUgaW5zdGFuY2VvZiBGaWxlTGlzdCkge1xuXHRcdFx0XHRcdGZvckVhY2godmFsdWUsIGZ1bmN0aW9uICh2YWwpIHtcblx0XHRcdFx0XHRcdGZkLmFwcGVuZChuYW1lLCB2YWwpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZkLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBmZDtcblx0fVxuXG5cdGdldEZpZWxkVmFsdWU8VCA9IG51bGwgfCBPV2ViRm9ybURhdGFFbnRyeVZhbHVlPihuYW1lOiBzdHJpbmcpOiBUIHtcblx0XHRyZXR1cm4gdGhpcy5mb3JtT2JqW25hbWVdIGFzIHVua25vd24gYXMgVDtcblx0fVxuXG5cdHNldEZpZWxkVmFsdWUobmFtZTogc3RyaW5nLCB2YWx1ZTogT1dlYkZvcm1EYXRhRW50cnlWYWx1ZSk6IHRoaXMge1xuXHRcdHRoaXMuZm9ybU9ialtuYW1lXSA9IHZhbHVlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Z2V0RmllbGRzTmFtZXMoKTogc3RyaW5nW10ge1xuXHRcdHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmZvcm1PYmopO1xuXHR9XG5cblx0Z2V0RmllbGRMYWJlbChuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGlmICh0aGlzLmxhYmVsc1tuYW1lXSkge1xuXHRcdFx0cmV0dXJuIHRoaXMubGFiZWxzW25hbWVdO1xuXHRcdH1cblxuXHRcdHJldHVybiBuYW1lO1xuXHR9XG59XG4iXX0=