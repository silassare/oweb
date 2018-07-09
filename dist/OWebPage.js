"use strict";
import OWebEvent from "./OWebEvent";
export default class OWebPage extends OWebEvent {
    constructor(name) {
        super();
        this.name = name;
    }
    getPageName() { return this.name; }
    component() { }
}
//# sourceMappingURL=OWebPage.js.map