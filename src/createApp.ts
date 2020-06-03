import OWebService from './OWebService';
import { GoblEntity } from 'gobl-utils-ts';
import OWebApp from './OWebApp';
import { tConfigList } from './OWebConfigs';
import { tUrlList } from './OWebUrl';

export interface IAppStore {
	[key: string]: any;
	services: {
		[name: string]: OWebService<GoblEntity>;
	};
}

export class App<S extends IAppStore> extends OWebApp {
	readonly store: S;

	constructor(
		name: string,
		configs: tConfigList,
		urls: tUrlList,
		storeBundler: (app: App<S>) => S,
	) {
		super(name, configs, urls);

		this.store = storeBundler(this);
	}

	/**
	 * Store services shortcut
	 */
	get services(): S['services'] {
		return this.store.services;
	}
}

export const createApp = function <S extends IAppStore>(
	name: string,
	configs: tConfigList,
	urls: tUrlList,
	storeBundler: (app: App<S>) => S,
) {
	return new App(name, configs, urls, storeBundler);
};
