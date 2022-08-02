import { callback, logger } from '.';

export type OScriptFile = [string, () => boolean] | [string];
export type OBatchCb = (
	success: boolean,
	done: string[],
	failed: string[]
) => void;
export type OScriptLoadCb = (src: string) => void;

export function noCache(url: string): string {
	const _random = function () {
		return String(Math.random()).substring(2);
	};

	try {
		const u = new URL(url, window.location.href);
		u.searchParams.set('no_cache', _random());
		url = u.href;
	} catch (e) {
		logger.error('unable to disable caching on file', url, e);
	}

	return url;
}

export function loadScript(
	src: string,
	then?: OScriptLoadCb,
	fail?: OScriptLoadCb,
	disableCache = false
): void {
	const document = window.document,
		  isOldIE = /MSIE\s([5-9]\.0)/.test(navigator.userAgent);

	if (
		typeof document !== 'object' ||
		typeof document.createElement !== 'function'
	) {
		throw new Error('loadScript require a web environment.');
	}

	if (!document.querySelector(`script[load-path='${src}']`)) {
		if (disableCache) {
			src = noCache(src);
		}

		const script = document.createElement('script');
		script.src = src;
		script.async = false;
		script.type = 'text/javascript';
		script.onload = function onLoad() {
			callback(then, [src]);
		};
		script.onerror = function onError() {
			script.parentNode && script.parentNode.removeChild(script);
			callback(fail, [src]);
		};

		script.setAttribute('load-path', src);
		document.body.appendChild(script);
		// ie9 hack: to force script execution in order
		// since ie9 does not support script.async  = false;
		// https://github.com/h5bp/lazyweb-requests/issues/42#issue-1382146
		if (isOldIE) {
			document.body.appendChild(document.createElement('script'));
		}
	} else {
		callback(then, [src]);
	}
}

export function loadScriptBatch(
	list: OScriptFile[],
	then?: OBatchCb,
	disableCache = false
): void {
	const total = list.length;
	const failed: string[] = [];
	const done: string[] = [];
	let counter = 0;
	const updateCount = (success: boolean, src: string) => {
		counter++;
		(success ? done : failed).push(src);

		if (counter === total) {
			callback(then, [!failed.length, done, failed]);
		}
	};

	for (let i = 0; i < total; i++) {
		const src = list[i][0];
		const fn = list[i][1];

		if (typeof fn === 'function' && !fn()) {
			continue;
		}

		loadScript(
			src,
			(_src) => {
				updateCount(true, _src);
			},
			(_src) => {
				updateCount(false, _src);
			},
			disableCache
		);
	}
}
