import OWebService from './OWebService';
import { GoblEntity } from 'gobl-utils-ts';
import { OWebApp, tConfigList, tUrlList } from './oweb';

export interface iAppStore {
	[key: string]: any;
	services: {
		[name: string]: OWebService<GoblEntity>;
	};
}

export class App<S extends iAppStore> extends OWebApp {
	readonly store: S;

	constructor(
		name: string,
		configs: tConfigList,
		urls: tUrlList,
		storeFn: (app: App<S>) => S
	) {
		super(name, configs, urls);

		this.store = storeFn(this);
	}

	/**
	 * Store services shortcut
	 */
	get services() {
		return this.store.services;
	}
}

export const createApp = function<S extends iAppStore>(
	name: string,
	configs: tConfigList,
	urls: tUrlList,
	storeFn: (app: App<S>) => S
) {
	return new App(name, configs, urls, storeFn);
};
