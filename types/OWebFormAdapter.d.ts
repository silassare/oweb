import { OWebFormFieldValidator, OWebFormOptions } from './OWebForm';
export declare type OWebFormDataEntryValue = File | string;
export declare abstract class OWebFormAdapter {
    protected validators: {
        [key: string]: OWebFormFieldValidator[];
    };
    getFieldValidators(fieldName: string): OWebFormFieldValidator[];
    pushFieldValidator(fieldName: string, validator: string | OWebFormFieldValidator<unknown>): this;
    abstract toFormData(fields: string[]): FormData;
    abstract getFieldValue<T = null | OWebFormDataEntryValue>(fieldName: string): T;
    abstract setFieldValue(fieldName: string, value: OWebFormDataEntryValue): this;
    abstract getFieldsNames(): string[];
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
    constructor(form: OWebFormOptions);
    toFormData(fields?: string[]): FormData;
    getFieldValue<T = null | OWebFormDataEntryValue>(name: string): T;
    setFieldValue(name: string, value: OWebFormDataEntryValue): this;
    getFieldsNames(): string[];
    getFieldLabel(name: string): string;
}
