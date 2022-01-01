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
export declare type OWebFormOptions = Record<string, OWebFormField>;
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
    constructor(_appContext: OWebApp, adapter: OWebFormAdapter, required?: string[], excluded?: string[], checkAll?: boolean, verbose?: boolean);
    getAppContext(): OWebApp;
    getFormAdapter(): OWebFormAdapter;
    getConfig(key: string): any;
    getFormData(fields?: string[]): FormData;
    getFieldValue<T = null | OWebFormDataEntryValue>(name: string): T;
    setFieldValue(name: string, value: OWebFormDataEntryValue): this;
    getErrors(): OWebFormErrors;
    validate(showDialog?: boolean): boolean;
    assert(predicate: unknown, message: string, data?: Record<string, unknown>): this;
    static declareFieldValidator(name: string, validator: OWebFormFieldValidator): void;
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
