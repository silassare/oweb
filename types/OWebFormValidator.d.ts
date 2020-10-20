import OWebApp from './OWebApp';
import OWebFormError from './OWebFormError';
declare type OFormErrorMap = {
    [key: string]: OWebFormError[];
};
export declare type OFormValidator = (value: any, name: string, context: OWebFormValidator) => void;
export default class OWebFormValidator {
    private readonly _appContext;
    private readonly form;
    private readonly required;
    private readonly excluded;
    private readonly checkAll;
    private readonly formData;
    private validatorsMap;
    private errorMap;
    /**
     * @param _appContext The app context.
     * @param form The form element.
     * @param required The required fields.
     * @param excluded The fields to exclude from validation.
     * @param checkAll When true all fields will be validated.
     */
    constructor(_appContext: OWebApp, form: HTMLFormElement, required?: string[], excluded?: string[], checkAll?: boolean);
    /**
     * Returns the form element.
     */
    getForm(): HTMLFormElement;
    /**
     * Returns the app context.
     */
    getAppContext(): OWebApp;
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
    getField(name: string): any;
    /**
     * Sets a given field value.
     * @param name
     * @param value
     */
    setField(name: string, value: any): this;
    /**
     * Gets checkboxes like fields value.
     *
     * @param name
     */
    getFieldValues(name: string): any;
    /**
     * Search for field description.
     *
     * We search the field label, placeholder or title.
     *
     * @param name
     */
    getFieldDescription(name: string): string;
    /**
     * Returns error map.
     */
    getErrors(): OFormErrorMap;
    /**
     * Runs form validation.
     */
    validate(): boolean;
    /**
     * Make an assertions.
     *
     * @param predicate The assertion predicate.
     * @param message The error message when the predicate is false.
     * @param data The error data.
     */
    assert(predicate: any, message: string, data?: {}): this;
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
