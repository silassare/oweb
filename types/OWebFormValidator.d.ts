import OWebApp from "./OWebApp";
import OWebCustomError from "./OWebCustomError";
declare type tFormErrorMap = {
    [key: string]: OWebFormError[];
};
export declare type tFormValidator = (value: any, name: string, context: OWebFormValidator) => void;
export declare class OWebFormError extends OWebCustomError {
    readonly __oweb_form_error: boolean;
}
export default class OWebFormValidator {
    private readonly app_context;
    private readonly form;
    private readonly required;
    private readonly excluded;
    private readonly checkAll;
    private readonly formData;
    private validatorsMap;
    private errorMap;
    constructor(app_context: OWebApp, form: HTMLFormElement, required?: Array<string>, excluded?: Array<string>, checkAll?: boolean);
    getForm(): HTMLFormElement;
    getAppContext(): OWebApp;
    getConfig(key: string): any;
    getFormData(fields?: Array<string>): FormData;
    getField(name: string): any;
    setField(name: string, value: any): this;
    getAllFields(name: string): any;
    getFieldDescription(name: string): string;
    getErrors(): tFormErrorMap;
    validate(): boolean;
    assert(assertion: any, message: string, data?: {}): this;
    static addFieldValidator(name: string, validator: tFormValidator): void;
    static addFieldValidators(map: {
        [key: string]: tFormValidator;
    }): void;
}
export {};
