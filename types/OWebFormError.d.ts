import OWebError from './OWebError';
export default class OWebFormError extends OWebError {
    readonly isFormError = true;
}
