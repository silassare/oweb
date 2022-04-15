import OWebApp from './OWebApp';
import OWebFormError from './OWebFormError';
import { OWebFormAdapter, OWebFormDataEntryValue } from './OWebFormAdapter';
export interface OWebFormField {
    [key: string]: unknown;
    value: any;
    label?: string;
    validator?: string | OWebFormFieldValidator;
}
export declare type OWebFormFieldValidator<T = unknown> = (value: T, fieldName: string, context: OWebForm) => void;
export declare type OWebFormData = FormData | Record<string, any>;
export declare type OWebFormDefinition = Record<string, OWebFormField>;
export declare type OWebFormErrors = {
    [key: string]: OWebFormError[];
};
export default class OWebForm {
    private readonly _appContext;
    private readonly adapter;
    private readonly required;
    private readonly excluded;
    private readonly checkAll;
    private readonly verbose;
    private errors;
    /**
     * @param _appContext The app context.
     * @param adapter The form.
     * @param required The required fields.
     * @param excluded The fields to exclude from validation.
     * @param checkAll When true all fields will be validated.
     * @param verbose Log warning.
     */
    constructor(_appContext: OWebApp, adapter: OWebFormAdapter, required?: string[], excluded?: string[], checkAll?: boolean, verbose?: boolean);
    /**
     * Returns the app context.
     */
    getAppContext(): OWebApp;
    /**
     * Returns the form adapter.
     */
    getFormAdapter(): OWebFormAdapter;
    /**
     * Gets app config.
     *
     * @param key
     */
    getConfig(key: string): any;
    /**
     * Returns a FormData containing the validated form fields.
     *
     * @param fields The fields name list. When empty all field will be added to the FormData.
     */
    getFormData(fields?: string[]): FormData;
    /**
     * Gets a given field name value.
     *
     * @param name
     */
    getFieldValue<T = null | OWebFormDataEntryValue>(name: string): T;
    /**
     * Sets a given field value.
     * @param name
     * @param value
     */
    setFieldValue(name: string, value: OWebFormDataEntryValue): this;
    /**
     * Returns error map.
     */
    getErrors(): OWebFormErrors;
    /**
     * Runs form validation.
     */
    validate(showDialog?: boolean): boolean;
    /**
     * Make an assertions.
     *
     * @param predicate The assertion predicate.
     * @param message The error message when the predicate is false.
     * @param data The error data.
     */
    assert(predicate: unknown, message: string, data?: Record<string, unknown>): this;
    /**
     * Declare a field validator.
     *
     * @param name The validator name.
     * @param validator The validator function.
     */
    static declareFieldValidator(name: string, validator: OWebFormFieldValidator): void;
    /**
     * Gets field validator.
     *
     * @param name The field validator name.
     */
    static getDeclaredValidator(name: string): OWebFormFieldValidator | undefined;
}
export declare const defaultValidators: {
    code: (value: unknown, _name: string, fv: OWebForm) => void;
    uname: (value: unknown, name: string, fv: OWebForm) => void;
    login_pass: (value: unknown, _name: string, fv: OWebForm) => void;
    pass: (value: unknown, _name: string, fv: OWebForm) => void;
    pass_verify: (value: unknown, _name: string, fv: OWebForm) => void;
    birth_date: (value: unknown, name: string, fv: OWebForm) => void;
    gender: (value: unknown, _name: string, fv: OWebForm) => void;
    email: (value: unknown, name: string, fv: OWebForm) => void;
};
