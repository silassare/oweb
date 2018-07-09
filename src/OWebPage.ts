"use strict";

import OWebEvent from "./OWebEvent";

export interface iPage {

	getPageName(): string,

	component(): any
}

export default class OWebPage extends OWebEvent implements iPage {
	constructor(private readonly name: string) {
		super();
	}

	getPageName(): string { return this.name; }

	component(): any {}
}