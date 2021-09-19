import OZone from './OZone';
import {isEmpty, isPlainObject} from '../utils';

export interface OApiResponse<R> {
	error: number;
	msg: string;
	data: R;
	utime: number; // response time
	stime?: number; // session expire time
	stoken?: string; // session token
}

export type OApiAddResponse<T> = OApiResponse<{
	item: T;
}>;

export type OApiGetResponse<T> = OApiResponse<{
	item: T;
	relations?: {
		[key: string]: any;
	};
}>;

export type OApiGetAllResponse<T> = OApiResponse<{
	items: T[];
	max?: number;
	page?: number;
	total?: number;
	relations?: {
		[key: string]: any;
	};
}>;

export type OApiUpdateResponse<T> = OApiResponse<{
	item: T;
}>;

export type OApiUpdateAllResponse = OApiResponse<{
	affected: number;
}>;

export type OApiDeleteResponse<T> = OApiResponse<{
	item: T;
}>;

export type OApiDeleteAllResponse = OApiResponse<{
	affected: number;
}>;

export type OApiGetRelationItemsResponse<T> = OApiResponse<{
	items: T[];
	max?: number;
	page?: number;
	total?: number;
	relations: {
		[key: string]: any;
	};
}>;

export type OApiGetRelationItemResponse<T> = OApiResponse<{
	item: T;
	relations?: {
		[key: string]: any;
	};
}>;

export type OApiFilterCondition =
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

export type OApiFilter =
	| {
	0: Exclude<OApiFilterCondition, 'is_null' | 'is_not_null'>;
	1: string | number | (string | number)[];
	2?: 'or' | 'and';
}
	| {
	0: 'is_null' | 'is_not_null';
	1?: 'or' | 'and';
};

export type OApiFilters = { [key: string]: number | string | OApiFilter[] };

export interface OApiServiceRequestOptions {
	data?: any;
	filters?: OApiFilters;
	relations?: string | string[];
	collection?: string;
	order_by?: string;
	max?: number;
	page?: number;

	[key: string]: unknown,
}

export function cleanRequestOptions(
	options: OApiServiceRequestOptions
): OApiServiceRequestOptions {
	const _options: OApiServiceRequestOptions = {};
	if (typeof options.max === 'number') {
		_options.max = options.max;
	}
	if (typeof options.page === 'number') {
		_options.page = options.page;
	}

	if (typeof options.relations === 'string' && !isEmpty(options.relations)) {
		_options.relations = options.relations;
	}
	if (
		typeof options.collection === 'string' &&
		!isEmpty(options.collection)
	) {
		_options.collection = options.collection;
	}

	if (typeof options.order_by === 'string' && !isEmpty(options.order_by)) {
		_options['order_by'] = options.order_by;
	}

	if (isPlainObject(options.filters) && !isEmpty(options.filters)) {
		_options.filters = options.filters;
	}

	return _options;
}

export default OZone;
