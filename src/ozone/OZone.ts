import {logger, stringPlaceholderReplace} from '../utils';
import {ONetRequestOptions} from '../OWebNet';
import OWebXHR from '../OWebXHR';
import {OApiJSON, OWebApp} from '../oweb';

const SERVICE_URL_FORMAT             = ':host/:service',
	  SERVICE_ENTITY_FORMAT          = ':host/:service/:id',
	  SERVICE_ENTITY_RELATION_FORMAT = ':host/:service/:id/:relation';

const apiCache: {
	[apiHost: string]: OZone;
} = {};

export const getApiForHost = function (url: string): OZone | undefined {
	for (const apiHost in apiCache) {
		if (url.startsWith(apiHost)) {
			return apiCache[apiHost];
		}
	}

	return undefined;
};

export default class OZone {
	private readonly apiHost: string;

	/**
	 * OZone constructor.
	 *
	 * @param _appContext
	 */
	protected constructor(private _appContext: OWebApp) {
		this.apiHost = _appContext.configs.get('OZ_API_BASE_URL').replace(/\/$/g, '');
	}

	/**
	 * Create new ozone api instance or get from cache
	 *
	 */
	static instantiate(_appContext: OWebApp): OZone {
		const apiHost = _appContext.configs.get('OZ_API_BASE_URL');

		if (!(apiHost in apiCache)) {
			apiCache[apiHost] = new OZone(_appContext);
		}

		return apiCache[apiHost];
	}

	/**
	 * Makes a request.
	 *
	 * @param url The request url
	 * @param options The request options
	 */
	request<R extends OApiJSON<any>>(
		url: string,
		options: Partial<ONetRequestOptions<R>>,
	): OWebXHR<R> {
		logger.debug('[OZone][NET] new request', url, options);

		const _this = this,
			  api   = getApiForHost(url),
			  event = function (type: string) {
				  return function (): void {
					  logger.debug('[OZone][NET] event %s', type, url, options);
				  };
			  };

		if (api) {
			if (!options.headers) {
				options.headers = {};
			}

			if (this._appContext.configs.get('OZ_API_ALLOW_REAL_METHOD_HEADER')) {
				const realMethod       = (options.method || 'get').toUpperCase(),
					  replaceMethods   = ['PATCH', 'PUT', 'DELETE'],
					  realMethodHeader = this._appContext.configs.get('OZ_API_REAL_METHOD_HEADER_NAME');

				// we update request method
				if (~replaceMethods.indexOf(realMethod)) {
					options.headers[realMethodHeader] = realMethod;
					options.method                    = 'POST';
				}
			}

			const headerName = this._appContext.configs.get('OZ_API_KEY_HEADER_NAME');

			if (!options.headers[headerName]) {
				options.headers[headerName] = this._appContext.configs.get('OZ_API_KEY');
			}

			if (!options.isGoodNews) {
				options.isGoodNews = (json): boolean => {
					return Boolean(json && json.error === 0);
				};
			}
			if (!options.serverErrorInfo) {
				options.serverErrorInfo = (response) => {
					const json = response.json as any as OApiJSON<any>;
					return {text: json.msg, data: json.data};
				};
			}
		}

		const o = new OWebXHR<R>(url, {
			withCredentials: true,
			...options,
		});

		o.onFinish(event('onFinished'))
		 .onError(event('onError'))
		 .onFail(event('onFailed'))
		 .onHttpError(event('onHttpError'))
		 .onHttpSuccess(event('onHttpSuccess'))
		 .onGoodNews(event('onGoodNews'))
		 .onBadNews(event('onBadNews'))
		 .onDownloadProgress(event('onDownloadProgress'))
		 .onUploadProgress(event('onUploadProgress'))
		 .onResponse(event('onResponse'))
		 .onResponse(function (response) {
			 const {json} = response;
			 if (json.stime) {
				 _this._appContext.user.setSessionExpire(json.stime);
			 }
			 if (json.stoken) {
				 _this._appContext.user.setSessionToken(json.stoken);
			 }
		 });

		return o;
	}

	/**
	 * Returns the service URI.
	 *
	 * @param service The service name.
	 */
	getServiceURI(service: string): string {
		return stringPlaceholderReplace(SERVICE_URL_FORMAT, {
			host: this.apiHost,
			service,
		});
	}

	/**
	 * Returns entity URI.
	 *
	 * @param service The service name.
	 * @param id The entity id.
	 */
	getItemURI(service: string, id: string | number): string {
		return stringPlaceholderReplace(SERVICE_ENTITY_FORMAT, {
			host: this.apiHost,
			service, id,
		});
	}

	/**
	 * Returns entity relation URI.
	 *
	 * @param service The service name.
	 * @param id The entity id.
	 * @param relation The relation name.
	 */
	getItemRelationURI(service: string, id: string, relation: string): string {
		return stringPlaceholderReplace(SERVICE_ENTITY_RELATION_FORMAT, {
			host: this.apiHost,
			service, id, relation,
		});
	}
}