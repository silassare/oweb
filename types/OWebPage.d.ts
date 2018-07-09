import OWebEvent from "./OWebEvent";
export interface iPage {
    getPageName(): string;
    component(): any;
}
export default class OWebPage extends OWebEvent implements iPage {
    private readonly name;
    constructor(name: string);
    getPageName(): string;
    component(): any;
}
