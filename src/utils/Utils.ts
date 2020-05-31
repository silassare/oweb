export const id = (function () {
	let _naturalId = 0;

	return (): string => 'id-' + _naturalId++;
})();

// tslint:disable-next-line: no-empty
export const noop = () => {};

// ==========TYPE CHECKERS====================================
export const isArray = Array.isArray;
export const isPlainObject = (a: any): boolean =>
	Object.prototype.toString.call(a) === '[object Object]';
export const isString = (a: any): a is string => typeof a === 'string';
export const isFunction = (a: any): a is (...args: any[]) => any =>
	typeof a === 'function';
export const isEmpty = function (a: any): boolean {
	if (isArray(a)) {
		return !a.length;
	}
	if (isPlainObject(a)) {
		return !Object.keys(a).length;
	}

	if (typeof a === 'string') {
		return a.trim().length === 0;
	}

	if (typeof a === 'number') {
		return isNaN(a);
	}

	return !a;
};

export const isNotEmpty = (a: any): boolean => !isEmpty(a);
export const toArray = (a: any): any[] => [].concat.apply([], a);
export const escapeRegExp = (str: string) =>
	str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1');
// ==========HELPERS====================================
export const callback = function (fn: any, args?: any[], ctx?: any): any {
	if (typeof fn === 'function') {
		return fn.apply(ctx, args);
	}

	return null;
};

export const forEach = function <T>(
	obj: { [key: string]: T } | T[],
	fn: (value: T, key: any) => void,
) {
	Object.keys(obj).forEach((key: string) => {
		const value: T = (obj as any)[key];
		fn(value, key);
	});
};

export const assign =
	(Object as any).assign ||
	function (target: object, source: object) {
		const to = target;
		let from, symbols;

		for (let s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (const key in from) {
				if (Object.prototype.hasOwnProperty.call(from, key)) {
					(to as any)[key] = from[key];
				}
			}

			if ('getOwnPropertySymbols' in Object) {
				symbols = (Object as any).getOwnPropertySymbols(from);
				for (let i = 0; i < symbols.length; i++) {
					if (from.propertyIsEnumerable(symbols[i])) {
						(to as any)[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};

export const clone = function <T>(a: T): T {
	return JSON.parse(JSON.stringify(a));
};

export const stringPlaceholderReplace = function (
	str: string,
	data: object,
): string {
	if (isString(str) && str.length && isPlainObject(data)) {
		const keys = Object.keys(data).sort().reverse();
		let reg;

		if (keys.length) {
			const m = keys.join('|');
			reg = new RegExp(':(' + m + ')', 'g');

			return str.replace(reg, function () {
				const replacement = (data as any)[arguments[1]];

				if (replacement === undefined) {
					return arguments[0];
				}

				return replacement;
			});
		}
	}

	return str;
};

export const textToLineString = (text: string): string => {
	const reg = /["'\\\n\r\t\u2028\u2029]/g,
		toEscapes: object = {
			'"': '"',
			"'": "'",
			'\\': '\\',
			'\n': 'n',
			'\r': 'r',
			'\t': 't',
			'\u2028': '2028',
			'\u2029': '2029',
		};

	return text.replace(reg, (match) => '\\' + (toEscapes as any)[match]);
};

// ==========MATH====================================

export const _setDigitsSep = function (x: number, sep: string): string {
	const s = String(x),
		ans = [],
		j = s.indexOf('.'),
		start = j !== -1 ? j : s.length,
		end = j !== -1 ? s.slice(start + 1) : [];
	let count = 0,
		i = start;

	for (; i >= 0; i--) {
		if (count === 3) {
			count = 0;
			ans[i] = i !== 0 ? sep + s[i] : s[i];
		} else {
			ans[i] = s[i];
		}
		count++;
	}

	return ans.concat(end).join('');
};

export const numberFormat = function (
	x: number | string,
	dec: number = 2,
	decimalSep: string = '.',
	digitsSep: string = ' ',
): string {
	if (!x) {
		return '';
	}

	let ans = parseFloat(String(x)),
		decimalPos;

	if (dec >= 0) {
		const decimalPow = Math.pow(10, dec);
		ans = Math.floor(ans * decimalPow) / decimalPow;
	}

	const n = _setDigitsSep(ans, digitsSep);
	const a = n.split('');

	decimalPos = a.lastIndexOf('.');
	if (decimalPos >= 0 && decimalSep !== '.') {
		a[decimalPos] = decimalSep;
	}

	return a.join('');
};

export const gt = function (
	x: number,
	y: number,
	eq: boolean = false,
): boolean {
	return eq ? x >= y : x > y;
};
export const lt = function (
	x: number,
	y: number,
	eq: boolean = false,
): boolean {
	return eq ? x <= y : x < y;
};

export const between = function (
	x: number,
	a: number,
	b: number,
	eq: boolean = false,
): boolean {
	return eq ? x >= a && x <= b : x > a && x < b;
};

export const isRange = function (a: any, b: any): boolean {
	return typeof a === 'number' && typeof b === 'number' && a < b;
};

export const isInDOM = function (
	element: any,
	inBody: boolean = false,
): boolean {
	let _ = element,
		last;

	while (_) {
		last = _;
		if (inBody && last === document.body) {
			break;
		}
		_ = _.parentNode;
	}

	return inBody ? last === document.body : last === document;
};

export const buildQueryString = function (
	object: object,
	prefix: string,
): string {
	const duplicates = {},
		str = [];

	for (const prop in object) {
		if (!Object.prototype.hasOwnProperty.call(object, prop)) {
			continue;
		}

		const key = prefix ? prefix + '[' + prop + ']' : prop,
			value = (object as any)[prop];
		let pair;
		if (value !== undefined) {
			if (value === null) {
				pair = encodeURIComponent(key);
			} else if (isPlainObject(value)) {
				pair = buildQueryString(value, key);
			} else if (isArray(value)) {
				pair = value
					.reduce(function (memo, item) {
						if (!(duplicates as any)[key])
							(duplicates as any)[key] = {};
						if (!(duplicates as any)[key][item]) {
							(duplicates as any)[key][item] = true;
							return memo.concat(
								encodeURIComponent(key) +
									'=' +
									encodeURIComponent(item),
							);
						}
						return memo;
					}, [])
					.join('&');
			} else {
				pair =
					encodeURIComponent(key) + '=' + encodeURIComponent(value);
			}

			str.push(pair);
		}
	}

	return str.join('&');
};

export const shuffle = (a: any[]): any[] => {
	let j, x, i;

	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}

	return a;
};

export const parseQueryString = function (str: string) {
	if (str.charAt(0) === '?') str = str.substring(1);
	if (!str.length) return {};

	const pairs = str.split('&'),
		params = {};
	for (let i = 0, len = pairs.length; i < len; i++) {
		const pair = pairs[i].split('='),
			key = decodeURIComponent(pair[0]),
			value = pair.length === 2 ? decodeURIComponent(pair[1]) : null;
		if ((params as any)[key] != null) {
			if (!isArray((params as any)[key])) {
				(params as any)[key] = [(params as any)[key]];
			}
			(params as any)[key].push(value);
		} else (params as any)[key] = value;
	}
	return params;
};

export const preventDefault = function (e: Event) {
		if (!e) {
			if (window.event) e = window.event;
			else return;
		}

		if (e.preventDefault) e.preventDefault();
		if (e.cancelBubble != null) e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
		if (window.event) e.returnValue = false;
		// if (e.cancel != null) e.cancel = true;
	},
	eventCancel = function (e: Event) {
		console.warn(
			'"Utils.eventCancel" is deprecated, use "Utils.preventDefault" instead',
		);

		preventDefault(e);
	};

export const isValidAge = (
	day: number,
	month: number,
	year: number,
	minAge: number,
	maxAge: number,
): boolean => {
	// depending on the year, calculate the number of days in the month
	const februaryDays = year % 4 === 0 ? 29 : 28,
		daysInMonth = [
			31,
			februaryDays,
			31,
			30,
			31,
			30,
			31,
			31,
			30,
			31,
			30,
			31,
		];

	// first, check the incoming month and year are valid.
	if (!month || !day || !year) {
		return false;
	}
	if (1 > month || month > 12) {
		return false;
	}
	if (year < 0) {
		return false;
	}
	if (1 > day || day > daysInMonth[month - 1]) {
		return false;
	}

	// if required, verify the current date is LATER than the incoming date.
	if (minAge !== undefined || maxAge !== undefined) {
		// we get current year
		const currentYear = new Date().getFullYear(),
			age = currentYear - year;

		if (age < 0) {
			return false;
		}
		if (age < minAge) {
			return false;
		}
		if (age > maxAge) {
			return false;
		}
	}

	return true;
};

export const fileSizeFormat = function (
	size: number /* in bytes */,
	decimalPoint: string = '.',
	thousandsSep: string = ' ',
) {
	const units = ['byte', 'Kb', 'Mb', 'Gb', 'Tb'],
		iMax = units.length;
	let i = 0,
		result = 0;

	size = parseFloat(String(size));

	while (size >= 1 && i < iMax) {
		result = size;
		size /= 1000; // not 1024
		i++;
	}

	const parts = String(result).split('.'),
		head =
			parseInt(parts[0]) === result
				? result
				: numberFormat(result, 2, decimalPoint, thousandsSep);

	return head + ' ' + units[i === 0 ? 0 : i - 1];
};

/**
 * Opens the provided url by injecting a hidden iframe that calls
 * window.open(), then removes the iframe from the DOM.
 *
 * Prevent reverse tabnabbing phishing attacks caused by _blank
 *
 * https://mathiasbynens.github.io/rel-noopener/
 *
 * https://github.com/danielstjules/blankshield/blob/6e208bf25a44bf50d1a5e85ae96fee0c015d05bc/blankshield.js#L166
 *
 * @param url
 * @param strWindowName
 * @param strWindowFeatures
 */
export const safeOpen = function (
	url: string = '',
	strWindowName: string = '',
	strWindowFeatures: string = '',
) {
	if (window.navigator.userAgent.indexOf('MSIE') !== -1) {
		// IE before 11
		const child = open.apply(window, [
			url,
			strWindowName,
			strWindowFeatures,
		]);
		if (child) {
			child.opener = null;
		}
		return child;
	}

	let iframe, iframeDoc, script, openArgs, newWin;

	iframe = document.createElement('iframe') as HTMLIFrameElement;
	iframe.style.display = 'none';
	document.body.appendChild(iframe);
	iframeDoc = (iframe.contentDocument ||
		(iframe.contentWindow as any).document) as Document;

	openArgs = '"' + url + '"';
	if (strWindowName) {
		openArgs += ', "' + strWindowName + '"';
	}
	if (strWindowFeatures) {
		openArgs += ', "' + strWindowFeatures + '"';
	}

	script = iframeDoc.createElement('script');
	script.type = 'text/javascript';
	script.text =
		'window.parent = null; window.top = null;' +
		'window.frameElement = null; var child = window.open(' +
		openArgs +
		');' +
		'if (child) { child.opener = null }';
	iframeDoc.body.appendChild(script);
	newWin = (iframe.contentWindow as any).child as Window;

	document.body.removeChild(iframe);
	return newWin;
};
