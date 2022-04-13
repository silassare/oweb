import { stringPlaceholderReplace } from '../utils';
import { ONetRequestOptions } from '../OWebNet';
import OWebXHR from '../OWebXHR';
import { OApiResponse, OWebApp } from '../oweb';

const SERVICE_URL_FORMAT = ':host/:service',
	SERVICE_ENTITY_FORMAT = ':host/:service/:id',
	SERVICE_ENTITY_RELATION_FORMAT = ':host/:service/:id/:relation';

const apiCache: {
	[apiHost: string]: OZone;
} = {};

export const getApiForHost = function getApiForHost(
	url: string
): OZone | undefined {
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
		this.apiHost = _appContext.configs
			.get('OZ_API_BASE_URL')
			.replace(/\/$/g, '');
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
	request<Response extends OApiResponse<any>>(
		url: string,
		options: Partial<ONetRequestOptions<Response>> = {}
	): OWebXHR<Response> {
		const _this = this,
			api = getApiForHost(url);

		if (api) {
			if (!options.headers) {
				options.headers = {};
			}

			if (this._appContext.configs.get('OZ_API_ALLOW_REAL_METHOD_HEADER')) {
				const realMethod = (options.method || 'get').toUpperCase(),
					replaceMethods = ['PATCH', 'PUT', 'DELETE'],
					realMethodHeader = this._appContext.configs.get(
						'OZ_API_REAL_METHOD_HEADER_NAME'
					);

				// we update request method
				if (~replaceMethods.indexOf(realMethod)) {
					options.headers[realMethodHeader] = realMethod;
					options.method = 'POST';
				}
			}

			const headerName = this._appContext.configs.get('OZ_API_KEY_HEADER_NAME');

			if (!options.headers[headerName]) {
				options.headers[headerName] =
					this._appContext.configs.get('OZ_API_KEY');
			}

			if (!options.isGoodNews) {
				options.isGoodNews = (json): boolean => {
					return Boolean(json && json.error === 0);
				};
			}
			if (!options.errorResponseToDialog) {
				options.errorResponseToDialog = (response) => {
					const json = response.json;
					return json
						? { text: json.msg, data: json.data }
						: { text: 'OZ_ERROR_NETWORK' };
				};
			}
		}

		const o = this._appContext.request<Response>(url, options);

		o.onResponse(function responseHandler(response) {
			const { json } = response;
			if (json && json.stime) {
				_this._appContext.user.setSessionExpire(json.stime);
			}
			if (json && json.stoken) {
				_this._appContext.user.setSessionToken(json.stoken);
			}
		});

		return o;
	}

	/**
	 * Returns the service URI.
	 *
	 * @param serviceName The service name.
	 */
	getServiceURI(serviceName: string): string {
		return stringPlaceholderReplace(SERVICE_URL_FORMAT, {
			host: this.apiHost,
			service: serviceName,
		});
	}

	/**
	 * Returns an absolute uri string.
	 *
	 * @param serviceName The service name.
	 * @param path The path.
	 */
	toAbsoluteURI(serviceName: string, path: string): string {
		return this.getServiceURI(serviceName) + '/' + path.replace(/^\/+/, '');
	}

	/**
	 * Returns entity URI.
	 *
	 * @param serviceName The service name.
	 * @param id The entity id.
	 */
	getItemURI(serviceName: string, id: string | number): string {
		return stringPlaceholderReplace(SERVICE_ENTITY_FORMAT, {
			host: this.apiHost,
			service: serviceName,
			id,
		});
	}

	/**
	 * Returns entity relation URI.
	 *
	 * @param serviceName The service name.
	 * @param id The entity id.
	 * @param relation The relation name.
	 */
	getItemRelationURI(
		serviceName: string,
		id: string,
		relation: string
	): string {
		return stringPlaceholderReplace(SERVICE_ENTITY_RELATION_FORMAT, {
			host: this.apiHost,
			service: serviceName,
			id,
			relation,
		});
	}
}
