import { OWebFormFieldValidator, OWebFormDefinition } from './OWebForm';
export declare type OWebFormDataEntryValue = File | string;
export declare abstract class OWebFormAdapter {
    protected validators: {
        [key: string]: OWebFormFieldValidator[];
    };
    /**
     * Gets validators for the field with the given name.
     */
    getFieldValidators(fieldName: string): OWebFormFieldValidator[];
    /**
     * Adds validator for the field with the given name.
     *
     * @param fieldName
     * @param validator
     */
    pushFieldValidator(fieldName: string, validator: string | OWebFormFieldValidator<unknown>): this;
    /**
     * Returns form data.
     * @param fields The fields name list.
     */
    abstract toFormData(fields: string[]): FormData;
    /**
     * Gets a given field name value.
     *
     * @param fieldName
     */
    abstract getFieldValue<T = null | OWebFormDataEntryValue>(fieldName: string): T;
    /**
     * Sets a given field value.
     *
     * @param fieldName
     * @param value
     */
    abstract setFieldValue(fieldName: string, value: OWebFormDataEntryValue): this;
    /**
     * Returns all fields names list.
     */
    abstract getFieldsNames(): string[];
    /**
     * Returns field label.
     *
     * We search the field label, placeholder or title.
     *
     * @param fieldName
     */
    abstract getFieldLabel(fieldName: string): string;
}
export declare class OFormDOMFormAdapter extends OWebFormAdapter {
    private readonly form;
    private labels;
    private readonly formData;
    constructor(form: HTMLFormElement);
    toFormData(fields?: string[]): FormData;
    getFieldValue<T = null | OWebFormDataEntryValue>(name: string): T;
    setFieldValue(name: string, value: OWebFormDataEntryValue): this;
    getFieldsNames(): string[];
    getFieldLabel(name: string): string;
}
export declare class OFormObjectAdapter extends OWebFormAdapter {
    private labels;
    private readonly formObj;
    constructor(form: OWebFormDefinition);
    toFormData(fields?: string[]): FormData;
    getFieldValue<T = null | OWebFormDataEntryValue>(name: string): T;
    setFieldValue(name: string, value: OWebFormDataEntryValue): this;
    getFieldsNames(): string[];
    getFieldLabel(name: string): string;
}
