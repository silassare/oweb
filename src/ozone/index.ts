import { INetRequestOptions } from '../OWebNet';
import { logger } from '../utils';
import OWebXHR from '../OWebXHR';

export interface IOZoneApiJSON<R> {
	error: number;
	msg: string;
	data: R;
	utime: number; // response time
	stime?: number; // session expire time
	stoken?: string; // session token
}

export interface IOZoneApiAddResponse<T>
	extends IOZoneApiJSON<{
		item: T;
	}> {}

export interface IOZoneApiGetResponse<T>
	extends IOZoneApiJSON<{
		item: T;
		relations?: {
			[key: string]: any;
		};
	}> {}

export interface IOZoneApiGetAllResponse<T>
	extends IOZoneApiJSON<{
		items: T[];
		max?: number;
		page?: number;
		total?: number;
		relations?: {
			[key: string]: any;
		};
	}> {}

export interface IOZoneApiUpdateResponse<T>
	extends IOZoneApiJSON<{
		item: T;
	}> {}

export interface IOZoneApiUpdateAllResponse
	extends IOZoneApiJSON<{
		affected: number;
	}> {}

export interface IOZoneApiDeleteResponse<T>
	extends IOZoneApiJSON<{
		item: T;
	}> {}

export interface IOZoneApiDeleteAllResponse
	extends IOZoneApiJSON<{
		affected: number;
	}> {}

export interface IOZoneApiGetRelationItemsResponse<T>
	extends IOZoneApiJSON<{
		items: T[];
		max?: number;
		page?: number;
		total?: number;
		relations: {
			[key: string]: any;
		};
	}> {}

export interface IOZoneApiGetRelationItemResponse<T>
	extends IOZoneApiJSON<{
		item: T;
		relations?: {
			[key: string]: any;
		};
	}> {}

export type tOZoneApiFilterCondition =
	| 'eq'
	| 'neq'
	| 'lt'
	| 'lte'
	| 'gt'
	| 'gte'
	| 'in'
	| 'not_in'
	| 'is_null'
	| 'is_not_null'
	| 'like'
	| 'not_like';

export type tOZoneApiFilter =
	| {
			0: tOZoneApiFilterCondition;
			1: string | string[] | number;
			2?: 'or' | 'and';
	  }
	| {
			0: 'is_null' | 'is_not_null';
			1?: 'or' | 'and';
	  };

export type tOZoneApiFiltersMap = { [key: string]: tOZoneApiFilter[] };

export interface IOZoneApiRequestOptions {
	data?: any;
	filters?: tOZoneApiFiltersMap;
	relations?: string | string[];
	collection?: string;
	order_by?: string;
	max?: number;
	page?: number;
}

/**
 * Create net instance.
 *
 * @param url The request url.
 * @param options The request options.
 */
export const ozNet = function <R extends IOZoneApiJSON<any>>(
	url: string,
	options: Partial<INetRequestOptions<R>>,
) {
	const event = function (type: string) {
		return function () {
			logger.debug('[OZone][NET] intercepted', type, ...arguments);
		};
	};

	return new OWebXHR<R>(url, {
		isGoodNews(response) {
			return Boolean(response.json && response.json.error);
		},
		...options,
	})
		.onGoodNews(event('onGoodNews'))
		.onBadNews(event('onBadNews'))
		.onFinished(event('onFinished'))
		.onError(event('onError'))
		.onDownloadProgress(event('onDownloadProgress'))
		.onUploadProgress(event('onUploadProgress'))
		.onHttpError(event('onHttpError'))
		.onHttpSuccess(event('onHttpSuccess'))
		.onResponse(event('onResponse'));
};
