import OZone from './OZone';
import {isEmpty, isPlainObject} from '../utils';

export interface OApiJSON<R> {
	error: number;
	msg: string;
	data: R;
	utime: number; // response time
	stime?: number; // session expire time
	stoken?: string; // session token
}

export type OApiAddJSON<T> = OApiJSON<{
		item: T;
	}>

export type OApiGetJSON<T> = OApiJSON<{
		item: T;
		relations?: {
			[key: string]: any;
		};
	}>

export type OApiGetAllJSON<T> = OApiJSON<{
		items: T[];
		max?: number;
		page?: number;
		total?: number;
		relations?: {
			[key: string]: any;
		};
	}>

export type OApiUpdateJSON<T> = OApiJSON<{
		item: T;
	}>

export type OApiUpdateAllJSON = OApiJSON<{
		affected: number;
	}>

export type OApiDeleteJSON<T> = OApiJSON<{
		item: T;
	}>

export type OApiDeleteAllJSON = OApiJSON<{
		affected: number;
	}>

export type OApiGetRelationItemsJSON<T> = OApiJSON<{
		items: T[];
		max?: number;
		page?: number;
		total?: number;
		relations: {
			[key: string]: any;
		};
	}>

export type OApiGetRelationItemJSON<T> = OApiJSON<{
		item: T;
		relations?: {
			[key: string]: any;
		};
	}>

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

export type OApiFiltersMap = { [key: string]:  number | string | OApiFilter[] };

export interface OApiRequestOptions {
	data?: any;
	filters?: OApiFiltersMap;
	relations?: string | string[];
	collection?: string;
	order_by?: string;
	max?: number;
	page?: number;
}

export function cleanRequestOptions(options: OApiRequestOptions): OApiRequestOptions {
	const _options: OApiRequestOptions = {};
	if (typeof options.max === 'number') {
		_options.max = options.max;
	}
	if (typeof options.page === 'number') {
		_options.page = options.page;
	}

	if (typeof options.relations === 'string') {
		_options.relations = options.relations;
	}
	if (typeof options.collection === 'string') {
		_options.collection = options.collection;
	}

	if (typeof options.order_by === 'string') {
		_options['order_by'] = options.order_by;
	}

	if (isPlainObject(options.filters) && !isEmpty(options.filters)) {
		_options.filters = options.filters;
	}

	return _options;
}

export default OZone;