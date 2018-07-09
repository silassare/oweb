"use strict";
export default class OWebCustomError extends Error {
    constructor(message, data = {}) {
        super(message);
        this.data = data;
        if (arguments[0] instanceof Error) {
            let e = arguments[0];
            this.message = e.message;
            this.stack = e.stack;
        }
        else {
            this.message = message || "OWebCustomError: something went wrong.";
            this.stack = (new Error()).stack;
        }
    }
    getData() {
        return this.data;
    }
}
//# sourceMappingURL=OWebCustomError.js.map