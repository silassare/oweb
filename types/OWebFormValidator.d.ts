import OWebApp from './OWebApp';
import OWebFormError from './OWebFormError';
export declare type OFieldValue = string | null | undefined | number | Blob;
export interface OField {
    value: OFieldValue;
    label?: string;
    validator?: string;
}
export declare type OFormData = FormData | Record<string, OFieldValue>;
export declare type OFormOptions = Record<string, OField>;
export declare type OForm = OFormOptions | HTMLFormElement;
declare type OFormErrors = {
    [key: string]: OWebFormError[];
};
export declare type OFormValidator = (value: any, name: string, context: OWebFormValidator) => void;
interface OWebFormAdapter {
    /**
     * Returns form data.
     * @param fields The fields name list.
     */
    toFormData(fields: string[]): FormData;
    /**
     * Returns fields validators map.
     */
    getValidatorsMap(): Record<string, string>;
    /**
     *
     * @param fieldName
     * @param validatorName
     */
    setFieldValidator(fieldName: string, validatorName: string): this;
    /**
     * Gets a given field name value.
     *
     * @param fieldName
     */
    getField(fieldName: string): OFieldValue;
    /**
     * Sets a given field value.
     * @param fieldName
     * @param value
     */
    setField(fieldName: string, value: OFieldValue): this;
    /**
     * Returns all fields names list.
     */
    getFieldsList(): string[];
    /**
     * Returns field description.
     *
     * We search the field label, placeholder or title.
     *
     * @param fieldName
     */
    getFieldDescription(fieldName: string): string;
}
export default class OWebFormValidator {
    private readonly _appContext;
    private readonly required;
    private readonly excluded;
    private readonly checkAll;
    private readonly verbose;
    private readonly adapter;
    private validatorsMap;
    private errorMap;
    /**
     * @param _appContext The app context.
     * @param form The form.
     * @param required The required fields.
     * @param excluded The fields to exclude from validation.
     * @param checkAll When true all fields will be validated.
     * @param verbose Log warning.
     */
    constructor(_appContext: OWebApp, form: OForm, required?: string[], excluded?: string[], checkAll?: boolean, verbose?: boolean);
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
    getField(name: string): OFieldValue;
    /**
     * Sets a given field value.
     * @param name
     * @param value
     */
    setField(name: string, value: OFieldValue): this;
    /**
     * Returns error map.
     */
    getErrors(): OFormErrors;
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
     * Adds a new validator.
     *
     * @param name The validator name.
     * @param validator The validator function.
     */
    static addFieldValidator(name: string, validator: OFormValidator): void;
    /**
     * Adds fields validators.
     *
     * @param map The map of fields validators.
     */
    static addFieldValidators(map: {
        [key: string]: OFormValidator;
    }): void;
}
export {};
